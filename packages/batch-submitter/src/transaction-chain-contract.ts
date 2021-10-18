/* External Imports */
import { Contract, ethers, Signer } from 'ethers'
import {
  TransactionResponse,
  TransactionRequest,
} from '@ethersproject/abstract-provider'
import { keccak256 } from 'ethers/lib/utils'
import {
  AppendSequencerBatchParams,
  BatchContext,
  encodeAppendSequencerBatch,
  remove0x,
} from '@eth-optimism/core-utils'

export { encodeAppendSequencerBatch, BatchContext, AppendSequencerBatchParams }

/*
 * OVM_CanonicalTransactionChainContract is a wrapper around a normal Ethers contract
 * where the `appendSequencerBatch(...)` function uses a specialized encoding for improved efficiency.
 */
export class CanonicalTransactionChainContract extends Contract {
  public customPopulateTransaction = {
    appendSequencerBatch: async (
      batch: AppendSequencerBatchParams,
      nonce: number,
      signer: Signer
    ): Promise<ethers.PopulatedTransaction> => {
      const to = this.address
      const data = getEncodedCalldata(batch)
      const gasLimit = await signer.provider.estimateGas({
        to,
        from: await signer.getAddress(),
        data,
      })
      const safeGasLimit = gasLimit
        .mul(ethers.BigNumber.from(11))
        .div(ethers.BigNumber.from(10))
      return {
        nonce,
        to,
        data,
        gasLimit: safeGasLimit,
      }
    },
  }
  public async appendSequencerBatch(
    batch: AppendSequencerBatchParams,
    options?: TransactionRequest
  ): Promise<TransactionResponse> {
    return appendSequencerBatch(this, batch, options)
  }
}

/**********************
 * Internal Functions *
 *********************/

const APPEND_SEQUENCER_BATCH_METHOD_ID = keccak256(
  Buffer.from('appendSequencerBatch()')
).slice(2, 10)

const appendSequencerBatch = async (
  OVM_CanonicalTransactionChain: Contract,
  batch: AppendSequencerBatchParams,
  options?: TransactionRequest
): Promise<TransactionResponse> => {
  return OVM_CanonicalTransactionChain.signer.sendTransaction({
    to: OVM_CanonicalTransactionChain.address,
    data: getEncodedCalldata(batch),
    ...options,
  })
}

const getEncodedCalldata = (batch: AppendSequencerBatchParams): string => {
  const methodId = APPEND_SEQUENCER_BATCH_METHOD_ID
  const calldata = encodeAppendSequencerBatch(batch)
  return '0x' + remove0x(methodId) + remove0x(calldata)
}
