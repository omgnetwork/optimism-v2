/* Imports: External */
import { ethers } from 'ethers'
import { task } from 'hardhat/config'
import * as types from 'hardhat/internal/core/params/argumentTypes'

import { predeploys } from '../src/predeploys'
import { getContractDefinition } from '../src/contract-defs'

task('set-l2-gasprice')
  .addOptionalParam('l2GasPrice', 'Gas Price to set on L2', 0, types.int)
  .addOptionalParam('transactionGasPrice', 'tx.gasPrice', undefined, types.int)
  .addOptionalParam(
    'contractsRpcUrl',
    'Sequencer HTTP Endpoint',
    process.env.CONTRACTS_RPC_URL,
    types.string
  )
  .addOptionalParam(
    'contractsDeployerKey',
    'Private Key',
    process.env.CONTRACTS_DEPLOYER_KEY,
    types.string
  )
  .setAction(async (args, hre: any, runSuper) => {
    const provider = new ethers.providers.JsonRpcProvider(args.contractsRpcUrl)
    const signer = new ethers.Wallet(args.contractsDeployerKey).connect(
      provider
    )

    const GasPriceOracleArtifact = getContractDefinition('OVM_GasPriceOracle')

    const GasPriceOracle = new ethers.Contract(
      predeploys.OVM_GasPriceOracle,
      GasPriceOracleArtifact.abi,
      provider
    )

    const addr = await signer.getAddress()
    console.log(`Using signer ${addr}`)
    const owner = await GasPriceOracle.callStatic.owner()
    if (owner !== addr) {
      throw new Error(`Incorrect key. Owner ${owner}, Signer ${addr}`)
    }

    const gasPrice = await GasPriceOracle.callStatic.gasPrice()
    console.log(`Gas Price is currently ${gasPrice.toString()}`)
    console.log(`Setting Gas Price to ${args.l2GasPrice}`)

    const tx = await GasPriceOracle.connect(signer).setGasPrice(
      args.l2GasPrice,
      { gasPrice: args.transactionGasPrice }
    )

    const receipt = await tx.wait()
    console.log(`Success - ${receipt.transactionHash}`)
  })
