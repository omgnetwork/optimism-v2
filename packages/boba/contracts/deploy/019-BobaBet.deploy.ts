/* Imports: External */
import { getContractFactory } from '@eth-optimism/contracts'
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory, utils, BigNumber, ethers } from 'ethers'
import { registerBobaAddress } from './000-Messenger.deploy'

import BobaBetJson from '../artifacts/contracts/BobaBet.sol/BobaBet.json'
import TuringHelperJson from '@boba/turing-hybrid-compute/artifacts/contracts/TuringHelper.sol/TuringHelper.json'

let Factory__TuringHelper: ContractFactory
let TuringHelper: Contract

let Factory__BobaBet: ContractFactory
let BobaBet: Contract

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

  await hre.deployments.save('BobaBetTuringHelper', TuringHelperSubmission)
  await registerBobaAddress(
    addressManager,
    'BobaBetTuringHelper',
    TuringHelper.address
  )

  // parameters
  const L2BOBAAdress = (await hre.deployments.getOrNull('TK_L2BOBA')).address
  const params = [
    TuringHelper.address,
    (hre as any).deployConfig.deployer_l2.address,
    (hre as any).deployConfig.deployer_l2.address,
    900, // _intervalSeconds: 15 * 60
    600, // _bufferSeconds: 10 * 60
    utils.parseEther('1'), // _minBetAmount
    300, // _treasuryFee: 300
    L2BOBAAdress,
  ]

  Factory__BobaBet = new ContractFactory(
    BobaBetJson.abi,
    BobaBetJson.bytecode,
    (hre as any).deployConfig.deployer_l2
  )
  BobaBet = await Factory__BobaBet.deploy(...params)
  await BobaBet.deployTransaction.wait()
  console.log(`BobaBet deployed to: ${BobaBet.address}`)

  const BobaBetSubmission: DeploymentSubmission = {
    ...BobaBet,
    receipt: BobaBet.receipt,
    address: BobaBet.address,
    abi: BobaBet.abi,
  }

  await hre.deployments.save('BobaBet', BobaBetSubmission)
  await registerBobaAddress(addressManager, 'BobaBet', BobaBet.address)
}

deployFn.tags = ['BobaBet']

export default deployFn
