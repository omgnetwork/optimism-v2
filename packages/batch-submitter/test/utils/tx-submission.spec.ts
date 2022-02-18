import { expect } from '../setup'
import { ethers, BigNumber, Signer } from 'ethers'
import { submitTransactionWithYNATM } from '../../src/utils/tx-submission'
import { ResubmissionConfig } from '../../src'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'

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
    const numConfirmations = 3
    const tx = {
      data: 'we here though',
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
      getGasPrice: async () => ethers.BigNumber.from(0),
      sendTransaction,
      provider: {
        waitForTransaction,
      },
    } as Signer
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
      tx,
      signer,
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
    const numConfirmations = 3
    let lastGasPrice = BigNumber.from(0)
    // Create a transaction which has a gas price that we will watch increment
    const tx = {
      gasPrice: lastGasPrice.add(1),
      data: 'hello world!',
    } as ethers.PopulatedTransaction
    const sendTransaction = async (
      _tx: ethers.PopulatedTransaction
    ): Promise<TransactionResponse> => {
      // Ensure the gas price is always increasing
      expect(_tx.gasPrice > lastGasPrice).to.be.true
      lastGasPrice = _tx.gasPrice
      return {
        hash: 'dummy hash',
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
      provider: {
        waitForTransaction,
      },
    } as Signer
    const config: ResubmissionConfig = {
      resubmissionTimeout,
      minGasPriceInGwei: 0,
      maxGasPriceInGwei: 1000,
      gasRetryIncrement: 1,
    }
    await submitTransactionWithYNATM(tx, signer, config, 0, nullHooks)
  })
})
