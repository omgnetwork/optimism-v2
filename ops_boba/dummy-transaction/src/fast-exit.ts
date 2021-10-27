import { Contract, providers, utils, Wallet } from 'ethers'
import {
  getContractFactory,
  getContractInterface,
} from '@eth-optimism/contracts'
import * as configs from './configs'
import {
  Direction,
  initFastWatcher,
  waitForXDomainTransaction,
} from './libs/watcher-utils'

// import L2DepositedERC20Json from '../artifacts-ovm/contracts/L2DepositedERC20.sol/L2DepositedERC20.json'
import L2LiquidityPoolJson from '../artifacts-ovm/contracts/LP/L2LiquidityPool.sol/L2LiquidityPool.json'

import logger from './logger'

const l1Provider = new providers.JsonRpcProvider(configs.l1Web3Url)
const l2Provider = new providers.JsonRpcProvider(configs.l2Web3Url)
const l1Wallet = new Wallet(configs.walletPKey, l1Provider)
const l2Wallet = l1Wallet.connect(l2Provider)

const getAddressManager = (provider: any) => {
  return getContractFactory('Lib_AddressManager')
    .connect(provider)
    .attach(configs.l1AddressManager) as any
}

const getL2ETHGateway = (wallet: Wallet) => {
  return new Contract(
    configs.addressOvmEth,
    getContractInterface('OVM_ETH') as any,
    wallet
  )
}

export const fastExit = async () => {
  const l1Address = await l1Wallet.getAddress()
  const l2Address = await l2Wallet.getAddress()
  const addressManager = getAddressManager(l1Wallet)
  const watcher = await initFastWatcher(l1Provider, l2Provider, addressManager)

  const L2LiquidityPool = new Contract(
    configs.l2PoolAddress,
    L2LiquidityPoolJson.abi,
    l2Wallet
  )

  // const L2DepositedERC20 = new Contract(
  //   configs.l2DepositedERC20,
  //   L2DepositedERC20Json.abi,
  //   l2Wallet
  // )

  const L2ETHGateway = getL2ETHGateway(l2Wallet)
  const fastExitAmount = utils.parseEther(configs.dummyEthAmount)

  const l1Balance = await l1Provider.getBalance(l1Address)
  const l2Balance = await l2Provider.getBalance(l2Address)
  // const l2ERCBalance = await L2DepositedERC20.balanceOf(l2Wallet.address)
  logger.info('Start dummy transfer from L2->L1', {
    l1Address,
    l2Address,
    l1Balance: utils.formatEther(l1Balance),
    l2Balance: utils.formatEther(l2Balance),
    // L2ERCBalance: utils.formatEther(l2ERCBalance)
  })

  logger.info('Approve TX')
  const approveL2TX = await L2ETHGateway.connect(l2Wallet).approve(
    L2LiquidityPool.address,
    fastExitAmount,
    { gasLimit: configs.l2GasLimit }
  )
  await approveL2TX.wait()
  logger.info('Approve TX... Done')

  logger.info('Cross Domain Fast Exit')
  await waitForXDomainTransaction(
    watcher,
    L2LiquidityPool.connect(l2Wallet).clientDepositL2(
      fastExitAmount,
      L2ETHGateway.address,
      { gasLimit: configs.l2GasLimit }
    ),
    Direction.L2ToL1
  )
  logger.info('Cross Domain Fast Exit...Done')

  const l1BalanceAfter = await l1Provider.getBalance(l1Address)
  const l2BalanceAfter = await l2Provider.getBalance(l2Address)
  // const l2ERCBalanceAfter = await L2DepositedERC20.balanceOf(l2Wallet.address)
  logger.info('Done dummy transfer from L2->L1', {
    l1Address,
    l2Address,
    l1Balance: utils.formatEther(l1BalanceAfter),
    l2Balance: utils.formatEther(l2BalanceAfter),
    // l2ERCBalance: utils.formatEther(l2ERCBalanceAfter),
  })
}
