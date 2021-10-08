/* Imports: External */
import { Contract, Wallet, BigNumber, providers, utils } from 'ethers'
import fs, { promises as fsPromise } from 'fs';
import path from 'path'

/* Imports: Internal */
import { sleep } from '@eth-optimism/core-utils'
import { BaseService } from '@eth-optimism/common-ts'
import { loadContract } from '@eth-optimism/contracts'

interface GasPriceOracleOptions {
  // Providers for interacting with L1 and L2.
  l1RpcProvider: providers.StaticJsonRpcProvider
  l2RpcProvider: providers.StaticJsonRpcProvider

  // Address of the gasPrice contract
  gasPriceOracleAddress: string,
  OVM_SequencerFeeVault: string,

  // Wallet
  gasPriceOracleOwnerWallet: Wallet,

  // monitor accounts
  sequencerAddress: string,
  proposerAddress: string,
  relayerAddress: string,
  fastRelayerAddress: string,

  // Floor pice
  gasFloorPrice: number

  // Roof price
  gasRoofPrice: number

  // Min percent change
  gasPriceMinPercentChange: number

  // Interval in seconds to wait between loops
  pollingInterval: number

}

const optionSettings = {}

export class GasPriceOracleService extends BaseService<GasPriceOracleOptions> {
  constructor(options: GasPriceOracleOptions) {
    super('GasPriceOracle', options, optionSettings)
  }

  private state: {
    OVM_GasPriceOracle: Contract
    L1ETHBalance: BigNumber
    L1ETHCostFee: BigNumber
    L2ETHVaultBalance: BigNumber
    L2ETHCollectFee: BigNumber
    lastQueriedL1Block: number
    lastQueriedL2Block: number
    avgL2GasLimitPerBlock: BigNumber
    numberOfBlocksInterval: number
  }

  protected async _init(): Promise<void> {
    this.logger.info('Initializing gas price oracle', {
      gasPriceOracleAddress: this.options.gasPriceOracleAddress,
      OVM_SequencerFeeVault: this.options.OVM_SequencerFeeVault,
      gasOracleOwnerAddress: this.options.gasPriceOracleOwnerWallet.address,
      sequencerWallet: this.options.sequencerAddress,
      proposerWallet: this.options.proposerAddress,
      relayerWallet: this.options.relayerAddress,
      fastRelayerWallet: this.options.fastRelayerAddress,
      gasFloorPrice: this.options.gasFloorPrice,
      pollingInterval: this.options.pollingInterval,
    })

    this.state = { } as any;

    this.logger.info('Connecting to OVM_GasPriceOracle...')
    this.state.OVM_GasPriceOracle = loadContract(
      'OVM_GasPriceOracle',
      this.options.gasPriceOracleAddress,
      this.options.l2RpcProvider,
    ).connect(this.options.gasPriceOracleOwnerWallet)
    this.logger.info('Connected to OVM_GasPriceOracle', {
      address: this.state.OVM_GasPriceOracle.address,
    })

    this.state.L1ETHBalance = BigNumber.from('0')
    this.state.L1ETHCostFee = BigNumber.from('0')
    this.state.L2ETHCollectFee = BigNumber.from('0')
    this.state.L2ETHVaultBalance = BigNumber.from('0')

    this.state.lastQueriedL1Block = await this.options.l1RpcProvider.getBlockNumber()
    this.state.lastQueriedL2Block = await this.options.l2RpcProvider.getBlockNumber()

    this.state.avgL2GasLimitPerBlock = BigNumber.from('0')
    this.state.numberOfBlocksInterval = 0

    // Load history
    await this._loadL1ETHFee();
    await this._loadL2ETHCost();
  }

  private async _initialPara(): Promise<void> {
    const scalar = await this.state.OVM_GasPriceOracle.scalar();
  }

  protected async _start(): Promise<void> {
    while (this.running) {
      await sleep(this.options.pollingInterval)
      await this._getL1Balance()
      await this._getL2GasCost()
      await this._updateGasPrice()
    }
  }

  private async _loadL1ETHFee(): Promise<void> {
    const dumpsPath = path.resolve(__dirname, '../data/l1History.json')
    if (fs.existsSync(dumpsPath)) {
      this.logger.warn('Loading L1 cost history...')
      const historyJsonRaw = await fsPromise.readFile(dumpsPath)
      const historyJSON = JSON.parse(historyJsonRaw.toString())
      if (historyJSON.L1ETHCostFee) {
        this.state.L1ETHBalance = BigNumber.from(historyJSON.L1ETHBalance)
        this.state.L1ETHCostFee = BigNumber.from(historyJSON.L1ETHCostFee)
      } else {
        this.logger.warn('Invalid L1 cost history!')
      }
    } else {
      this.logger.warn('No L1 cost history Found!')
    }
  }

