import { expect } from '../setup'

/* External Imports */
import { ethers as hardhatEthers } from 'hardhat'
import '@nomiclabs/hardhat-ethers'
import {
  Signer,
  ContractFactory,
  Contract,
  BigNumber,
  providers,
  ethers,
  ContractInterface,
} from 'ethers'
import ganache from 'ganache-core'
import sinon from 'sinon'
import {
  StaticJsonRpcProvider,
  TransactionReceipt,
  Web3Provider,
} from '@ethersproject/providers'
import scc from '@eth-optimism/contracts/artifacts/contracts/L1/rollup/StateCommitmentChain.sol/StateCommitmentChain.json'
import {
  getContractInterface,
  getContractFactory,
  predeploys,
} from '@eth-optimism/contracts'
import { smockit, MockContract } from '@eth-optimism/smock'

/* Internal Imports */
import { MockchainProvider } from './mockchain-provider'
import {
  makeAddressManager,
  setProxyTarget,
  FORCE_INCLUSION_PERIOD_SECONDS,
} from '../helpers'
import {
  CanonicalTransactionChainContract,
  TransactionBatchSubmitter as RealTransactionBatchSubmitter,
  StateBatchSubmitter,
  TX_BATCH_SUBMITTER_LOG_TAG,
  STATE_BATCH_SUBMITTER_LOG_TAG,
  BatchSubmitter,
  YnatmTransactionSubmitter,
  ResubmissionConfig,
  Vault,
} from '../../src'

import {
  QueueOrigin,
  Batch,
  Signature,
  remove0x,
} from '@eth-optimism/core-utils'
import { Logger, Metrics } from '@eth-optimism/common-ts'
import { sign } from 'crypto'

const DUMMY_ADDRESS = '0x' + '00'.repeat(20)
const EXAMPLE_STATE_ROOT =
  '0x16b7f83f409c7195b1f4fde5652f1b54a4477eacb6db7927691becafba5f8801'
const MAX_GAS_LIMIT = 8_000_000
const MAX_TX_SIZE = 100_000
const MIN_TX_SIZE = 1_000
const MIN_GAS_PRICE_IN_GWEI = 1
const MAX_GAS_PRICE_IN_GWEI = 70
const GAS_RETRY_INCREMENT = 5
const GAS_THRESHOLD_IN_GWEI = 120

// Helper functions
interface QueueElement {
  queueRoot: string
  timestamp: number
  blockNumber: number
}
const getQueueElement = async (
  ctcContract: Contract,
  nextQueueIndex?: number
): Promise<QueueElement> => {
  if (!nextQueueIndex) {
    nextQueueIndex = await ctcContract.getNextQueueIndex()
  }
  const nextQueueElement = await ctcContract.getQueueElement(nextQueueIndex)
  return nextQueueElement
}
const DUMMY_SIG: Signature = {
  r: '11'.repeat(32),
  s: '22'.repeat(32),
  v: 1,
}
// A transaction batch submitter which skips the validate batch check
class TransactionBatchSubmitter extends RealTransactionBatchSubmitter {
  protected async _validateBatch(batch: Batch): Promise<boolean> {
    return true
  }
}
const testMetrics = new Metrics({ prefix: 'bs_test' })

