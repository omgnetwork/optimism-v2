import { Contract, providers, utils, Wallet } from 'ethers'
import { getContractFactory } from '@eth-optimism/contracts'

import * as configs from './configs'
import {
  initWatcher,
  Direction,
  waitForXDomainTransaction,
} from './libs/watcher-utils'

import logger from './logger'
import L1LiquidityPoolJson from '../artifacts/contracts/LP/L1LiquidityPool.sol/L1LiquidityPool.json'

const l1Provider = new providers.JsonRpcProvider(configs.l1Web3Url)
const l2Provider = new providers.JsonRpcProvider(configs.l2Web3Url)
const l1Wallet = new Wallet(configs.walletPKey, l1Provider)
const l2Wallet = l1Wallet.connect(l2Provider)

const getAddressManager = (provider: any) => {
  return getContractFactory('Lib_AddressManager')
    .connect(provider)
    .attach(configs.l1AddressManager) as any
}

export const fastOnRamp = async () => {
  const l1Address = await l1Wallet.getAddress()
  const l2Address = await l2Wallet.getAddress()
  const addressManager = getAddressManager(l1Wallet)
  const watcher = await initWatcher(l1Provider, l2Provider, addressManager)
  const L1LiquidityPool = new Contract(
    configs.l1PoolAddress,
    L1LiquidityPoolJson.abi,
    l1Wallet
  )

  const depositAmount = utils.parseEther(configs.dummyEthAmount)

  const l1Balance = await l1Provider.getBalance(l1Address)
  const l2Balance = await l2Provider.getBalance(l2Address)
  logger.info('Start dummy transfer from L1->L2', {
    l1Address,
    l2Address,
    l1Balance: utils.formatEther(l1Balance),
    l2Balance: utils.formatEther(l2Balance),
  })

  await waitForXDomainTransaction(
    watcher,
    L1LiquidityPool.connect(l1Wallet).clientDepositL1(
      0,
      '0x0000000000000000000000000000000000000000',
      { value: depositAmount }
    ),
    Direction.L1ToL2
  )

  const l1BalanceAfter = await l1Provider.getBalance(l1Wallet.getAddress())
  const l2BalanceAfter = await l2Provider.getBalance(l2Wallet.getAddress())
  logger.info('Done dummy transfer from L1->L2', {
    l1Address,
    l2Address,
    l1Balance: utils.formatEther(l1BalanceAfter),
    l2Balance: utils.formatEther(l2BalanceAfter),
  })
}
