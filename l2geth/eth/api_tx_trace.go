package eth

import (
  "context"
  "fmt"

  "github.com/ethereum/go-ethereum/common"
  "github.com/ethereum/go-ethereum/core"
  "github.com/ethereum/go-ethereum/core/state"
  "github.com/ethereum/go-ethereum/core/types"
  "github.com/ethereum/go-ethereum/core/vm"
  "github.com/ethereum/go-ethereum/log"

  "github.com/DeBankDeFi/eth/txtrace"
)

// PublicTxTraceAPI provides an API to tracing transaction or block information.
// // It offers only methods that operate on public data that is freely available to anyone.
type PublicTxTraceAPI struct {
  e *Ethereum
}

// NewPublicTxTraceAPI creates a new trace API.
func NewPublicTxTraceAPI(e *Ethereum) *PublicTxTraceAPI {
  return &PublicTxTraceAPI{e: e}
}

// Transaction trace_transaction function returns transaction traces.
func (api *PublicTxTraceAPI) Transaction(ctx context.Context, txHash common.Hash) (interface{}, error) {
  if api.e.blockchain == nil {
    return []byte{}, fmt.Errorf("blockchain corruput")
  }

  tx, blockHash, blockNumber, index, err := api.e.APIBackend.GetTransaction(ctx, txHash)
  if err != nil {
    return nil, err
  }
  if tx == nil {
    return nil, fmt.Errorf("transaction %#v not found", txHash)
  }
  // It shouldn't happen in practice.
  if blockNumber == 0 {
    return nil, fmt.Errorf("genesis is not traceable")
  }

  txctx := &txTraceContext{
    tx:    tx,
    index: int(index),
    block: blockHash,
  }

  msg, vmctx, statedb, err := computeTxEnv(api.e, blockHash, int(index), defaultTraceReexec)
  if err != nil {
    return nil, err
  }
  // Trace the transaction and return
  return api.traceTx(ctx, msg, vmctx, txctx, statedb)
}

// traceTx configures a new tracer according to the provided configuration, and
// executes the given message in the provided environment. The return value will
// be as parity's one.
func (api *PublicTxTraceAPI) traceTx(ctx context.Context, message core.Message, vmctx vm.Context, txctx *txTraceContext, statedb *state.StateDB) (interface{}, error) {
  var (
    tracer *txtrace.StructLogger
    err    error
  )

  // Construct trace logger to record result as parity's one
  tracer = txtrace.NewTraceStructLogger(nil)

  // Fill essential info into logger
  tracer.SetFrom(message.From())
  tracer.SetTo(message.To())
  tracer.SetValue(*message.Value())
  tracer.SetGasUsed(message.Gas())
  tracer.SetBlockHash(txctx.block)
  tracer.SetBlockNumber(vmctx.BlockNumber)
  tracer.SetTx(txctx.tx.Hash())
  tracer.SetTxIndex(uint(txctx.index))

  // Run the transaction with tracing enabled.
  vmenv := vm.NewEVM(vmctx, statedb, api.e.blockchain.Config(), vm.Config{Debug: true, Tracer: tracer})
  _, _, failed, err := core.ApplyMessage(vmenv, message, new(core.GasPool).AddGas(message.Gas()))
  if err != nil {
    return nil, fmt.Errorf("tracing failed: %v", err)
  }
  if failed {
    log.Warn("apply message with transaction tracing failed", "txHash")
  }

  tracer.Finalize()
  return tracer.GetResult(), nil
}

// txTraceContext is the contextual infos about a transaction before it gets run.
type txTraceContext struct {
  tx    *types.Transaction
  index int         // Index of the transaction within the block
  block common.Hash // Hash of the block containing the transaction
}
