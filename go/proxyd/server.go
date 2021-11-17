package proxyd

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/log"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/rs/cors"
)

const (
	ContextKeyAuth  = "authorization"
	ContextKeyReqID = "req_id"
)

type Server struct {
	backendGroups      map[string]*BackendGroup
	wsBackendGroup     *BackendGroup
	wsMethodWhitelist  *StringSet
	rpcMethodMappings  map[string]string
	maxBodySize        int64
	authenticatedPaths map[string]string
	upgrader           *websocket.Upgrader
	rpcServer          *http.Server
	wsServer           *http.Server
}

func NewServer(
	backendGroups map[string]*BackendGroup,
	wsBackendGroup *BackendGroup,
	wsMethodWhitelist *StringSet,
	rpcMethodMappings map[string]string,
	maxBodySize int64,
	authenticatedPaths map[string]string,
) *Server {
	return &Server{
		backendGroups:      backendGroups,
		wsBackendGroup:     wsBackendGroup,
		wsMethodWhitelist:  wsMethodWhitelist,
		rpcMethodMappings:  rpcMethodMappings,
		maxBodySize:        maxBodySize,
		authenticatedPaths: authenticatedPaths,
		upgrader: &websocket.Upgrader{
			HandshakeTimeout: 5 * time.Second,
		},
	}
}

func (s *Server) RPCListenAndServe(host string, port int) error {
	hdlr := mux.NewRouter()
	hdlr.HandleFunc("/healthz", s.HandleHealthz).Methods("GET")
	hdlr.HandleFunc("/", s.HandleRPC).Methods("POST")
	hdlr.HandleFunc("/{authorization}", s.HandleRPC).Methods("POST")
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
	})
	addr := fmt.Sprintf("%s:%d", host, port)
	s.rpcServer = &http.Server{
		Handler: instrumentedHdlr(c.Handler(hdlr)),
		Addr:    addr,
	}
	log.Info("starting HTTP server", "addr", addr)
	return s.rpcServer.ListenAndServe()
}

func (s *Server) WSListenAndServe(host string, port int) error {
	hdlr := mux.NewRouter()
	hdlr.HandleFunc("/", s.HandleWS)
	hdlr.HandleFunc("/{authorization}", s.HandleWS)
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
	})
	addr := fmt.Sprintf("%s:%d", host, port)
	s.wsServer = &http.Server{
		Handler: instrumentedHdlr(c.Handler(hdlr)),
		Addr:    addr,
	}
	log.Info("starting WS server", "addr", addr)
	return s.wsServer.ListenAndServe()
}

func (s *Server) Shutdown() {
	if s.rpcServer != nil {
		s.rpcServer.Shutdown(context.Background())
	}
	if s.wsServer != nil {
		s.wsServer.Shutdown(context.Background())
	}
}

func (s *Server) HandleHealthz(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("OK"))
}

