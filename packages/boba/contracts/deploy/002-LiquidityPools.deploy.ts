/* Imports: External */
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory } from 'ethers'
import chalk from 'chalk'

import L1LiquidityPoolJson from '../artifacts/contracts/LP/L1LiquidityPool.sol/L1LiquidityPool.json'
import L2LiquidityPoolJson from '../artifacts/contracts/LP/L2LiquidityPool.sol/L2LiquidityPool.json'

let Factory__L1LiquidityPool: ContractFactory
let Factory__L2LiquidityPool: ContractFactory

let L1LiquidityPool: Contract
let L2LiquidityPool: Contract

const deployFn: DeployFunction = async (hre) => {
  Factory__L1LiquidityPool = new ContractFactory(
    L1LiquidityPoolJson.abi,
    L1LiquidityPoolJson.bytecode,
    (hre as any).deployConfig.deployer_l1
  )

  Factory__L2LiquidityPool = new ContractFactory(
    L2LiquidityPoolJson.abi,
    L2LiquidityPoolJson.bytecode,
    (hre as any).deployConfig.deployer_l2
  )
  // Deploy L2 liquidity pool
  console.log(`💿 ${chalk.green('Deploying LP...')}`)

  L2LiquidityPool = await Factory__L2LiquidityPool.deploy()
  await L2LiquidityPool.deployTransaction.wait()
  const L2LiquidityPoolDeploymentSubmission: DeploymentSubmission = {
    ...L2LiquidityPool,
    receipt: L2LiquidityPool.receipt,
    address: L2LiquidityPool.address,
    abi: L1LiquidityPoolJson.abi,
  }
  await hre.deployments.save(
    'L2LiquidityPool',
    L2LiquidityPoolDeploymentSubmission
  )
  console.log(
    `🌕 ${chalk.red('L2LiquidityPool deployed to:')} ${chalk.green(
      L2LiquidityPool.address
    )}`
  )

  // const L1CrossDomainMessengerFastAddress = await (hre as any).deployConfig.addressManager.getAddress(
  //   'Proxy__L1CrossDomainMessengerFast'
  // )

  // Deploy L1 liquidity pool
  L1LiquidityPool = await Factory__L1LiquidityPool.deploy()
  await L1LiquidityPool.deployTransaction.wait()
  const L1LiquidityPoolDeploymentSubmission: DeploymentSubmission = {
    ...L1LiquidityPool,
    receipt: L1LiquidityPool.receipt,
    address: L1LiquidityPool.address,
    abi: L2LiquidityPoolJson.abi,
  }
  await hre.deployments.save(
    'L1LiquidityPool',
    L1LiquidityPoolDeploymentSubmission
  )
  console.log(
    `🌕 ${chalk.red('L1LiquidityPool deployed to:')} ${chalk.green(
      L1LiquidityPool.address
    )}`
  )

  // const initL1LPTX = await L1LiquidityPool.initialize(
  //   (hre as any).deployConfig.l1MessengerAddress,
  //   L1CrossDomainMessengerFastAddress
  // )
  // await initL1LPTX.wait()
  // console.log(`⭐️ ${chalk.red('L1LiquidityPool initialized:')} ${chalk.green(initL1LPTX.hash)}`)

  // const confL1LPTX = await L1LiquidityPool.configure(
  //   /* userRewardFeeRate 3.5% */ 35,
  //   /* ownerRewardFeeRate 1.5% */ 15,
  //   L2LiquidityPool.address
  // )
  // await confL1LPTX.wait()
  // console.log(`⭐️ ${chalk.red('L1LiquidityPool configured:')} ${chalk.green(confL1LPTX.hash)}`)

  // const initL2LPTX = await L2LiquidityPool.initialize(
  //   (hre as any).deployConfig.l2MessengerAddress,
  //   { gasLimit: 250000000 }
  // )
  // await initL2LPTX.wait()
  // console.log(`⭐️ ${chalk.red('L2LiquidityPool initialized:')} ${chalk.green(initL2LPTX.hash)}`)

  // const confL2LPTX = await L2LiquidityPool.configure(
  //   /* userRewardFeeRate 3.5% */ 35,
  //   /* ownerRewardFeeRate 1.5% */ 15,
  //   L1LiquidityPool.address
  // )
  // await confL2LPTX.wait()
  // console.log(`⭐️ ${chalk.red('L2LiquidityPool configured:')} ${chalk.green(confL2LPTX.hash)}`)

  // const registerL1LPETHTX = await L1LiquidityPool.registerPool(
  //   "0x0000000000000000000000000000000000000000",
  //   "0x4200000000000000000000000000000000000006",
  // )
  // await registerL1LPETHTX.wait()
  // console.log(`⭐️ ${chalk.red('L1LiquidityPool registered:')} ${chalk.green(registerL1LPETHTX.hash)}`)

  // const registerL2LPETHTX = await L2LiquidityPool.registerPool(
  //   "0x0000000000000000000000000000000000000000",
  //   "0x4200000000000000000000000000000000000006"//,
  // )
  // await registerL2LPETHTX.wait()
  // console.log(`⭐️ ${chalk.red('L2LiquidityPool registered:')} ${chalk.green(registerL2LPETHTX.hash)}`)
}

deployFn.tags = ['L1LiquidityPool', 'L2LiquidityPool', 'required']

export default deployFn
