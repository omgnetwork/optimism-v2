package proxyd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"math/rand"
	"net/http"
	"time"

	"github.com/ethereum/go-ethereum/log"
	"github.com/gorilla/websocket"
	"github.com/prometheus/client_golang/prometheus"
)

const (
	JSONRPCVersion       = "2.0"
	JSONRPCErrorInternal = -32000
)

var (
	ErrInvalidRequest = &RPCErr{
		Code:    -32601,
		Message: "invalid request",
	}
	ErrParseErr = &RPCErr{
		Code:    -32700,
		Message: "parse error",
	}
	ErrInternal = &RPCErr{
		Code:    JSONRPCErrorInternal,
		Message: "internal error",
	}
	ErrMethodNotWhitelisted = &RPCErr{
		Code:    JSONRPCErrorInternal - 1,
		Message: "rpc method is not whitelisted",
	}
	ErrBackendOffline = &RPCErr{
		Code:    JSONRPCErrorInternal - 10,
		Message: "backend offline",
	}
	ErrNoBackends = &RPCErr{
		Code:    JSONRPCErrorInternal - 11,
		Message: "no backends available for method",
	}
	ErrBackendOverCapacity = &RPCErr{
		Code:    JSONRPCErrorInternal - 12,
		Message: "backend is over capacity",
	}
	ErrBackendBadResponse = &RPCErr{
		Code:    JSONRPCErrorInternal - 13,
		Message: "backend returned an invalid response",
	}
)

type Backend struct {
	Name                 string
	rpcURL               string
	wsURL                string
	authUsername         string
	authPassword         string
	redis                Redis
	client               *http.Client
	dialer               *websocket.Dialer
	maxRetries           int
	maxResponseSize      int64
	maxRPS               int
	maxWSConns           int
	outOfServiceInterval time.Duration
}

type BackendOpt func(b *Backend)

func WithBasicAuth(username, password string) BackendOpt {
	return func(b *Backend) {
		b.authUsername = username
		b.authPassword = password
	}
}

func WithTimeout(timeout time.Duration) BackendOpt {
	return func(b *Backend) {
		b.client.Timeout = timeout
	}
}

func WithMaxRetries(retries int) BackendOpt {
	return func(b *Backend) {
		b.maxRetries = retries
	}
}

func WithMaxResponseSize(size int64) BackendOpt {
	return func(b *Backend) {
		b.maxResponseSize = size
	}
}

func WithOutOfServiceDuration(interval time.Duration) BackendOpt {
	return func(b *Backend) {
		b.outOfServiceInterval = interval
	}
}

func WithMaxRPS(maxRPS int) BackendOpt {
	return func(b *Backend) {
		b.maxRPS = maxRPS
	}
}

func WithMaxWSConns(maxConns int) BackendOpt {
	return func(b *Backend) {
		b.maxWSConns = maxConns
	}
}

func NewBackend(
	name string,
	rpcURL string,
	wsURL string,
	redis Redis,
	opts ...BackendOpt,
) *Backend {
	backend := &Backend{
		Name:            name,
		rpcURL:          rpcURL,
		wsURL:           wsURL,
		redis:           redis,
		maxResponseSize: math.MaxInt64,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
		dialer: &websocket.Dialer{},
	}

	for _, opt := range opts {
		opt(backend)
	}

	return backend
}

