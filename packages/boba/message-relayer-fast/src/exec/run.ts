import { Wallet, providers } from 'ethers'
import { MessageRelayerService } from '../service'
import { Bcfg } from '@eth-optimism/core-utils'
import * as dotenv from 'dotenv'
import Config from 'bcfg'

dotenv.config()

const main = async () => {
  const config: Bcfg = new Config('message-relayer')
  config.load({
    env: true,
    argv: true,
  })

  const env = process.env
  const L2_NODE_WEB3_URL = config.str('l2-node-web3-url', env.L2_NODE_WEB3_URL)
  const L1_NODE_WEB3_URL = config.str('l1-node-web3-url', env.L1_NODE_WEB3_URL)
  const ADDRESS_MANAGER_ADDRESS = config.str(
    'address-manager-address',
    env.ADDRESS_MANAGER_ADDRESS
  )
  const L1_MESSENGER_FAST = config.str(
    'l1-messenger-fast',
    env.L1_MESSENGER_FAST
  )
  const FAST_RELAYER_PRIVATE_KEY = config.str(
    'fast-relayer-private-key',
    env.FAST_RELAYER_PRIVATE_KEY
  )
  const MNEMONIC = config.str('mnemonic', env.MNEMONIC)
  const HD_PATH = config.str('hd-path', env.HD_PATH)
  //batch system
  const MIN_BATCH_SIZE = config.uint(
    'min-batch-size',
    parseInt(env.MIN_BATCH_SIZE, 10) || 2
  )
  const MAX_WAIT_TIME_S = config.uint(
    'max-wait-time-s',
    parseInt(env.MAX_WAIT_TIME_S, 10) || 60
  )
  const MAX_WAIT_TX_TIME_S = config.uint(
    'max-wait-tx-time-s',
    parseInt(env.MAX_WAIT_TX_TIME_S, 10) || 180
  )
  const RELAY_GAS_LIMIT = config.uint(
    'relay-gas-limit',
    parseInt(env.RELAY_GAS_LIMIT, 10) || 4000000
  )
  const POLLING_INTERVAL = config.uint(
    'polling-interval',
    parseInt(env.POLLING_INTERVAL, 10) || 5000
  )
  const GET_LOGS_INTERVAL = config.uint(
    'get-logs-interval',
    parseInt(env.GET_LOGS_INTERVAL, 10) || 2000
  )
  const L2_BLOCK_OFFSET = config.uint(
    'l2-start-offset',
    parseInt(env.L2_BLOCK_OFFSET, 10) || 1
  )
  const L1_START_OFFSET = config.uint(
    'l1-start-offset',
    parseInt(env.L1_BLOCK_OFFSET, 10) || 1
  )
  const FROM_L2_TRANSACTION_INDEX = config.uint(
    'from-l2-transaction-index',
    parseInt(env.FROM_L2_TRANSACTION_INDEX, 10) || 0
  )
  const FILTER_ENDPOINT =
    config.str('filter-endpoint', env.FILTER_ENDPOINT) || ''
  const FILTER_POLLING_INTERVAL = config.uint(
    'filter-polling-interval',
    parseInt(env.FILTER_POLLING_INTERVAL, 10) || 60000
  )
  const MAX_GAS_PRICE_IN_GWEI = config.uint(
    'max-gas-price-in-gwei',
    parseInt(env.MAX_GAS_PRICE_IN_GWEI, 10) || 100
  )
  const GAS_RETRY_INCREMENT = config.uint(
    'gas-retry-increment',
    parseInt(env.GAS_RETRY_INCREMENT, 10) || 5
  )
  const RESUBMISSION_TIMEOUT = config.uint(
    'resubmission-timeout',
    parseInt(env.RESUBMISSION_TIMEOUT, 10) || 60
  )
  const NUM_CONFIRMATIONS = config.uint(
    'num-confirmations',
    parseInt(env.NUM_CONFIRMATIONS, 10) || 1
  )
  const NUM_EVENT_CONFIRMATIONS = config.uint(
    'num-event-confirmations',
    parseInt(env.NUM_EVENT_CONFIRMATIONS, 10) || 0
  )
  const MULTI_RELAY_LIMIT = config.uint(
    'multi-relay-limit',
    parseInt(env.MULTI_RELAY_LIMIT, 10) || 10
  )

  if (!ADDRESS_MANAGER_ADDRESS) {
    throw new Error('Must pass ADDRESS_MANAGER_ADDRESS')
  }
  if (!L1_NODE_WEB3_URL) {
    throw new Error('Must pass L1_NODE_WEB3_URL')
  }
  if (!L2_NODE_WEB3_URL) {
    throw new Error('Must pass L2_NODE_WEB3_URL')
  }

  const l2Provider = new providers.StaticJsonRpcProvider(L2_NODE_WEB3_URL)
  const l1Provider = new providers.StaticJsonRpcProvider(L1_NODE_WEB3_URL)

  let wallet: Wallet
  if (FAST_RELAYER_PRIVATE_KEY) {
    wallet = new Wallet(FAST_RELAYER_PRIVATE_KEY, l1Provider)
  } else if (MNEMONIC) {
    wallet = Wallet.fromMnemonic(MNEMONIC, HD_PATH)
    wallet = wallet.connect(l1Provider)
  } else {
    throw new Error('Must pass one of FAST_RELAYER_PRIVATE_KEY or MNEMONIC')
  }

  const service = new MessageRelayerService({
    l1RpcProvider: l1Provider,
    l2RpcProvider: l2Provider,
    addressManagerAddress: ADDRESS_MANAGER_ADDRESS,
    l1MessengerFast: L1_MESSENGER_FAST,
    l1Wallet: wallet,
    relayGasLimit: RELAY_GAS_LIMIT,
    minBatchSize: MIN_BATCH_SIZE,
    maxWaitTimeS: MAX_WAIT_TIME_S,
    maxWaitTxTimeS: MAX_WAIT_TX_TIME_S,
    fromL2TransactionIndex: FROM_L2_TRANSACTION_INDEX,
    pollingInterval: POLLING_INTERVAL,
    l2BlockOffset: L2_BLOCK_OFFSET,
    l1StartOffset: L1_START_OFFSET,
    getLogsInterval: GET_LOGS_INTERVAL,
    filterEndpoint: FILTER_ENDPOINT,
    filterPollingInterval: FILTER_POLLING_INTERVAL,
    maxGasPriceInGwei: MAX_GAS_PRICE_IN_GWEI,
    gasRetryIncrement: GAS_RETRY_INCREMENT,
    numConfirmations: NUM_CONFIRMATIONS,
    numEventConfirmations: NUM_EVENT_CONFIRMATIONS,
    multiRelayLimit: MULTI_RELAY_LIMIT,
    resubmissionTimeout: RESUBMISSION_TIMEOUT * 1000,
  })

  await service.start()
}
export default main
