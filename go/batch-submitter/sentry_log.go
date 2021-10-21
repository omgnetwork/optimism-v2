package batchsubmitter

import (
	"errors"
	"io"

	"github.com/ethereum/go-ethereum/log"
	"github.com/getsentry/sentry-go"
)

var jsonFmt = log.JSONFormat()

// SentryStreamHandler creates a log.Handler that behaves similarly to
// log.StreamHandler, however it writes any log levels greater than or equal to
// LvlError to Sentry. In that case, the passed log.Record is encoded using JSON
// rather than the default terminal output, so that it can be captured for
// debugging in the Sentry dashboard.
func SentryStreamHandler(wr io.Writer, fmtr log.Format) log.Handler {
	h := log.FuncHandler(func(r *log.Record) error {
		_, err := wr.Write(fmtr.Format(r))
		// If this record is LvlError or higher, serialize the record
		// using JSON and write it to Sentry. We also capture the error
		// message separately so that it's easy to parse what the error
		// is in the dashboard.
		if r.Lvl >= log.LvlError {
			sentry.WithScope(func(scope *sentry.Scope) {
				scope.SetExtra("context", jsonFmt.Format(r))
				sentry.CaptureException(errors.New(r.Msg))
			})
		}
		return err
	})
	return log.LazyHandler(log.SyncHandler(h))
}
