package eth

import (
  "context"
  "math/big"

  "github.com/ethereum-optimism/optimism/l2geth/common"
  "github.com/ethereum-optimism/optimism/l2geth/common/hexutil"
  "github.com/ethereum-optimism/optimism/l2geth/core"
  "github.com/ethereum-optimism/optimism/l2geth/core/state"
  "github.com/ethereum-optimism/optimism/l2geth/core/types"
  "github.com/ethereum-optimism/optimism/l2geth/core/vm"
  "github.com/ethereum-optimism/optimism/l2geth/rpc"
  ec "github.com/ethereum/go-ethereum/common"

  "github.com/DeBankDeFi/eth/txtrace"
)

type PreExecAPI struct {
  e *Ethereum
}

func NewPreExecAPI(e *Ethereum) *PreExecAPI {
  return &PreExecAPI{e: e}
}

type PreExecTx struct {
  ChainId                                     *big.Int
  From, To, Data, Value, Gas, GasPrice, Nonce string
}

type preData struct {
  block   *types.Block
  tx      *types.Transaction
  msg     types.Message
  stateDb *state.StateDB
  header  *types.Header
}

func (api *PreExecAPI) getBlockAndMsg(origin *PreExecTx, number *big.Int) (*types.Block, types.Message) {
  fromAddr := common.HexToAddress(origin.From)
  toAddr := common.HexToAddress(origin.To)

  tx := types.NewTransaction(
    hexutil.MustDecodeUint64(origin.Nonce),
    toAddr,
    hexutil.MustDecodeBig(origin.Value),
    hexutil.MustDecodeUint64(origin.Gas),
    hexutil.MustDecodeBig(origin.GasPrice),
    hexutil.MustDecode(origin.Data),
  )

  parentHeader := api.e.blockchain.GetHeaderByNumber(number.Uint64())

  number.Add(number, big.NewInt(1))
  block := types.NewBlock(
    &types.Header{Number: number},
    []*types.Transaction{tx}, nil, nil)

  msg := types.NewMessage(
    fromAddr,
    &toAddr,
    hexutil.MustDecodeUint64(origin.Nonce),
    hexutil.MustDecodeBig(origin.Value),
    hexutil.MustDecodeUint64(origin.Gas),
    hexutil.MustDecodeBig(origin.GasPrice),
    hexutil.MustDecode(origin.Data),
    false, number, parentHeader.Time, []byte{0}, types.QueueOriginSequencer,
  )

  return block, msg
}

func (api *PreExecAPI) prepareData(ctx context.Context, origin *PreExecTx) (*preData, error) {
  var (
    d   preData
    err error
  )
  bc := api.e.blockchain
  d.header, err = api.e.APIBackend.HeaderByNumber(ctx, rpc.LatestBlockNumber)
  if err != nil {
    return nil, err
  }
  latestNumber := d.header.Number
  parent := api.e.blockchain.GetBlockByNumber(latestNumber.Uint64())
  d.stateDb, err = state.New(parent.Header().Root, bc.StateCache())
  if err != nil {
    return nil, err
  }
  d.block, d.msg = api.getBlockAndMsg(origin, latestNumber)
  d.tx = d.block.Transactions()[0]
  return &d, nil
}

func (api *PreExecAPI) GetLogs(ctx context.Context, origin *PreExecTx) (*types.Receipt, error) {
  var (
    bc = api.e.blockchain
  )
  d, err := api.prepareData(ctx, origin)
  if err != nil {
    return nil, err
  }
  gas := d.tx.Gas()
  gp := new(core.GasPool).AddGas(gas)

  d.stateDb.Prepare(d.tx.Hash(), d.block.Hash(), 0)
  receipt, err := core.ApplyTransactionForPreExec(
    bc.Config(), bc, nil, gp, d.stateDb, d.header, d.tx, d.msg, &gas, *bc.GetVMConfig())
  if err != nil {
    return nil, err
  }
  return receipt, nil
}

// TraceTransaction tracing pre-exec transaction object.
func (api *PreExecAPI) TraceTransaction(ctx context.Context, origin *PreExecTx) (interface{}, error) {
  var (
    bc     = api.e.blockchain
    tracer *txtrace.StructLogger
    err    error
  )

  tracer = txtrace.NewTraceStructLogger(nil)
  d, err := api.prepareData(ctx, origin)
  if err != nil {
    return nil, err
  }
  vmctx := core.NewEVMContext(d.msg, d.header, bc, nil)

  to := ec.BytesToAddress(d.msg.To().Bytes())
  // Fill essential info into logger
  tracer.SetFrom(ec.BytesToAddress(d.msg.From().Bytes()))
  tracer.SetTo(&to)
  tracer.SetValue(*d.msg.Value())
  tracer.SetGasUsed(d.msg.Gas())
  tracer.SetBlockHash(ec.BytesToHash(d.block.Hash().Bytes()))
  tracer.SetBlockNumber(vmctx.BlockNumber)
  tracer.SetTx(ec.BytesToHash(d.tx.Hash().Bytes()))
  tracer.SetTxIndex(uint(0))
  // Run the transaction with tracing enabled.
  vmenv := vm.NewEVM(vmctx, d.stateDb, bc.Config(), vm.Config{Debug: true, Tracer: tracer})
  txIndex := 0
  // Call Prepare to clear out the statedb access list
  d.stateDb.Prepare(d.tx.Hash(), d.block.Hash(), txIndex)

  _, _, failed, err := core.ApplyMessage(vmenv, d.msg, new(core.GasPool).AddGas(d.msg.Gas()))
  if err != nil || failed {
    return nil, err
  }
  // Depending on the tracer type, format and return the output.
  tracer.Finalize()
  return tracer.GetResult(), nil
}
