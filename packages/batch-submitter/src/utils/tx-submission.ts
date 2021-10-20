import { ethers, PopulatedTransaction, BigNumber } from 'ethers'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import * as ynatm from '@eth-optimism/ynatm'
import { Vault } from '../batch-submitter/batch-submitter'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import {
  submitToVault,
  VaultTransactionResponse,
  VaultPopulatedTransaction,
} from '../batch-submitter/vault'
export interface ResubmissionConfig {
  resubmissionTimeout: number
  minGasPriceInGwei: number
  maxGasPriceInGwei: number
  gasRetryIncrement: number
}

export interface AppendStateBatch {
  batch: any[]
  offsetStartsAtIndex: number
  nonce: number
  type: 'AppendStateBatch'
  address: string
}

export interface AppendSequencerBatch {
  batchParams: any
  type: 'AppendSequencerBatch'
  address: string
  nonce: number
}

export interface TxSubmissionHooks {
  beforeSendTransaction: (
    tx: PopulatedTransaction | VaultPopulatedTransaction
  ) => void
  onTransactionResponse: (
    txResponse: TransactionResponse | VaultTransactionResponse
  ) => void
}

const getGasPriceInGwei = async (
  provider: StaticJsonRpcProvider
): Promise<number> => {
  return parseInt(
    ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei'),
    10
  )
}

export const submitTransactionWithYNATM = async (
  call: AppendStateBatch | AppendSequencerBatch,
  vault: Vault,
  provider: StaticJsonRpcProvider,
  config: ResubmissionConfig,
  numConfirmations: number,
  hooks: TxSubmissionHooks
): Promise<TransactionReceipt> => {
  const sendTxAndWaitForReceipt = async (
    gasPrice
  ): Promise<TransactionReceipt> => {
    const transactionHash = await submitToVault(call, vault, hooks, gasPrice)
    return provider.waitForTransaction(transactionHash, numConfirmations)
  }
  const minGasPrice = await getGasPriceInGwei(provider)
  const receipt = await ynatm.send({
    sendTransactionFunction: sendTxAndWaitForReceipt,
    minGasPrice: ynatm.toGwei(minGasPrice),
    maxGasPrice: ynatm.toGwei(config.maxGasPriceInGwei),
    gasPriceScalingFunction: ynatm.LINEAR(config.gasRetryIncrement),
    delay: config.resubmissionTimeout,
  })
  return receipt
}

export interface TransactionSubmitter {
  submitTransaction(
    tx: AppendStateBatch | AppendSequencerBatch,
    hooks?: TxSubmissionHooks
  ): Promise<TransactionReceipt>
}

export class YnatmTransactionSubmitter implements TransactionSubmitter {
  constructor(
    readonly vault: Vault,
    readonly provider: StaticJsonRpcProvider,
    readonly ynatmConfig: ResubmissionConfig,
    readonly numConfirmations: number
  ) {}

  public async submitTransaction(
    tx: AppendStateBatch | AppendSequencerBatch,
    hooks?: TxSubmissionHooks
  ): Promise<TransactionReceipt> {
    if (!hooks) {
      hooks = {
        beforeSendTransaction: () => undefined,
        onTransactionResponse: () => undefined,
      }
    }
    return submitTransactionWithYNATM(
      tx,
      this.vault,
      this.provider,
      this.ynatmConfig,
      this.numConfirmations,
      hooks
    )
  }
}