func (b *Backend) Forward(ctx context.Context, req *RPCReq) (*RPCRes, error) {
	// if !b.Online() {
	// 	RecordRPCError(ctx, b.Name, req.Method, ErrBackendOffline)
	// 	return nil, ErrBackendOffline
	// }
	if b.IsRateLimited() {
		RecordRPCError(ctx, b.Name, req.Method, ErrBackendOverCapacity)
		return nil, ErrBackendOverCapacity
	}

	var lastError error
	// <= to account for the first attempt not technically being
	// a retry
	for i := 0; i <= b.maxRetries; i++ {
		RecordRPCForward(ctx, b.Name, req.Method, RPCRequestSourceHTTP)
		respTimer := prometheus.NewTimer(rpcBackendRequestDurationSumm.WithLabelValues(b.Name, req.Method))
		res, err := b.doForward(req)
		if err != nil {
			lastError = err
			log.Warn(
				"backend request failed, trying again",
				"name", b.Name,
				"req_id", GetReqID(ctx),
				"err", err,
			)
			respTimer.ObserveDuration()
			RecordRPCError(ctx, b.Name, req.Method, err)
			time.Sleep(calcBackoff(i))
			continue
		}
		respTimer.ObserveDuration()
		if res.IsError() {
			RecordRPCError(ctx, b.Name, req.Method, res.Error)
			log.Info(
				"backend responded with RPC error",
				"code", res.Error.Code,
				"msg", res.Error.Message,
				"req_id", GetReqID(ctx),
				"source", "rpc",
				"auth", GetAuthCtx(ctx),
			)
		} else {
			log.Info("forwarded RPC request",
				"method", req.Method,
				"auth", GetAuthCtx(ctx),
				"req_id", GetReqID(ctx),
			)
		}
		return res, nil
	}

	b.setOffline()
	return nil, wrapErr(lastError, "permanent error forwarding request")
}

func (b *Backend) ProxyWS(clientConn *websocket.Conn, methodWhitelist *StringSet) (*WSProxier, error) {
	// if !b.Online() {
	// 	return nil, ErrBackendOffline
	// }
	if b.IsWSSaturated() {
		return nil, ErrBackendOverCapacity
	}

	backendConn, _, err := b.dialer.Dial(b.wsURL, nil)
	if err != nil {
		b.setOffline()
		if err := b.redis.DecBackendWSConns(b.Name); err != nil {
			log.Error("error decrementing backend ws conns", "name", b.Name, "err", err)
		}
		return nil, wrapErr(err, "error dialing backend")
	}

	activeBackendWsConnsGauge.WithLabelValues(b.Name).Inc()
	return NewWSProxier(b, clientConn, backendConn, methodWhitelist), nil
}

func (b *Backend) Online() bool {
	online, err := b.redis.IsBackendOnline(b.Name)
	if err != nil {
		log.Warn(
			"error getting backend availability, assuming it is offline",
			"name", b.Name,
			"err", err,
		)
		return false
	}
	return online
}

func (b *Backend) IsRateLimited() bool {
	if b.maxRPS == 0 {
		return false
	}

	usedLimit, err := b.redis.IncBackendRPS(b.Name)
	if err != nil {
		log.Error(
			"error getting backend used rate limit, assuming limit is exhausted",
			"name", b.Name,
			"err", err,
		)
		return true
	}

	return b.maxRPS < usedLimit
}

func (b *Backend) IsWSSaturated() bool {
	if b.maxWSConns == 0 {
		return false
	}

	incremented, err := b.redis.IncBackendWSConns(b.Name, b.maxWSConns)
	if err != nil {
		log.Error(
			"error getting backend used ws conns, assuming limit is exhausted",
			"name", b.Name,
			"err", err,
		)
		return true
	}

	return !incremented
}

func (b *Backend) setOffline() {
	err := b.redis.SetBackendOffline(b.Name, b.outOfServiceInterval)
	if err != nil {
		log.Warn(
			"error setting backend offline",
			"name", b.Name,
			"err", err,
		)
	}
}

func (b *Backend) doForward(rpcReq *RPCReq) (*RPCRes, error) {
	body := mustMarshalJSON(rpcReq)

	httpReq, err := http.NewRequest("POST", b.rpcURL, bytes.NewReader(body))
	if err != nil {
		return nil, wrapErr(err, "error creating backend request")
	}

	if b.authPassword != "" {
		httpReq.SetBasicAuth(b.authUsername, b.authPassword)
	}

	httpReq.Header.Set("content-type", "application/json")

	httpRes, err := b.client.Do(httpReq)
	if err != nil {
		return nil, wrapErr(err, "error in backend request")
	}

	// Alchemy returns a 400 on bad JSONs, so handle that case
	if httpRes.StatusCode != 200 && httpRes.StatusCode != 400 {
		return nil, fmt.Errorf("response code %d", httpRes.StatusCode)
	}

	defer httpRes.Body.Close()
	resB, err := ioutil.ReadAll(io.LimitReader(httpRes.Body, b.maxResponseSize))
	if err != nil {
		return nil, wrapErr(err, "error reading response body")
	}

	res := new(RPCRes)
	if err := json.Unmarshal(resB, res); err != nil {
		return nil, ErrBackendBadResponse
	}

	return res, nil
}

