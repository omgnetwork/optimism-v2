import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
import { Contract, BigNumber, utils, ethers, ContractFactory } from 'ethers'
import { Direction } from './shared/watcher-utils'
import { getContractFactory } from '@eth-optimism/contracts'

import L1ERC20Json from '@boba/contracts/artifacts/contracts/test-helpers/L1ERC20.sol/L1ERC20.json'
import L2GovernanceERC20Json from '@boba/contracts/artifacts/contracts/standards/L2GovernanceERC20.sol/L2GovernanceERC20.json'
import TuringHelperJson from '@boba/turing-hybrid-compute/artifacts/contracts/TuringHelper.sol/TuringHelper.json'
import BobaBetJson from '@boba/contracts/artifacts/contracts/BobaBet.sol/BobaBet.json'

import { OptimismEnv } from './shared/env'

describe('Boba Prediction Test', async () => {
  let Factory__L1ERC20: ContractFactory
  let Factory__L2ERC20: ContractFactory

  let L1ERC20: Contract
  let L2ERC20: Contract

  let BobaBetTuringHelper: Contract
  let Factory__BobaBet: ContractFactory
  let BobaBet: Contract
  let BobaTuringCredit: Contract
  let L1StandardBridge: Contract

  let L1BOBAToken: Contract
  let L2BOBAToken: Contract

  let L2StandardBridgeAddress

  let env: OptimismEnv

  const gasOverride = { gasLimit: 3000000 }

  const getStartTimeStamp = async (round: number) => {
    const RoundData = await BobaBet.rounds(round)
    const startTimestamp = RoundData.startTimestamp.toNumber()

    const blockNumber = await env.l2Provider.getBlockNumber()
    const blockData = await env.l2Provider.getBlock(blockNumber)
    const timestamp = blockData.timestamp
    return [startTimestamp, timestamp]
  }

  const getLockTimeStamp = async (round: number) => {
    const RoundData = await BobaBet.rounds(round)
    const lockTimestamp = RoundData.lockTimestamp.toNumber()

    const blockNumber = await env.l2Provider.getBlockNumber()
    const blockData = await env.l2Provider.getBlock(blockNumber)
    const timestamp = blockData.timestamp
    return [lockTimestamp, timestamp]
  }

  const getCloseTimeStamp = async (round: number) => {
    const RoundData = await BobaBet.rounds(round)
    const closeTimestamp = RoundData.closeTimestamp.toNumber()

    const blockNumber = await env.l2Provider.getBlockNumber()
    const blockData = await env.l2Provider.getBlock(blockNumber)
    const timestamp = blockData.timestamp
    return [closeTimestamp, timestamp]
  }

  const moveTimeForward = async (time = 0) => {
    Factory__L1ERC20 = new ContractFactory(
      L1ERC20Json.abi,
      L1ERC20Json.bytecode,
      env.l1Wallet
    )

    L1ERC20 = await Factory__L1ERC20.deploy(
      utils.parseEther('10000000000'),
      'JLKN',
      'JLKN',
      18
    )
    await L1ERC20.deployTransaction.wait()

    Factory__L2ERC20 = getContractFactory('L2StandardERC20', env.l2Wallet)

    L2ERC20 = await Factory__L2ERC20.deploy(
      L2StandardBridgeAddress,
      L1ERC20.address,
      'JLKN',
      'JLKN',
      18
    )
    await L2ERC20.deployTransaction.wait()

    // increase l1 time and in turn change the l2 timestamp
    await env.l1Provider.send('evm_increaseTime', [time])

    const approveL1ERC20TX = await L1ERC20.approve(
      L1StandardBridge.address,
      utils.parseEther('100')
    )
    await approveL1ERC20TX.wait()

    await env.waitForXDomainTransaction(
      L1StandardBridge.depositERC20(
        L1ERC20.address,
        L2ERC20.address,
        utils.parseEther('100'),
        9999999,
        ethers.utils.formatBytes32String(new Date().getTime().toString())
      ),
      Direction.L1ToL2
    )
  }

  before(async () => {
    env = await OptimismEnv.new()

    const BobaTuringCreditAddress = await env.addressManager.getAddress(
      'Proxy__BobaTuringCredit'
    )

    BobaTuringCredit = getContractFactory(
      'BobaTuringCredit',
      env.l2Wallet
    ).attach(BobaTuringCreditAddress)

    const BobaBetTuringHelperAddress = env.addressManager.getAddress(
      'BobaBetTuringHelper'
    )
    const L2BOBAAdress = env.addressManager.getAddress('TK_L2BOBA')

    // Can't be used in the production
    const params = [
      BobaBetTuringHelperAddress,
      env.l2Wallet.address,
      env.l2Wallet.address,
      35, // _intervalSeconds: 35 seconds
      30, // _bufferSeconds: 30 minutes
      utils.parseEther('1'), // _minBetAmount
      300, // _treasuryFee: 300
      L2BOBAAdress,
    ]

    Factory__BobaBet = new ContractFactory(
      BobaBetJson.abi,
      BobaBetJson.bytecode,
      env.l2Wallet
    )

    BobaBet = await Factory__BobaBet.deploy(...params)
    await BobaBet.deployTransaction.wait()

    console.log(BobaBet.address)

    BobaBetTuringHelper = new Contract(
      BobaBetTuringHelperAddress,
      TuringHelperJson.abi,
      env.l2Wallet
    )

    L1BOBAToken = new Contract(
      env.addressesBOBA.TOKENS.BOBA.L1,
      L1ERC20Json.abi,
      env.l1Wallet
    )

    L2BOBAToken = new Contract(
      env.addressesBOBA.TOKENS.BOBA.L2,
      L2GovernanceERC20Json.abi,
      env.l2Wallet
    )

    const L1StandardBridgeAddress = await env.addressManager.getAddress(
      'Proxy__L1StandardBridge'
    )

    L1StandardBridge = getContractFactory(
      'L1StandardBridge',
      env.l1Wallet
    ).attach(L1StandardBridgeAddress)

    L2StandardBridgeAddress = await L1StandardBridge.l2TokenBridge()
  })

  it('Should transfer BOBA to L2', async () => {
    const depositBOBAAmount = utils.parseEther('100')

    const preL1BOBABalance = await L1BOBAToken.balanceOf(env.l1Wallet.address)
    const preL2BOBABalance = await L2BOBAToken.balanceOf(env.l2Wallet.address)

    const approveL1BOBATX = await L1BOBAToken.approve(
      L1StandardBridge.address,
      depositBOBAAmount
    )
    await approveL1BOBATX.wait()

    await env.waitForXDomainTransaction(
      L1StandardBridge.depositERC20(
        L1BOBAToken.address,
        L2BOBAToken.address,
        depositBOBAAmount,
        9999999,
        ethers.utils.formatBytes32String(new Date().getTime().toString())
      ),
      Direction.L1ToL2
    )

    const postL1BOBABalance = await L1BOBAToken.balanceOf(env.l1Wallet.address)
    const postL2BOBABalance = await L2BOBAToken.balanceOf(env.l2Wallet.address)

    expect(preL1BOBABalance).to.deep.eq(
      postL1BOBABalance.add(depositBOBAAmount)
    )

    expect(preL2BOBABalance).to.deep.eq(
      postL2BOBABalance.sub(depositBOBAAmount)
    )
  })

  it('Should add credits for BobaBetTuringHelper', async () => {
    const depositAmount = utils.parseEther('10')
    const TuringHelperAddress = BobaBetTuringHelper.address

    const preBalance = await BobaTuringCredit.prepaidBalance(
      TuringHelperAddress
    )

    const approveTx = await L2BOBAToken.approve(
      BobaTuringCredit.address,
      depositAmount
    )
    await approveTx.wait()

    const depositTx = await BobaTuringCredit.addBalanceTo(
      depositAmount,
      TuringHelperAddress
    )
    await depositTx.wait()

    const postBalance = await BobaTuringCredit.prepaidBalance(
      TuringHelperAddress
    )

    expect(postBalance).to.be.deep.eq(preBalance.add(depositAmount))
  })

  it('Should add permitted caller', async () => {
    const tx = await BobaBetTuringHelper.addPermittedCaller(BobaBet.address)
    await tx.wait()

    const permittedStatus = await BobaBetTuringHelper.permittedCaller(
      BobaBet.address
    )

    expect(permittedStatus).to.be.deep.eq(true)
  })

  it('Should start genesis round', async () => {
    const tx = await BobaBet.genesisStartRound()
    await tx.wait()

    const currentEpoch = await BobaBet.currentEpoch()
    expect(currentEpoch).to.be.deep.eq(BigNumber.from('1'))
  })

  it('Should lock genesis round', async () => {
    let [genesisTimestamp, timestamp] = await getLockTimeStamp(1)

    while (timestamp <= genesisTimestamp) {
      console.log(`  Waiting for the genesis round to be locked...`)
      await moveTimeForward(15)
      const timestampResult = await getLockTimeStamp(1)
      genesisTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }

    const tx = await BobaBet.genesisLockRound()
    await tx.wait()

    const currentEpoch = await BobaBet.currentEpoch()
    expect(currentEpoch).to.be.deep.eq(BigNumber.from('2'))
  })

  it('Should lock round two and start round three', async () => {
    let [round_2_lockTimestamp, timestamp] = await getLockTimeStamp(2)

    while (timestamp <= round_2_lockTimestamp) {
      console.log(`  Waiting for the round two to be locked...`)
      await moveTimeForward(15)
      const timestampResult = await getLockTimeStamp(2)
      round_2_lockTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }

    const tx = await BobaBet.executeRound(gasOverride)
    await tx.wait()

    const round_1 = await BobaBet.rounds(1)

    // Turing result should not be zero
    const closeNumber = round_1.closeNumber
    expect(closeNumber).not.eq(0)
  })

  it('Should bet up and down at round 3', async () => {
    const transferAmount = utils.parseEther('5')
    const epoch = 3

    const preWallet_1_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet.address
    )
    const preWallet_2_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet_2.address
    )

    const transferTx = await L2BOBAToken.connect(env.l2Wallet).transfer(
      env.l2Wallet_2.address,
      transferAmount
    )
    await transferTx.wait()

    const postWallet_1_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet.address
    )
    const postWallet_2_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet_2.address
    )

    expect(preWallet_1_Balance).to.be.deep.eq(
      postWallet_1_Balance.add(transferAmount)
    )
    expect(preWallet_2_Balance).to.be.deep.eq(
      postWallet_2_Balance.sub(transferAmount)
    )

    // Bet up and bet down
    const approveUpTx = await L2BOBAToken.connect(env.l2Wallet).approve(
      BobaBet.address,
      transferAmount
    )
    await approveUpTx.wait()

    const approveDownTx = await L2BOBAToken.connect(env.l2Wallet_2).approve(
      BobaBet.address,
      transferAmount
    )
    await approveDownTx.wait()

    // Waiting for a period
    let [round_3_startTimestamp, timestamp] = await getStartTimeStamp(epoch)

    while (timestamp <= round_3_startTimestamp) {
      console.log(`  Waiting for the round three to start...`)
      await moveTimeForward(15)
      const timestampResult = await getStartTimeStamp(epoch)
      round_3_startTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }

    const betUpTx = await BobaBet.betUp(epoch, transferAmount, gasOverride)
    await betUpTx.wait()

    const betDownTx = await BobaBet.connect(env.l2Wallet_2).betDown(
      epoch,
      transferAmount,
      gasOverride
    )
    await betDownTx.wait()

    const upAmount = (await BobaBet.ledger(epoch, env.l2Wallet.address)).amount
    const upPosition = (await BobaBet.ledger(epoch, env.l2Wallet.address)).position
    const downAmount = (await BobaBet.ledger(epoch, env.l2Wallet_2.address)).amount
    const downPosition = (await BobaBet.ledger(epoch, env.l2Wallet_2.address)).position

    expect(upAmount).to.be.deep.eq(transferAmount)
    expect(downAmount).to.be.deep.eq(transferAmount)
    expect(upPosition).to.be.deep.eq(0)
    expect(downPosition).to.be.deep.eq(1)
  })

  it('Should not claim round 3 and round 4', async () => {
    // Unstarted round
    await expect(BobaBet.claim([4])).to.be.revertedWith('Round has not started')
    // Round not end
    await expect(BobaBet.claim([3])).to.be.revertedWith('Round has not ended')
  })

  it('Should lock round 3 and start round 4', async () => {
    let [round_3_lockTimestamp, timestamp] = await getLockTimeStamp(3)

    while (timestamp <= round_3_lockTimestamp) {
      console.log(`  Waiting for the round three to be locked...`)
      await moveTimeForward(15)
      const timestampResult = await getLockTimeStamp(3)
      round_3_lockTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }

    const tx = await BobaBet.executeRound(gasOverride)
    await tx.wait()

    const round_2 = await BobaBet.rounds(2)

    // Turing result should not be zero
    const closeNumber = round_2.closeNumber
    expect(closeNumber).not.eq(0)
  })

  it('Should lock round 4 and start round 5', async () => {
    let [round_4_lockTimestamp, timestamp] = await getLockTimeStamp(4)

    while (timestamp <= round_4_lockTimestamp) {
      console.log(`  Waiting for the round four to be locked...`)
      await moveTimeForward(15)
      const timestampResult = await getLockTimeStamp(4)
      round_4_lockTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }

    const tx = await BobaBet.executeRound(gasOverride)
    await tx.wait()

    const round_3 = await BobaBet.rounds(3)

    // Turing result should not be zero
    const closeNumber = round_3.closeNumber
    expect(closeNumber).not.eq(0)
  })

  it('Should claim round 3', async () => {
    let [round_3_closeTimestamp, timestamp] = await getCloseTimeStamp(3)

    if (timestamp <= round_3_closeTimestamp) {
      // Round not end
      await expect(BobaBet.claim([3])).to.be.revertedWith('Round has not ended')
    } else {
      while (timestamp < round_3_closeTimestamp) {
        console.log(`  Waiting for the round three to be close...`)
        await moveTimeForward(15)
        const timestampResult = await getCloseTimeStamp(3)
        round_3_closeTimestamp = timestampResult[0]
        timestamp = timestampResult[1]
      }

      // Should claim the right amount
      const round_3 = await BobaBet.rounds(3)
      const closeNumber = round_3.closeNumber
      const treasuryFee = await BobaBet.treasuryFee()
      let rewardBaseCalAmount
      // Down wins
      if (closeNumber >= 128) {
        rewardBaseCalAmount = round_3.downAmount
      }
      // Up wins
      else {
        rewardBaseCalAmount = round_3.upAmount
      }
      const treasuryAmt = round_3.totalAmount
        .mul(treasuryFee)
        .div(BigNumber.from('10000'))
      const rewardAmount = round_3.totalAmount.sub(treasuryAmt)

      const addedReward = rewardBaseCalAmount
        .mul(rewardAmount)
        .div(rewardBaseCalAmount)

      let preBobaBalance
      let postBobaBalance
      if (closeNumber >= 128) {
        preBobaBalance = await L2BOBAToken.balanceOf(env.l2Wallet.address)
        const tx = await BobaBet.connect(env.l2Wallet).claim([3])
        await tx.wait()
        postBobaBalance = await L2BOBAToken.balanceOf(env.l2Wallet.address)
      } else {
        preBobaBalance = await L2BOBAToken.balanceOf(env.l2Wallet_2.address)
        const tx = await BobaBet.connect(env.l2Wallet_2).claim([3])
        await tx.wait()
        postBobaBalance = await L2BOBAToken.balanceOf(env.l2Wallet_2.address)
      }

      expect(preBobaBalance).to.be.deep.eq(postBobaBalance.sub(addedReward))
    }
  })

  it('Should bet up and down at round 5', async () => {
    const transferAmount = utils.parseEther('5')
    const epoch = 5

    const preWallet_1_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet.address
    )
    const preWallet_2_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet_2.address
    )

    const transferTx = await L2BOBAToken.connect(env.l2Wallet).transfer(
      env.l2Wallet_2.address,
      transferAmount
    )
    await transferTx.wait()

    const postWallet_1_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet.address
    )
    const postWallet_2_Balance = await L2BOBAToken.balanceOf(
      env.l2Wallet_2.address
    )

    expect(preWallet_1_Balance).to.be.deep.eq(
      postWallet_1_Balance.add(transferAmount)
    )
    expect(preWallet_2_Balance).to.be.deep.eq(
      postWallet_2_Balance.sub(transferAmount)
    )

    // Bet up and bet down
    const approveUpTx = await L2BOBAToken.connect(env.l2Wallet).approve(
      BobaBet.address,
      transferAmount
    )
    await approveUpTx.wait()

    const approveDownTx = await L2BOBAToken.connect(env.l2Wallet_2).approve(
      BobaBet.address,
      transferAmount
    )
    await approveDownTx.wait()

    // Waiting for a period
    let [round_5_startTimestamp, timestamp] = await getStartTimeStamp(epoch)

    while (timestamp <= round_5_startTimestamp) {
      console.log(`  Waiting for the round five to start...`)
      await moveTimeForward(15)
      const timestampResult = await getStartTimeStamp(epoch)
      round_5_startTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }

    const betUpTx = await BobaBet.betUp(epoch, transferAmount)
    await betUpTx.wait()

    const betDownTx = await BobaBet.connect(env.l2Wallet_2).betDown(
      epoch,
      transferAmount
    )
    await betDownTx.wait()

    const upAmount = (await BobaBet.ledger(epoch, env.l2Wallet.address)).amount
    const upPosition = (await BobaBet.ledger(epoch, env.l2Wallet.address)).position
    const downAmount = (await BobaBet.ledger(epoch, env.l2Wallet_2.address)).amount
    const downPosition = (await BobaBet.ledger(epoch, env.l2Wallet_2.address)).position

    expect(upAmount).to.be.deep.eq(transferAmount)
    expect(downAmount).to.be.deep.eq(transferAmount)
    expect(upPosition).to.be.deep.eq(0)
    expect(downPosition).to.be.deep.eq(1)
  })

  it('Should lock round 5 and start round 6', async () => {
    let [round_5_lockTimestamp, timestamp] = await getLockTimeStamp(5)

    while (timestamp <= round_5_lockTimestamp) {
      console.log(`  Waiting for the round five to be locked...`)
      await moveTimeForward(15)
      const timestampResult = await getLockTimeStamp(5)
      round_5_lockTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }

    const tx = await BobaBet.executeRound(gasOverride)
    await tx.wait()

    const round_4 = await BobaBet.rounds(4)

    // Turing result should not be zero
    const closeNumber = round_4.closeNumber
    expect(closeNumber).not.eq(0)
  })

  it('Should close round 5', async () => {
    let [round_5_closeTimestamp, timestamp] = await getCloseTimeStamp(5)

    while (timestamp <= round_5_closeTimestamp) {
      console.log(`  Waiting for the round five to be closed...`)
      await moveTimeForward(15)
      const timestampResult = await getCloseTimeStamp(5)
      round_5_closeTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }
  })

  it('Should await for bufferSeconds', async () => {
    let [round_5_closeTimestamp, timestamp] = await getCloseTimeStamp(5)

    const bufferSeconds = (await BobaBet.bufferSeconds()).toNumber()
    while (timestamp <= round_5_closeTimestamp + bufferSeconds) {
      console.log(`  Waiting for the round five to be closed...`)
      await moveTimeForward(60)
      const timestampResult = await getCloseTimeStamp(5)
      round_5_closeTimestamp = timestampResult[0]
      timestamp = timestampResult[1]
    }
  })

  it('Should not claim round 3 for twice ', async () => {
    await expect(BobaBet.claim([3])).to.be.revertedWith('Not eligible for claim')
  })

  it('Should get refund for round 5', async () => {
    const amount_1 = (await BobaBet.ledger(5, env.l2Wallet.address)).amount
    const preBobaBalance_1 = await L2BOBAToken.balanceOf(env.l2Wallet.address)
    const tx_1 = await BobaBet.connect(env.l2Wallet).claim([5])
    await tx_1.wait()
    const postBobaBalance_1 = await L2BOBAToken.balanceOf(env.l2Wallet.address)

    expect(postBobaBalance_1).to.be.deep.eq(preBobaBalance_1.add(amount_1))

    const amount_2 = (await BobaBet.ledger(5, env.l2Wallet_2.address)).amount
    const preBobaBalance_2 = await L2BOBAToken.balanceOf(env.l2Wallet_2.address)
    const tx_2 = await BobaBet.connect(env.l2Wallet_2).claim([5])
    await tx_2.wait()
    const postBobaBalance_2 = await L2BOBAToken.balanceOf(env.l2Wallet_2.address)

    expect(postBobaBalance_2).to.be.deep.eq(preBobaBalance_2.add(amount_2))
  })
})
