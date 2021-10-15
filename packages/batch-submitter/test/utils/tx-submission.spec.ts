import { expect } from '../setup'
import { ethers as hardhatEthers } from 'hardhat'
import { ethers, BigNumber, Signer } from 'ethers'
import {
  AppendSequencerBatch,
  submitTransactionWithYNATM,
} from '../../src/utils/tx-submission'
import { Vault, ResubmissionConfig } from '../../src'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import { StaticJsonRpcProvider } from '@ethersproject/providers'

const nullFunction = () => undefined
const nullHooks = {
  beforeSendTransaction: nullFunction,
  onTransactionResponse: nullFunction,
}

describe('submitTransactionWithYNATM', async () => {
  it('calls sendTransaction, waitForTransaction, and hooks with correct inputs', async () => {
    const called = {
      sendTransaction: false,
      waitForTransaction: false,
      beforeSendTransaction: false,
      onTransactionResponse: false,
    }
    const dummyHash = 'dummy hash'
    const data = 'we here though'
    const numConfirmations = 3
    const tx = {
      data,
    } as ethers.PopulatedTransaction
    const sendTransaction = async (
      _tx: ethers.PopulatedTransaction
    ): Promise<TransactionResponse> => {
      called.sendTransaction = true
      expect(_tx.data).to.equal(tx.data)
      return {
        hash: dummyHash,
      } as TransactionResponse
    }
    const waitForTransaction = async (
      hash: string,
      _numConfirmations: number
    ): Promise<TransactionReceipt> => {
      called.waitForTransaction = true
      expect(hash).to.equal(dummyHash)
      expect(_numConfirmations).to.equal(numConfirmations)
      return {
        to: '',
        from: '',
        status: 1,
      } as TransactionReceipt
    }
    const signer = {
      sendTransaction,
    } as Signer
    const provider = {
      getGasPrice: async () => ethers.BigNumber.from(0),
      waitForTransaction,
    } as StaticJsonRpcProvider
    const hooks = {
      beforeSendTransaction: (submittingTx: ethers.PopulatedTransaction) => {
        called.beforeSendTransaction = true
        expect(submittingTx.data).to.equal(tx.data)
      },
      onTransactionResponse: (txResponse: TransactionResponse) => {
        called.onTransactionResponse = true
        expect(txResponse.hash).to.equal(dummyHash)
      },
    }
    const config: ResubmissionConfig = {
      resubmissionTimeout: 1000,
      minGasPriceInGwei: 0,
      maxGasPriceInGwei: 0,
      gasRetryIncrement: 1,
    }
    await submitTransactionWithYNATM(
      appendSequencerBatch(mockAppendSequncerBatchFun, data, 0),
      createBatchSigner(signer),
      provider,
      config,
      numConfirmations,
      hooks
    )
    expect(called.sendTransaction).to.be.true
    expect(called.waitForTransaction).to.be.true
    expect(called.beforeSendTransaction).to.be.true
    expect(called.onTransactionResponse).to.be.true
  })

  it('repeatedly increases the gas limit of the transaction when wait takes too long', async () => {
    // Make transactions take longer to be included
    // than our resubmission timeout
    const resubmissionTimeout = 100
    const txReceiptDelay = resubmissionTimeout * 3
    const data = 'hello world!'
    let lastGasPrice = BigNumber.from(0)
    // Create a transaction which has a gas price that we will watch increment
    const tx = {
      gasPrice: lastGasPrice.add(1),
      data,
    } as ethers.PopulatedTransaction
    const sendTransaction = async (
      _tx: ethers.PopulatedTransaction
    ): Promise<TransactionResponse> => {
      // Ensure the gas price is always increasing
      expect(_tx.gasPrice > lastGasPrice).to.be.true
      lastGasPrice = _tx.gasPrice
      return {
        hash: 'dummy hash'
      } as TransactionResponse
    }
    const waitForTransaction = async (
      hash: string,
      _numConfirmations: number
    ): Promise<TransactionReceipt> => {
      await new Promise((r) => setTimeout(r, txReceiptDelay))
      return {} as TransactionReceipt
    }
    const signer = {
      getGasPrice: async () => ethers.BigNumber.from(0),
      sendTransaction,
    } as Signer
    const l1Provider = {
      getGasPrice: async () => ethers.BigNumber.from(0),
      waitForTransaction,
    } as StaticJsonRpcProvider
    const config: ResubmissionConfig = {
      resubmissionTimeout,
      minGasPriceInGwei: 0,
      maxGasPriceInGwei: 1000,
      gasRetryIncrement: 1,
    }
    await submitTransactionWithYNATM(
      appendSequencerBatch(mockAppendSequncerBatchFun, data, 0),
      createBatchSigner(signer),
      l1Provider,
      config,
      0,
      nullHooks
    )
  })
})
const createBatchSigner = (signer: Signer): Vault => {
  return {
    signer,
    address: undefined,
    token: undefined,
    vault_addr: undefined,
  }
}

const mockAppendSequncerBatchFun = async (
  data: string
): Promise<ethers.PopulatedTransaction> => {
  return {
    data,
  } as ethers.PopulatedTransaction
}

const appendSequencerBatch = (
  appendSequencerBatchArg: Function,
  batchParamsArg: any,
  nonce: number
): AppendSequencerBatch => {
  return {
    appendSequencerBatch: appendSequencerBatchArg,
    batchParams: batchParamsArg,
    type: 'AppendSequencerBatch',
    nonce,
    address: undefined,
  }
}
