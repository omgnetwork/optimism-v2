import dotenv from 'dotenv'
dotenv.config()

export const method = process.env.APP_METHOD

export const l1Web3Url = process.env.L1_NODE_WEB3_URL
export const l2Web3Url = process.env.L2_NODE_WEB3_URL

export const l1PoolAddress = process.env.L1_LIQUIDITY_POOL_ADDRESS
export const l2PoolAddress = process.env.L2_LIQUIDITY_POOL_ADDRESS

export const walletPKey = process.env.WALLET_PRIVATE_KEY
export const l2GasLimit = process.env.L2_GAS_LIMIT

export const dummyEthAmount = process.env.DUMMY_ETH_AMOUNT || '0.0005'
export const dummyDelayMins = parseInt(process.env.DUMMY_DELAY_MINS, 10) || 30
export const dummyWathcherTimeoutMins =
  parseInt(process.env.DUMMY_WATCHER_TIMEOUT_MINS, 10) || 15
export const monitoringReconnectSecs =
  parseInt(process.env.MONITORING_RECONNECT_SECS, 10) || 15
export const monitoringHangTimeoutMins =
  parseInt(process.env.MONITORING_HANG_TIMEOUT_MINS, 10) || 4

export const addressOvmEth = '0x4200000000000000000000000000000000000006'
export const l1AddressManager = process.env.L1_ADDRESS_MANAGER
export const l2DepositedERC20 = process.env.L2_DEPOSITED_ERC20

export enum AppMethod {
  Monitoring = 'monitoring',
  DummyTransaction = 'dummy',
}