func (s *Server) HandleRPC(w http.ResponseWriter, r *http.Request) {
	ctx := s.populateContext(w, r)
	if ctx == nil {
		return
	}

	start := time.Now()
	log.Info("received RPC request", "req_id", GetReqID(ctx), "auth", GetAuthCtx(ctx), "client", GetLastIPAddresses(r))
	defer func() {
		log.Info("complete RPC request", "req_id", GetReqID(ctx), "elapsed_time", time.Since(start).Milliseconds(), "ms")
	}()

	req, err := ParseRPCReq(io.LimitReader(r.Body, s.maxBodySize))
	if err != nil {
		log.Info("rejected request with bad rpc request", "source", "rpc", "err", err, "r", r)
		RecordRPCError(ctx, BackendProxyd, MethodUnknown, err)
		writeRPCError(w, nil, err)
		return
	}

	group := s.rpcMethodMappings[req.Method]
	if group == "" {
		// use unknown below to prevent DOS vector that fills up memory
		// with arbitrary method names.
		log.Info(
			"blocked request for non-whitelisted method",
			"source", "rpc",
			"req_id", GetReqID(ctx),
			"method", req.Method,
		)
		RecordRPCError(ctx, BackendProxyd, MethodUnknown, ErrMethodNotWhitelisted)
		writeRPCError(w, req.ID, ErrMethodNotWhitelisted)
		return
	}

	backendRes, err := s.backendGroups[group].Forward(ctx, req)
	if err != nil {
		log.Error(
			"error forwarding RPC request",
			"method", req.Method,
			"req_id", GetReqID(ctx),
			"err", err,
		)
		writeRPCError(w, req.ID, err)
		return
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(backendRes); err != nil {
		log.Error(
			"error encoding response",
			"req_id", GetReqID(ctx),
			"err", err,
		)
		RecordRPCError(ctx, BackendProxyd, req.Method, err)
		writeRPCError(w, req.ID, err)
		return
	}
}

func (s *Server) HandleWS(w http.ResponseWriter, r *http.Request) {
	ctx := s.populateContext(w, r)
	if ctx == nil {
		return
	}

	log.Info("received WS connection", "req_id", GetReqID(ctx), "client", GetLastIPAddresses(r))
	start := time.Now()
	defer func() {
		log.Info("complete RPC request", "req_id", GetReqID(ctx), "elapsed_time", time.Since(start).Milliseconds(), "ms")
	}()

	clientConn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error("error upgrading client conn", "auth", GetAuthCtx(ctx), "req_id", GetReqID(ctx), "err", err)
		return
	}

	proxier, err := s.wsBackendGroup.ProxyWS(ctx, clientConn, s.wsMethodWhitelist)
	if err != nil {
		if errors.Is(err, ErrNoBackends) {
			RecordUnserviceableRequest(ctx, RPCRequestSourceWS)
		}
		log.Error("error dialing ws backend", "auth", GetAuthCtx(ctx), "req_id", GetReqID(ctx), "err", err)
		clientConn.Close()
		return
	}

	activeClientWsConnsGauge.WithLabelValues(GetAuthCtx(ctx)).Inc()
	go func() {
		// Below call blocks so run it in a goroutine.
		if err := proxier.Proxy(ctx); err != nil {
			log.Error("error proxying websocket", "auth", GetAuthCtx(ctx), "req_id", GetReqID(ctx), "err", err)
		}
		activeClientWsConnsGauge.WithLabelValues(GetAuthCtx(ctx)).Dec()
	}()

	log.Info("accepted WS connection", "auth", GetAuthCtx(ctx), "req_id", GetReqID(ctx))
}

func (s *Server) populateContext(w http.ResponseWriter, r *http.Request) context.Context {
	vars := mux.Vars(r)
	authorization := vars["authorization"]

	if s.authenticatedPaths == nil {
		// handle the edge case where auth is disabled
		// but someone sends in an auth key anyway
		if authorization != "" {
			log.Info("blocked authenticated request against unauthenticated proxy")
			w.WriteHeader(404)
			return nil
		}
		return context.WithValue(
			r.Context(),
			ContextKeyReqID,
			randStr(10),
		)
	}

	// if authorization == "" || s.authenticatedPaths[authorization] == "" {
	// 	log.Info("blocked unauthorized request", "authorization", authorization)
	// 	w.WriteHeader(401)
	// 	return nil
	// }

	ctx := context.WithValue(r.Context(), ContextKeyAuth, s.authenticatedPaths[authorization])
	return context.WithValue(
		ctx,
		ContextKeyReqID,
		randStr(10),
	)
}

func writeRPCError(w http.ResponseWriter, id *int, err error) {
	enc := json.NewEncoder(w)
	w.WriteHeader(200)

	var body *RPCRes
	if r, ok := err.(*RPCErr); ok {
		body = NewRPCErrorRes(id, r)
	} else {
		body = NewRPCErrorRes(id, &RPCErr{
			Code:    JSONRPCErrorInternal,
			Message: "internal error",
		})
	}
	if err := enc.Encode(body); err != nil {
		log.Error("error writing rpc error", "err", err)
	}
}

func instrumentedHdlr(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		httpRequestsTotal.Inc()
		respTimer := prometheus.NewTimer(httpRequestDurationSumm)
		h.ServeHTTP(w, r)
		respTimer.ObserveDuration()
	}
}

func GetAuthCtx(ctx context.Context) string {
	authUser, ok := ctx.Value(ContextKeyAuth).(string)
	if !ok {
		return "none"
	}

	return authUser
}

func GetReqID(ctx context.Context) string {
	reqId, ok := ctx.Value(ContextKeyReqID).(string)
	if !ok {
		return ""
	}
	return reqId
}

// GetLastIPAddresses returns comma separated list of remote IP addresses
func GetLastIPAddresses(r *http.Request) string {
	ips := []string{r.RemoteAddr}

	addresses := r.Header.Get("X-Forwarded-For")
	if len(addresses) > 0 {
		ips = append(ips, strings.Split(addresses, ",")...)
	}

	return ips[len(ips)-1]
}