type BackendGroup struct {
	Name     string
	Backends []*Backend
}

func (b *BackendGroup) Forward(ctx context.Context, rpcReq *RPCReq) (*RPCRes, error) {
	rpcRequestsTotal.Inc()

	for _, back := range b.Backends {
		res, err := back.Forward(ctx, rpcReq)
		if errors.Is(err, ErrMethodNotWhitelisted) {
			return nil, err
		}
		if errors.Is(err, ErrBackendOffline) {
			log.Warn(
				"skipping offline backend",
				"name", back.Name,
				"auth", GetAuthCtx(ctx),
				"req_id", GetReqID(ctx),
			)
			continue
		}
		if errors.Is(err, ErrBackendOverCapacity) {
			log.Warn(
				"skipping over-capacity backend",
				"name", back.Name,
				"auth", GetAuthCtx(ctx),
				"req_id", GetReqID(ctx),
			)
			continue
		}
		if err != nil {
			log.Error(
				"error forwarding request to backend",
				"name", b.Name,
				"req_id", GetReqID(ctx),
				"auth", GetAuthCtx(ctx),
				"err", err,
			)
			continue
		}
		return res, nil
	}

	RecordUnserviceableRequest(ctx, RPCRequestSourceHTTP)
	return nil, ErrNoBackends
}

func (b *BackendGroup) ProxyWS(ctx context.Context, clientConn *websocket.Conn, methodWhitelist *StringSet) (*WSProxier, error) {
	for _, back := range b.Backends {
		proxier, err := back.ProxyWS(clientConn, methodWhitelist)
		if errors.Is(err, ErrBackendOffline) {
			log.Warn(
				"skipping offline backend",
				"name", back.Name,
				"req_id", GetReqID(ctx),
				"auth", GetAuthCtx(ctx),
			)
			continue
		}
		if errors.Is(err, ErrBackendOverCapacity) {
			log.Warn(
				"skipping over-capacity backend",
				"name", back.Name,
				"req_id", GetReqID(ctx),
				"auth", GetAuthCtx(ctx),
			)
			continue
		}
		if err != nil {
			log.Warn(
				"error dialing ws backend",
				"name", back.Name,
				"req_id", GetReqID(ctx),
				"auth", GetAuthCtx(ctx),
				"err", err,
			)
			continue
		}
		return proxier, nil
	}

	return nil, ErrNoBackends
}

func calcBackoff(i int) time.Duration {
	jitter := float64(rand.Int63n(250))
	ms := math.Min(math.Pow(2, float64(i))*1000+jitter, 10000)
	return time.Duration(ms) * time.Millisecond
}

type WSProxier struct {
	backend         *Backend
	clientConn      *websocket.Conn
	backendConn     *websocket.Conn
	methodWhitelist *StringSet
}

func NewWSProxier(backend *Backend, clientConn, backendConn *websocket.Conn, methodWhitelist *StringSet) *WSProxier {
	return &WSProxier{
		backend:         backend,
		clientConn:      clientConn,
		backendConn:     backendConn,
		methodWhitelist: methodWhitelist,
	}
}

func (w *WSProxier) Proxy(ctx context.Context) error {
	errC := make(chan error, 2)
	go w.clientPump(ctx, errC)
	go w.backendPump(ctx, errC)
	err := <-errC
	w.close()
	return err
}

