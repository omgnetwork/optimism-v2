import { expect } from '../setup'
import ServerMock from 'mock-http-server'
import { ethers as hardhatEthers } from 'hardhat'
import { ethers, BigNumber, Signer } from 'ethers'
import {
  AppendSequencerBatch,
  submitTransactionWithYNATM,
} from '../../src/utils/tx-submission'
import {
  Vault,
  ResubmissionConfig,
  BatchContext,
  AppendSequencerBatchParams,
} from '../../src'
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
const DUMMY_HASH = 'dummy hash'
const path =
  '/v1/immutability-eth-plugin/wallets/sequencer/accounts/0x654321/ovm/appendSequencerBatch'
const fullUrl = 'http://localhost:9000' + path
describe('submitTransactionWithYNATM', async () => {
  const httpServer = new ServerMock({ host: 'localhost', port: 9000 })
  beforeEach((done) => {
    httpServer.start(done)
    httpServer.on({
      method: 'PUT',
      path,
      reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          data: { transaction_hash: DUMMY_HASH },
        }),
      },
    })
  })

  afterEach((done) => {
    httpServer.stop(done)
  })
  it('calls sendTransaction, waitForTransaction, and hooks with correct inputs', async () => {
    const called = {
      sendTransaction: false,
      waitForTransaction: false,
      beforeSendTransaction: false,
      onTransactionResponse: false,
    }
    const data = 'we here though'
    const numConfirmations = 3
    const tx = {
      data,
    } as ethers.PopulatedTransaction
    const waitForTransaction = async (
      hash: string,
      _numConfirmations: number
    ): Promise<TransactionReceipt> => {
      called.waitForTransaction = true
      expect(hash).to.equal(DUMMY_HASH)
      expect(_numConfirmations).to.equal(numConfirmations)
      return {
        to: '',
        from: '',
        status: 1,
      } as TransactionReceipt
    }
    const signer = {
      getAddress: async () => '0x654321',
    } as Signer
    const provider = {
      getGasPrice: async () => ethers.BigNumber.from(0),
      waitForTransaction,
    } as StaticJsonRpcProvider
    const hooks = {
      beforeSendTransaction: (dataAtVaultIntegration: any) => {
        called.beforeSendTransaction = true
        expect(dataAtVaultIntegration.url).to.equal(fullUrl)
        expect(dataAtVaultIntegration.requestInit.method).to.equal('PUT')
        expect(dataAtVaultIntegration.requestInit.headers).to.eql({
          'X-Vault-Request': 'true',
          'X-Vault-Token': 'this is fake',
        })
        expect(dataAtVaultIntegration.requestInit.body).to.equal(
          '{"nonce":0,"gas_price":0,"should_start_at_element":1,"total_elements_to_append":1,"contexts":["{\\"num_sequenced_transactions\\":0,\\"num_subsequent_queue_transactions\\":1,\\"timestamp\\":1234,\\"block_number\\":42}"],"transactions":[]}'
        )
      },
      onTransactionResponse: (txResponse: any) => {
        called.onTransactionResponse = true
        expect(txResponse).to.eql({ data: { transaction_hash: DUMMY_HASH } })
      },
    }
    const config: ResubmissionConfig = {
      resubmissionTimeout: 1000,
      minGasPriceInGwei: 0,
      maxGasPriceInGwei: 0,
      gasRetryIncrement: 1,
    }
    await submitTransactionWithYNATM(
      appendSequencerBatch(0),
      await createVaultSigner(signer),
      provider,
      config,
      numConfirmations,
      hooks
    )
    expect(called.waitForTransaction).to.be.true
    expect(called.beforeSendTransaction).to.be.true
    expect(called.onTransactionResponse).to.be.true
  })

  it('repeatedly increases the gas limit of the transaction when wait takes too long', async () => {
    // Make transactions take longer to be included
    // than our resubmission timeout
    const resubmissionTimeout = 100
    const txReceiptDelay = resubmissionTimeout * 2
    const l1ProviderReal = hardhatEthers.provider
    let lastGasPrice = (await l1ProviderReal.getGasPrice()).div(2)
    // Create a transaction which has a gas price that we will watch increment
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
      _hash: string,
      _numConfirmations: number
    ): Promise<TransactionReceipt> => {
      await new Promise((r) => setTimeout(r, txReceiptDelay))
      return {} as TransactionReceipt
    }
    const signer = {
      sendTransaction,
      getAddress: async () => '0x654321',
    } as Signer
    httpServer.on({
      method: 'PUT',
      path,
      reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: async (req, reply) => {
          const body = JSON.parse(req.body)
          const tx = {
            gasPrice: body.gas_price,
            data: 'hello world!',
          } as ethers.PopulatedTransaction
          const resp = await signer.sendTransaction(tx)
          reply(
            JSON.stringify({
              data: { transaction_hash: resp.hash },
            })
          )
        },
      },
    })
    const l1Provider = {
      //1gwei = 1000000000wei
      getGasPrice: async () => ethers.BigNumber.from(1000000000),
      waitForTransaction,
    } as StaticJsonRpcProvider
    const config: ResubmissionConfig = {
      resubmissionTimeout,
      minGasPriceInGwei: 0, // is set inside the method
      maxGasPriceInGwei: 1000,
      gasRetryIncrement: 1,
    }
    await submitTransactionWithYNATM(
      appendSequencerBatch(0),
      await createVaultSigner(signer),
      l1Provider,
      config,
      0,
      nullHooks
    )
  })
})
const createVaultSigner = async (signer: Signer): Promise<Vault> => {
  return {
    account_address: await signer.getAddress(),
    authentication_token: 'this is fake',
    vault_url: 'http://localhost:9000',
  }
}

const appendSequencerBatch = (nonce: number): AppendSequencerBatch => {
  const batchContexts = []
  const batchContext: BatchContext = {
    numSequencedTransactions: 0,
    numSubsequentQueueTransactions: 1,
    timestamp: 1234,
    blockNumber: 42,
  }
  batchContexts.push(batchContext)

  const asbp: AppendSequencerBatchParams = {
    shouldStartAtElement: 1,
    totalElementsToAppend: 1,
    contexts: batchContexts,
    transactions: [],
  }
  return {
    batchParams: asbp,
    type: 'AppendSequencerBatch',
    nonce,
    address: undefined,
  }
}
