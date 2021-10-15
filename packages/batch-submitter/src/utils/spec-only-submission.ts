import * as ynatm from '@eth-optimism/ynatm'
import { Vault } from '../batch-submitter/batch-submitter'
import {
  StaticJsonRpcProvider,
  TransactionReceipt,
} from '@ethersproject/providers'
import {
  AppendSequencerBatch,
  AppendStateBatch,
  TxSubmissionHooks,
} from './tx-submission'

export const submitTransaction = async (
  call: AppendStateBatch | AppendSequencerBatch,
  vault: Vault,
  provider: StaticJsonRpcProvider,
  numConfirmations: number,
  hooks: TxSubmissionHooks,
  gasPrice: number
): Promise<TransactionReceipt> => {
  let tx
  if (call.type === 'AppendStateBatch') {
    tx = await call.appendStateBatch(call.batch, call.offsetStartsAtIndex, {
      nonce: call.nonce,
    })
  } else if (call.type === 'AppendSequencerBatch') {
    tx = await call.appendSequencerBatch(call.batchParams, call.nonce)
  }

  const fullTx = {
    ...tx,
    gasPrice,
  }
  hooks.beforeSendTransaction(fullTx)

  const txResponse = await vault.signer.sendTransaction(fullTx)
  hooks.onTransactionResponse(txResponse)
  return provider.waitForTransaction(txResponse.hash, numConfirmations)
}
