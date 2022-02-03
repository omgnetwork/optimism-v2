/* Imports: External */
import { getContractFactory } from '@eth-optimism/contracts'
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory, utils, BigNumber, ethers } from 'ethers'
import { registerBobaAddress } from './000-Messenger.deploy'

import BobaPredictionJson from '../artifacts/contracts/BobaPrediction.sol/BobaPrediction.json'
import TuringHelperJson from '@boba/turing-hybrid-compute/artifacts/contracts/TuringHelper.sol/TuringHelper.json'

let Factory__TuringHelper: ContractFactory
let TuringHelper: Contract

let Factory__BobaPrediction: ContractFactory
let BobaPrediction: Contract

const deployFn: DeployFunction = async (hre) => {
  const addressManager = getContractFactory('Lib_AddressManager')
    .connect((hre as any).deployConfig.deployer_l1)
    .attach(process.env.ADDRESS_MANAGER_ADDRESS) as any

  Factory__TuringHelper = new ContractFactory(
    TuringHelperJson.abi,
    TuringHelperJson.bytecode,
    (hre as any).deployConfig.deployer_l2
  )
  TuringHelper = await Factory__TuringHelper.deploy()
  await TuringHelper.deployTransaction.wait()
  console.log(`TuringHelper deployed to: ${TuringHelper.address}`)

  const TuringHelperSubmission: DeploymentSubmission = {
    ...TuringHelper,
    receipt: TuringHelper.receipt,
    address: TuringHelper.address,
    abi: TuringHelper.abi,
  }

  await hre.deployments.save(
    'BobaPredictionTuringHelper',
    TuringHelperSubmission
  )
  await registerBobaAddress(
    addressManager,
    'BobaPredictionTuringHelper',
    TuringHelper.address
  )

  // parameters
  const L2BOBAAdress = (await hre.deployments.getOrNull('TK_L2BOBA')).address
  const params = [
    TuringHelper.address,
    'https://i9iznmo33e.execute-api.us-east-1.amazonaws.com/quote',
    'BOBA/USD',
    (hre as any).deployConfig.deployer_l2.address,
    (hre as any).deployConfig.deployer_l2.address,
    900, // _intervalSeconds: 15 * 60
    30, // _bufferSeconds: 30
    utils.parseEther('1'), // _minBetAmount
    300, // _turingUpdateAllowance: 300
    300, // _treasuryFee: 300
    L2BOBAAdress,
  ]

  Factory__BobaPrediction = new ContractFactory(
    BobaPredictionJson.abi,
    BobaPredictionJson.bytecode,
    (hre as any).deployConfig.deployer_l2
  )
  BobaPrediction = await Factory__BobaPrediction.deploy(...params)
  await BobaPrediction.deployTransaction.wait()
  console.log(`BobaPrediction deployed to: ${BobaPrediction.address}`)

  const BobaPredictionSubmission: DeploymentSubmission = {
    ...BobaPrediction,
    receipt: BobaPrediction.receipt,
    address: BobaPrediction.address,
    abi: BobaPrediction.abi,
  }

  await hre.deployments.save('BobaPrediction', BobaPredictionSubmission)
  await registerBobaAddress(
    addressManager,
    'BobaPrediction',
    BobaPrediction.address
  )
}

deployFn.tags = ['BobaPrediction']

export default deployFn