  private async _loadL2ETHCost(): Promise<void> {
    const vaultBalance =
      BigNumber.from((await this.options.l2RpcProvider.getBalance(this.options.OVM_SequencerFeeVault)).toString())
    // load data
    const dumpsPath = path.resolve(__dirname, '../data/l2History.json')
    if (fs.existsSync(dumpsPath)) {
      this.logger.warn('Loading L2 cost history...')
      const historyJsonRaw = await fsPromise.readFile(dumpsPath)
      const historyJSON = JSON.parse(historyJsonRaw.toString())
      if (historyJSON.L2ETHCollectFee) {
        this.state.L2ETHCollectFee = BigNumber.from(historyJSON.L2ETHCollectFee)
      } else {
        this.logger.warn('Invalid L2 cost history!')
        this.state.L2ETHCollectFee = vaultBalance
      }
    } else {
      this.logger.warn('No L2 cost history Found!')
      this.state.L2ETHCollectFee = vaultBalance
    }
    // adjust the L2ETHCollectFee if it is not correct
    if (this.state.L2ETHCollectFee.lt(vaultBalance)) {
      this.state.L2ETHCollectFee = vaultBalance
    }
    this.state.L2ETHVaultBalance = vaultBalance
    this.logger.info('Loaded L2 Cost Data', {
      L2ETHVaultBalance: this.state.L2ETHVaultBalance.toString(),
      L2ETHCollectFee: this.state.L2ETHCollectFee.toString()
    })
  }

  private async _writeL1ETHFee(): Promise<void> {
    const dumpsPath = path.resolve(__dirname, '../data')
    if (!fs.existsSync(dumpsPath)) {
      fs.mkdirSync(dumpsPath)
    }
    try {
      const addrsPath = path.resolve(dumpsPath, 'l1History.json')
      await fsPromise.writeFile(addrsPath, JSON.stringify({
        L1ETHBalance: this.state.L1ETHBalance.toString(),
        L1ETHCostFee: this.state.L1ETHCostFee.toString()
      }))
    } catch (error) {
      console.log(error)
      this.logger.error("Failed to write L1 cost history!")
    }
  }

  private async _writeL2ETHCost(): Promise<void> {
    const dumpsPath = path.resolve(__dirname, '../data')
    if (!fs.existsSync(dumpsPath)) {
      fs.mkdirSync(dumpsPath)
    }
    try {
      const addrsPath = path.resolve(dumpsPath, 'l2History.json')
      await fsPromise.writeFile(addrsPath, JSON.stringify({
        L2ETHCollectFee: this.state.L2ETHCollectFee.toString()
      }))
    } catch (error) {
      console.log(error)
      this.logger.error("Failed to write L1 cost history!")
    }
  }

  private async _getL1Balance(): Promise<void> {
    const balances = await Promise.all([
      this.options.l1RpcProvider.getBalance(this.options.sequencerAddress),
      this.options.l1RpcProvider.getBalance(this.options.proposerAddress),
      this.options.l1RpcProvider.getBalance(this.options.relayerAddress),
      this.options.l1RpcProvider.getBalance(this.options.fastRelayerAddress),
    ])
    const L1ETHBalanceLatest = balances.reduce(
      (acc,cur) => { return acc.add(cur) }, BigNumber.from('0')
    )

    if (!this.state.L1ETHBalance.eq(BigNumber.from('0'))) {
      // condition 1 - L1ETHBalance <= L1ETHBalanceLatest -- do nothing
      // condition 2 - L1ETHBalance > L1ETHBalanceLatest
      if (this.state.L1ETHBalance.gt(L1ETHBalanceLatest)) {
        this.state.L1ETHCostFee = this.state.L1ETHCostFee.add(
          this.state.L1ETHBalance.sub(L1ETHBalanceLatest)
        )
      }
    } else {
      // start from the point that L1ETHCost = L2ETHCollect
      this.state.L1ETHCostFee = BigNumber.from((await this.options.l2RpcProvider.getBalance(this.options.OVM_SequencerFeeVault)).toString())
    }

    this.state.L1ETHBalance = L1ETHBalanceLatest
    this.state.lastQueriedL1Block = await this.options.l2RpcProvider.getBlockNumber()

    // write history
    this._writeL1ETHFee()

    this.logger.info("Got L1 ETH balances", {
      network: "L1",
      data: {
        L1ETHBalance: this.state.L1ETHBalance.toString(),
        L1ETHCostFee: Number(Number(utils.formatEther(this.state.L1ETHCostFee.toString())).toFixed(6)),
        L1ETHCostFee10X: Number((Number(utils.formatEther(this.state.L1ETHCostFee.toString())) * 10).toFixed(6)),
        latestQueriedL1Block: this.state.lastQueriedL1Block,
      }
    })
  }