describe('BatchSubmitter', () => {
  let signer: Signer
  let sequencer: Signer
  const l1ProviderReal = hardhatEthers.provider
  const l1Provider = {
    getGasPrice: async () => {
      const gas = await l1ProviderReal.getGasPrice()
      return gas
    },
    waitForTransaction: async (
      hash: string,
      _numConfirmations: number,
      timeout?: number
    ): Promise<TransactionReceipt> => {
      const wait = await l1ProviderReal.waitForTransaction(
        hash,
        _numConfirmations
      )
      return wait
    },
  } as StaticJsonRpcProvider
  before(async () => {
    ;[signer, sequencer] = await hardhatEthers.getSigners()
  })

  let AddressManager: Contract
  //let Mock__ExecutionManager: MockContract
  let Mock__BondManager: MockContract
  let Mock__StateCommitmentChain: MockContract
  before(async () => {
    AddressManager = await makeAddressManager()
    await AddressManager.setAddress(
      'OVM_Sequencer',
      await sequencer.getAddress()
    )
    Mock__BondManager = await smockit(await getContractInterface('BondManager'))

    await setProxyTarget(AddressManager, 'BondManager', Mock__BondManager)

    Mock__BondManager.smocked.isCollateralized.will.return.with(true)
  })

  let Factory__CanonicalTransactionChain: ContractFactory
  let Factory__StateCommitmentChain: ContractFactory
  before(async () => {
    Factory__CanonicalTransactionChain = getContractFactory(
      'CanonicalTransactionChain'
    ).connect(signer)

    Factory__StateCommitmentChain = getContractFactory(
      'StateCommitmentChain',
      signer
    ).connect(signer)
  })

  let CanonicalTransactionChain: CanonicalTransactionChainContract
  let StateCommitmentChain: Contract
  let l2Provider: MockchainProvider
  let Factory__ChainStorageContainer: ContractFactory
  const L2_GAS_DISCOUNT_DIVISOR = 32
  const ENQUEUE_GAS_COST = 60_000
  beforeEach(async () => {
    const unwrapped_CanonicalTransactionChain =
      await Factory__CanonicalTransactionChain.deploy(
        AddressManager.address,
        MAX_GAS_LIMIT,
        L2_GAS_DISCOUNT_DIVISOR,
        ENQUEUE_GAS_COST
      )
    Factory__ChainStorageContainer = getContractFactory('ChainStorageContainer',
      signer
    ).connect(signer)

    const batches = await Factory__ChainStorageContainer.deploy(
      AddressManager.address,
      'CanonicalTransactionChain'
    )
    const queue = await Factory__ChainStorageContainer.deploy(
      AddressManager.address,
      'CanonicalTransactionChain'
    )

    await AddressManager.setAddress(
      'ChainStorageContainer-CTC-batches',
      batches.address
    )

    await AddressManager.setAddress(
      'ChainStorageContainer-CTC-queue',
      queue.address
    )

    await AddressManager.setAddress(
      'CanonicalTransactionChain',
      unwrapped_CanonicalTransactionChain.address
    )

    await AddressManager.setAddress(
      'CanonicalTransactionChain',
      unwrapped_CanonicalTransactionChain.address
    )

    CanonicalTransactionChain = new CanonicalTransactionChainContract(
      unwrapped_CanonicalTransactionChain.address,
      getContractInterface('CanonicalTransactionChain'),
      sequencer
    )

    const unwrapped_StateCommitmentChain =
      await Factory__StateCommitmentChain.deploy(
        AddressManager.address,
        0, // fraudProofWindowSeconds
        0 // sequencerPublishWindowSeconds
      )

    //    await unwrapped_StateCommitmentChain.init()

    await AddressManager.setAddress(
      'StateCommitmentChain',
      unwrapped_StateCommitmentChain.address
    )

    StateCommitmentChain = new Contract(
      unwrapped_StateCommitmentChain.address,
      getContractInterface('StateCommitmentChain'),
      sequencer
    )
    const factory2 = getContractFactory('ChainStorageContainer')
    const ChainStorageContainer = await factory2
      .connect(signer)
      .deploy(AddressManager.address, 'StateCommitmentChain')
    await AddressManager.setAddress(
      'ChainStorageContainer-SCC-batches',
      ChainStorageContainer.address
    )
    l2Provider = new MockchainProvider(
      CanonicalTransactionChain.address,
      StateCommitmentChain.address
    )
  })

  afterEach(() => {
    sinon.restore()
  })

  const createBatchSubmitter = async (
    timeout: number,
    l1ProviderMock?: providers.StaticJsonRpcProvider
  ): Promise<TransactionBatchSubmitter> => {
    const resubmissionConfig: ResubmissionConfig = {
      resubmissionTimeout: 100000,
      minGasPriceInGwei: MIN_GAS_PRICE_IN_GWEI,
      maxGasPriceInGwei: GAS_THRESHOLD_IN_GWEI,
      gasRetryIncrement: GAS_RETRY_INCREMENT,
    }
    const txBatchTxSubmitter = new YnatmTransactionSubmitter(
      await createVaultWithSigner(sequencer),
      l1Provider,
      resubmissionConfig,
      1
    )
    return new TransactionBatchSubmitter(
      await createVaultWithSigner(sequencer),
      l1ProviderMock || l1ProviderReal,
      l2Provider as any,
      MIN_TX_SIZE,
      MAX_TX_SIZE,
      10,
      timeout,
      1,
      100000,
      AddressManager.address,
      1,
      GAS_THRESHOLD_IN_GWEI,
      txBatchTxSubmitter,
      1,
      new Logger({ name: TX_BATCH_SUBMITTER_LOG_TAG }),
      testMetrics,
      false
    )
  }

  describe('TransactionBatchSubmitter', () => {
    describe('submitNextBatch', () => {
      let batchSubmitter
      beforeEach(async () => {
        for (let i = 1; i < 15; i++) {
          await CanonicalTransactionChain.enqueue(
            '0x' + '01'.repeat(20),
            500_000,
            '0x' + i.toString().repeat(64),
            {
              gasLimit: 40000000,
            }
          )
        }
        batchSubmitter = await createBatchSubmitter(0)
      })

      it('should submit a sequencer batch correctly', async () => {
        l2Provider.setNumBlocksToReturn(5)
        const nextQueueElement = await getQueueElement(
          CanonicalTransactionChain
        )
        l2Provider.setL2BlockData(
          {
            rawTransaction: '0x1234',
            l1BlockNumber: nextQueueElement.blockNumber - 1,
            txType: 0,
            queueOrigin: QueueOrigin.Sequencer,
            l1TxOrigin: null,
          } as any,
          nextQueueElement.timestamp - 1
        )
        let receipt = await batchSubmitter.submitNextBatch()
        let logData = remove0x(receipt.logs[1].data)
        expect(parseInt(logData.slice(64 * 0, 64 * 1), 16)).to.equal(0) // _startingQueueIndex
        expect(parseInt(logData.slice(64 * 1, 64 * 2), 16)).to.equal(0) // _numQueueElements
        expect(parseInt(logData.slice(64 * 2, 64 * 3), 16)).to.equal(6) // _totalElements
        receipt = await batchSubmitter.submitNextBatch()
        logData = remove0x(receipt.logs[1].data)
        expect(parseInt(logData.slice(64 * 0, 64 * 1), 16)).to.equal(0) // _startingQueueIndex
        expect(parseInt(logData.slice(64 * 1, 64 * 2), 16)).to.equal(0) // _numQueueElements
        expect(parseInt(logData.slice(64 * 2, 64 * 3), 16)).to.equal(11) // _totalElements
      })

      it('should submit a queue batch correctly', async () => {
        l2Provider.setNumBlocksToReturn(5)
        l2Provider.setL2BlockData({
          queueOrigin: QueueOrigin.L1ToL2,
        } as any)
        let receipt = await batchSubmitter.submitNextBatch()
        let logData = remove0x(receipt.logs[1].data)
        expect(parseInt(logData.slice(64 * 0, 64 * 1), 16)).to.equal(0) // _startingQueueIndex
        expect(parseInt(logData.slice(64 * 1, 64 * 2), 16)).to.equal(6) // _numQueueElements
        expect(parseInt(logData.slice(64 * 2, 64 * 3), 16)).to.equal(6) // _totalElements
        receipt = await batchSubmitter.submitNextBatch()
        logData = remove0x(receipt.logs[1].data)
        expect(parseInt(logData.slice(64 * 0, 64 * 1), 16)).to.equal(6) // _startingQueueIndex
        expect(parseInt(logData.slice(64 * 1, 64 * 2), 16)).to.equal(5) // _numQueueElements
        expect(parseInt(logData.slice(64 * 2, 64 * 3), 16)).to.equal(11) // _totalElements
      })

      it('should submit a batch with both queue and sequencer chain elements', async () => {
        l2Provider.setNumBlocksToReturn(10) // For this batch we'll return 10 elements!
        l2Provider.setL2BlockData({
          queueOrigin: QueueOrigin.L1ToL2,
        } as any)
        // Turn blocks 3-5 into sequencer txs
        const nextQueueElement = await getQueueElement(
          CanonicalTransactionChain,
          2
        )
        l2Provider.setL2BlockData(
          {
            rawTransaction: '0x1234',
            l1BlockNumber: nextQueueElement.blockNumber - 1,
            txType: 1,
            queueOrigin: QueueOrigin.Sequencer,
            l1TxOrigin: null,
          } as any,
          nextQueueElement.timestamp - 1,
          '', // blank stateRoot
          3,
          6
        )
        const receipt = await batchSubmitter.submitNextBatch()
        const logData = remove0x(receipt.logs[1].data)
        expect(parseInt(logData.slice(64 * 0, 64 * 1), 16)).to.equal(0) // _startingQueueIndex
        expect(parseInt(logData.slice(64 * 1, 64 * 2), 16)).to.equal(8) // _numQueueElements
        expect(parseInt(logData.slice(64 * 2, 64 * 3), 16)).to.equal(11) // _totalElements
      })

      it('should submit a small batch only after the timeout', async () => {
        l2Provider.setNumBlocksToReturn(2)
        l2Provider.setL2BlockData({
          queueOrigin: QueueOrigin.L1ToL2,
        } as any)

        // Create a batch submitter with a long timeout & make sure it doesn't submit the batches one after another
        const longTimeout = 10_000
        batchSubmitter = await createBatchSubmitter(longTimeout)
        let receipt = await batchSubmitter.submitNextBatch()
        expect(receipt).to.not.be.undefined
        receipt = await batchSubmitter.submitNextBatch()
        // The receipt should be undefined because that means it didn't submit
        expect(receipt).to.be.undefined

        // This time create a batch submitter with a short timeout & it should submit batches after the timeout is reached
        const shortTimeout = 5
        batchSubmitter = await createBatchSubmitter(shortTimeout)
        receipt = await batchSubmitter.submitNextBatch()
        expect(receipt).to.not.be.undefined
        // Sleep for the short timeout
        await new Promise((r) => setTimeout(r, shortTimeout))
        receipt = await batchSubmitter.submitNextBatch()
        // The receipt should NOT be undefined because that means it successfully submitted!
        expect(receipt).to.not.be.undefined
      })

      it('should not submit if gas price is over threshold', async () => {
        l2Provider.setNumBlocksToReturn(2)
        l2Provider.setL2BlockData({
          queueOrigin: QueueOrigin.L1ToL2,
        } as any)
        const highGasPriceWei = BigNumber.from(600).mul(1_000_000_000)
        let getGasPriceCalled = false
        const l1ProviderMocked = {
          _isProvider: true,
          getBalance: l1ProviderReal.getBalance,
          call: l1ProviderReal.call,
          getGasPrice: async () => {
            getGasPriceCalled = true
            return highGasPriceWei
          },
        } as StaticJsonRpcProvider
        // we want to mock out the l1Provider so that we can return a custom getGasPrice method response
        // so that we test - Do not submit batch if gas price above threshold lines
        batchSubmitter = await createBatchSubmitter(0, l1ProviderMocked)
        const receipt = await batchSubmitter.submitNextBatch()
        expect(getGasPriceCalled).to.be.true
        expect(receipt).to.be.undefined
      })

      it('should submit if gas price is not over threshold', async () => {
        l2Provider.setNumBlocksToReturn(2)
        l2Provider.setL2BlockData({
          queueOrigin: QueueOrigin.L1ToL2,
        } as any)

        const lowGasPriceWei = BigNumber.from(2).mul(1_000_000_000)
        let getGasPriceCalled = 0
        //stubbing
        l1Provider.waitForTransaction = async (
          hash: string,
          _numConfirmations: number,
          timeout?: number
        ): Promise<TransactionReceipt> => {
          const wft = await l1ProviderReal.waitForTransaction(
            hash,
            _numConfirmations
          )
          return wft
        }
        l1Provider.getGasPrice = async () => {
          getGasPriceCalled += 1
          return lowGasPriceWei
        }
        const receipt = await batchSubmitter.submitNextBatch()
        expect(getGasPriceCalled).to.be.equal(1)
        expect(receipt).to.not.be.undefined
      })
    })
  })

  describe('StateBatchSubmitter', () => {
    let txBatchSubmitter
    let stateBatchSubmitter
    beforeEach(async () => {
      for (let i = 1; i < 15; i++) {
        const tx = await CanonicalTransactionChain.enqueue(
          '0x' + '01'.repeat(20),
          500_000,
          '0x' + i.toString().repeat(64),
          {
            gasLimit: 1_000_000,
          }
        )
        expect(
          await (
            await l1ProviderReal.waitForTransaction(tx.hash, 1)
          ).status
        ).to.eq(1)
      }

      txBatchSubmitter = await createBatchSubmitter(0)

      l2Provider.setNumBlocksToReturn(5)

      const nextQueueElement = await getQueueElement(CanonicalTransactionChain)

      l2Provider.setL2BlockData(
        {
          rawTransaction: '0x1234',
          l1BlockNumber: nextQueueElement.blockNumber - 1,
          txType: 0,
          queueOrigin: QueueOrigin.Sequencer,
          l1TxOrigin: null,
        } as any,
        nextQueueElement.timestamp - 1,
        EXAMPLE_STATE_ROOT // example stateRoot
      )
      // submit a batch of transactions to enable state batch submission
      await txBatchSubmitter.submitNextBatch()

      const resubmissionConfig: ResubmissionConfig = {
        resubmissionTimeout: 100000,
        minGasPriceInGwei: MIN_GAS_PRICE_IN_GWEI,
        maxGasPriceInGwei: GAS_THRESHOLD_IN_GWEI,
        gasRetryIncrement: GAS_RETRY_INCREMENT,
      }
      const stateBatchTxSubmitter = new YnatmTransactionSubmitter(
        await createVaultWithSigner(sequencer),
        l1Provider,
        resubmissionConfig,
        1
      )
      stateBatchSubmitter = new StateBatchSubmitter(
        await createVaultWithSigner(sequencer),
        l1ProviderReal,
        l2Provider as any,
        MIN_TX_SIZE,
        MAX_TX_SIZE,
        10, // maxBatchSize
        0,
        1,
        100000,
        0, // finalityConfirmations
        AddressManager.address,
        1,
        stateBatchTxSubmitter,
        1,
        new Logger({ name: STATE_BATCH_SUBMITTER_LOG_TAG }),
        testMetrics,
        '0x' + '01'.repeat(20) // placeholder for fraudSubmissionAddress
      )
    })

    describe('submitNextBatch', () => {
      it('should submit a state batch after a transaction batch', async () => {
        const receipt = await stateBatchSubmitter.submitNextBatch()
        expect(receipt).to.not.be.undefined

        const iface = new ethers.utils.Interface(scc.abi)
        const parsedLogs = iface.parseLog(receipt.logs[0])

        expect(parsedLogs.eventFragment.name).to.eq('StateBatchAppended')
        expect(parsedLogs.args._batchIndex.toNumber()).to.eq(0)
        expect(parsedLogs.args._batchSize.toNumber()).to.eq(6)
        expect(parsedLogs.args._prevTotalElements.toNumber()).to.eq(0)
      })
    })
  })
})

describe('Batch Submitter with Ganache', () => {
  let signer
  const server = ganache.server({
    default_balance_ether: 420,
    blockTime: 2_000,
  })
  const provider = new Web3Provider(ganache.provider())

  before(async () => {
    await server.listen(3001)
    signer = await provider.getSigner()
  })

  after(async () => {
    await server.close()
  })
})
const createVaultWithSigner = async (signer: Signer): Promise<Vault> => {
  return {
    signer,
    address: await signer.getAddress(),
    token: undefined,
    vault_addr: undefined,
  }
}
