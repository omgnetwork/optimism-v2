import * as configs from './configs'
import logger from './logger'

const validateDummyTransaction = () => {
  return (
    configs.l1Web3Url !== undefined &&
    configs.l2Web3Url !== undefined &&
    configs.l1PoolAddress !== undefined &&
    configs.l2PoolAddress !== undefined &&
    configs.l1AddressManager !== undefined &&
    configs.dummyDelayMins !== undefined &&
    configs.walletPKey !== undefined &&
    configs.addressOvmEth !== undefined &&
    configs.dummyEthAmount !== undefined &&
    configs.dummyWathcherTimeoutMins !== undefined &&
    configs.l2GasLimit !== undefined
  )
}

const main = async () => {
  switch (configs.method) {
    case configs.AppMethod.DummyTransaction:
      if (!validateDummyTransaction()) {
        logger.error('Env variables for dummy transaction is missing!')
        break
      }
      logger.info('Start dummy transaction service!')
      const { doDummyTransaction } = await import('./dummy-transaction')
      return doDummyTransaction()
    default:
      logger.error('App started with invalid method!')
      break
  }
}

main().catch(logger.error)