  private async _getL2GasCost(): Promise<void> {
    const latestQueriedL2Block = await this.options.l2RpcProvider.getBlockNumber()
    const numberOfBlocksInterval = latestQueriedL2Block > this.state.lastQueriedL2Block ?
      latestQueriedL2Block - this.state.lastQueriedL2Block : 1

    const txs = await Promise.all(
      latestQueriedL2Block === this.state.lastQueriedL2Block ?
      [this.options.l2RpcProvider.getBlockWithTransactions(this.state.lastQueriedL2Block)] :
      [...Array(latestQueriedL2Block - this.state.lastQueriedL2Block)]
      .map((_, i) => this.options.l2RpcProvider.getBlockWithTransactions(this.state.lastQueriedL2Block + i + 1))
    )
    const collectGasLimitAndFee = txs.reduce((acc, cur) => {
      return [
        acc[0].add(cur.transactions[0].gasLimit),
        acc[1].add(cur.transactions[0].gasLimit.mul(cur.transactions[0].gasPrice))
      ]
    }, [BigNumber.from('0'), BigNumber.from('0')])

    // Get L2 ETH Fee from contract
    const L2ETHCollectFee =
      BigNumber.from((await this.options.l2RpcProvider.getBalance(this.options.OVM_SequencerFeeVault)).toString())
    // The oETH in OVM_SequencerFeeVault is zero after withdrawing it
    let L2ETHCollectFeeIncreased = BigNumber.from('0')
    if (L2ETHCollectFee.lt(this.state.L2ETHCollectFee)) {
      this.state.L2ETHVaultBalance = L2ETHCollectFee
    } else {
      L2ETHCollectFeeIncreased = L2ETHCollectFee.sub(this.state.L2ETHVaultBalance)
      this.state.L2ETHVaultBalance = L2ETHCollectFee
    }
    this.state.L2ETHCollectFee = this.state.L2ETHCollectFee.add(L2ETHCollectFeeIncreased);
    this.state.lastQueriedL2Block = latestQueriedL2Block
    this.state.avgL2GasLimitPerBlock = collectGasLimitAndFee[0].div(numberOfBlocksInterval)
    this.state.numberOfBlocksInterval = numberOfBlocksInterval

    await this._writeL2ETHCost()

    this.logger.info("Got L2 Gas Cost", {
      network: "L2",
      data: {
        L2ETHCollectFee: Number(Number(utils.formatEther(this.state.L2ETHCollectFee.toString())).toFixed(6)),
        L2ETHCollectFee10X: Number((Number(utils.formatEther(this.state.L2ETHCollectFee.toString())) * 10).toFixed(6)),
        lastQueriedL2Block: this.state.lastQueriedL2Block,
        avgL2GasUsagePerBlock: this.state.avgL2GasLimitPerBlock.toString(),
        numberOfBlocksInterval: this.state.numberOfBlocksInterval,
      }
    })
  }

  private async _updateGasPrice(): Promise<void> {
    const gasPrice = await this.state.OVM_GasPriceOracle.gasPrice()
    const gasPriceInt = parseInt(gasPrice.toString())
    this.logger.info("Got L2 gas price", { gasPrice: gasPriceInt })

    let targetGasPrice = this.options.gasFloorPrice

    if (this.state.L1ETHCostFee.gt(this.state.L2ETHCollectFee)) {
      const estimatedGas = BigNumber.from(this.state.numberOfBlocksInterval).mul(this.state.avgL2GasLimitPerBlock)
      const estimatedGasPrice = this.state.L1ETHCostFee.sub(this.state.L2ETHCollectFee).div(estimatedGas)

      if (estimatedGasPrice.gt(BigNumber.from(this.options.gasRoofPrice))) {
        targetGasPrice = this.options.gasRoofPrice
      } else if (estimatedGasPrice.gt(BigNumber.from(this.options.gasFloorPrice))) {
        targetGasPrice = parseInt(estimatedGasPrice.toString())
      }
    }

    if (gasPriceInt !== targetGasPrice && (
      targetGasPrice > (1 + this.options.gasPriceMinPercentChange) * gasPriceInt ||
      targetGasPrice < (1 - this.options.gasPriceMinPercentChange) * gasPriceInt)
    ) {
      this.logger.debug("Updating L2 gas price...")
      const tx = await this.state.OVM_GasPriceOracle.setGasPrice(targetGasPrice, { gasPrice: 0 })
      await tx.wait()
      this.logger.info("Updated L2 gas price", { gasPrice: targetGasPrice })
    } else {
      this.logger.info("No need to update L2 gas price", { gasPrice: gasPriceInt, targetGasPrice })
    }
  }
}