func (w *WSProxier) clientPump(ctx context.Context, errC chan error) {
	for {
		outConn := w.backendConn
		// Block until we get a message.
		msgType, msg, err := w.clientConn.ReadMessage()
		if err != nil {
			errC <- err
			outConn.WriteMessage(websocket.CloseMessage, formatWSError(err))
			return
		}

		RecordWSMessage(ctx, w.backend.Name, SourceClient)

		// Route control messages to the backend. These don't
		// count towards the total RPC requests count.
		if msgType != websocket.TextMessage && msgType != websocket.BinaryMessage {
			err := outConn.WriteMessage(msgType, msg)
			if err != nil {
				errC <- err
				return
			}
			continue
		}

		rpcRequestsTotal.Inc()

		// Don't bother sending invalid requests to the backend,
		// just handle them here.
		reqs, err := w.prepareClientMsg(msg)
		for _, req := range reqs {
			if err != nil {
				method := MethodUnknown

				method = req.Method

				log.Info(
					"error preparing client message",
					"auth", GetAuthCtx(ctx),
					"req_id", GetReqID(ctx),
					"err", err,
				)
				outConn = w.clientConn
				msg = mustMarshalJSON(NewRPCErrorRes(req.ID, err))
				RecordRPCError(ctx, BackendProxyd, method, err)
			} else {
				RecordRPCForward(ctx, w.backend.Name, req.Method, RPCRequestSourceWS)
				log.Info(
					"forwarded WS message to backend",
					"method", req.Method,
					"auth", GetAuthCtx(ctx),
					"req_id", GetReqID(ctx),
				)
			}
		}

		err = outConn.WriteMessage(msgType, msg)
		if err != nil {
			errC <- err
			return
		}
	}
}

func (w *WSProxier) backendPump(ctx context.Context, errC chan error) {
	for {
		// Block until we get a message.
		msgType, msg, err := w.backendConn.ReadMessage()
		if err != nil {
			errC <- err
			w.clientConn.WriteMessage(websocket.CloseMessage, formatWSError(err))
			return
		}

		RecordWSMessage(ctx, w.backend.Name, SourceBackend)

		// Route control messages directly to the client.
		if msgType != websocket.TextMessage && msgType != websocket.BinaryMessage {
			err := w.clientConn.WriteMessage(msgType, msg)
			if err != nil {
				errC <- err
				return
			}
			continue
		}

		res, err := w.parseBackendMsg(msg)
		if err != nil {
			msg = mustMarshalJSON(NewRPCErrorRes(res.ID, err))
		}
		if res.IsError() {
			log.Info(
				"backend responded with RPC error",
				"code", res.Error.Code,
				"msg", res.Error.Message,
				"source", "ws",
				"auth", GetAuthCtx(ctx),
				"req_id", GetReqID(ctx),
			)
			RecordRPCError(ctx, w.backend.Name, MethodUnknown, res.Error)
		} else {
			log.Info(
				"forwarded WS message to client",
				"auth", GetAuthCtx(ctx),
				"req_id", GetReqID(ctx),
			)
		}

		err = w.clientConn.WriteMessage(msgType, msg)
		if err != nil {
			errC <- err
			return
		}
	}
}

func (w *WSProxier) close() {
	w.clientConn.Close()
	w.backendConn.Close()
	if err := w.backend.redis.DecBackendWSConns(w.backend.Name); err != nil {
		log.Error("error decrementing backend ws conns", "name", w.backend.Name, "err", err)
	}
	activeBackendWsConnsGauge.WithLabelValues(w.backend.Name).Dec()
}

func (w *WSProxier) prepareClientMsg(msg []byte) ([]RPCReq, error) {
	reqs, _, err := ParseRPCReq(bytes.NewReader(msg))
	for _, req := range reqs {
		if err != nil {
			return nil, err
		}

		if !w.methodWhitelist.Has(req.Method) {
			return reqs, ErrMethodNotWhitelisted
		}

		if w.backend.IsRateLimited() {
			return reqs, ErrBackendOverCapacity
		}
	}
	return reqs, nil
}

func (w *WSProxier) parseBackendMsg(msg []byte) (*RPCRes, error) {
	res, err := ParseRPCRes(bytes.NewReader(msg))
	if err != nil {
		log.Warn("error parsing RPC response", "source", "ws", "err", err)
		return res, ErrBackendBadResponse
	}
	return res, nil
}

func mustMarshalJSON(in interface{}) []byte {
	out, err := json.Marshal(in)
	if err != nil {
		panic(err)
	}
	return out
}

func formatWSError(err error) []byte {
	m := websocket.FormatCloseMessage(websocket.CloseNormalClosure, fmt.Sprintf("%v", err))
	if e, ok := err.(*websocket.CloseError); ok {
		if e.Code != websocket.CloseNoStatusReceived {
			m = websocket.FormatCloseMessage(e.Code, e.Text)
		}
	}
	return m
}
