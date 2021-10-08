import { expect } from '../../../setup'

/* External Imports */
import { ethers } from 'hardhat'
import { Signer, ContractFactory, Contract, constants } from 'ethers'
import { smockit, MockContract } from '@eth-optimism/smock'
import { solidityKeccak256 } from 'ethers/lib/utils'

/* Internal Imports */
import {
  NON_NULL_BYTES32,
  NON_ZERO_ADDRESS,
  encodeXDomainCalldata,
  getNextBlockNumber,
} from '../../../helpers'
import { getContractInterface, predeploys } from '../../../../src'

describe('L2CrossDomainMessenger', () => {
  let signer: Signer
  before(async () => {
    ;[signer] = await ethers.getSigners()
  })

  let Mock__TargetContract: MockContract
  let Mock__L1CrossDomainMessenger: MockContract
  let Mock__OVM_L1MessageSender: MockContract
  let Mock__OVM_L2ToL1MessagePasser: MockContract
  before(async () => {
    Mock__TargetContract = await smockit(
      await ethers.getContractFactory('Helper_SimpleProxy')
    )
    Mock__L1CrossDomainMessenger = await smockit(
      await ethers.getContractFactory('L1CrossDomainMessenger')
    )
    Mock__OVM_L1MessageSender = await smockit(
      getContractInterface('iOVM_L1MessageSender'),
      { address: predeploys.OVM_L1MessageSender }
    )
    Mock__OVM_L2ToL1MessagePasser = await smockit(
      await ethers.getContractFactory('OVM_L2ToL1MessagePasser'),
      { address: predeploys.OVM_L2ToL1MessagePasser }
    )
  })

  let Factory__L2CrossDomainMessenger: ContractFactory
  before(async () => {
    Factory__L2CrossDomainMessenger = await ethers.getContractFactory(
      'L2CrossDomainMessenger'
    )
  })

  let L2CrossDomainMessenger: Contract
  beforeEach(async () => {
    L2CrossDomainMessenger = await Factory__L2CrossDomainMessenger.deploy(
      Mock__L1CrossDomainMessenger.address
    )
  })

  describe('sendMessage', () => {
    const target = NON_ZERO_ADDRESS
    const message = NON_NULL_BYTES32
    const gasLimit = 100_000

    it('should be able to send a single message', async () => {
      await expect(
        L2CrossDomainMessenger.sendMessage(target, message, gasLimit)
      ).to.not.be.reverted

      expect(
        Mock__OVM_L2ToL1MessagePasser.smocked.passMessageToL1.calls[0]
      ).to.deep.equal([
        encodeXDomainCalldata(target, await signer.getAddress(), message, 0),
      ])
    })

    it('should be able to send the same message twice', async () => {
      await L2CrossDomainMessenger.sendMessage(target, message, gasLimit)

      await expect(
        L2CrossDomainMessenger.sendMessage(target, message, gasLimit)
      ).to.not.be.reverted
    })
  })

  describe('relayMessage', () => {
    let target: string
    let message: string
    let sender: string
    before(async () => {
      target = Mock__TargetContract.address
      message = Mock__TargetContract.interface.encodeFunctionData('setTarget', [
        NON_ZERO_ADDRESS,
      ])
      sender = await signer.getAddress()
    })

    beforeEach(async () => {
      Mock__OVM_L1MessageSender.smocked.getL1MessageSender.will.return.with(
        Mock__L1CrossDomainMessenger.address
      )
    })

    it('should revert if the L1 message sender is not the L1CrossDomainMessenger', async () => {
      Mock__OVM_L1MessageSender.smocked.getL1MessageSender.will.return.with(
        constants.AddressZero
      )

      await expect(
        L2CrossDomainMessenger.relayMessage(target, sender, message, 0)
      ).to.be.revertedWith('Provided message could not be verified.')
    })

    it('should send a call to the target contract', async () => {
      await L2CrossDomainMessenger.relayMessage(target, sender, message, 0)

      expect(Mock__TargetContract.smocked.setTarget.calls[0]).to.deep.equal([
        NON_ZERO_ADDRESS,
      ])
    })

    it('the xDomainMessageSender is reset to the original value', async () => {
      await expect(
        L2CrossDomainMessenger.xDomainMessageSender()
      ).to.be.revertedWith('xDomainMessageSender is not set')
      await L2CrossDomainMessenger.relayMessage(target, sender, message, 0)
      await expect(
        L2CrossDomainMessenger.xDomainMessageSender()
      ).to.be.revertedWith('xDomainMessageSender is not set')
    })

    it('should revert if trying to send the same message twice', async () => {
      Mock__OVM_L1MessageSender.smocked.getL1MessageSender.will.return.with(
        Mock__L1CrossDomainMessenger.address
      )

      await L2CrossDomainMessenger.relayMessage(target, sender, message, 0)

      await expect(
        L2CrossDomainMessenger.relayMessage(target, sender, message, 0)
      ).to.be.revertedWith('Provided message has already been received.')
    })

    it('should not make a call if the target is the L2 MessagePasser', async () => {
      Mock__OVM_L1MessageSender.smocked.getL1MessageSender.will.return.with(
        Mock__L1CrossDomainMessenger.address
      )
      target = predeploys.OVM_L2ToL1MessagePasser
      message = Mock__OVM_L2ToL1MessagePasser.interface.encodeFunctionData(
        'passMessageToL1(bytes)',
        [NON_NULL_BYTES32]
      )

      const resProm = L2CrossDomainMessenger.relayMessage(
        target,
        sender,
        message,
        0
      )

      // The call to relayMessage() should succeed.
      await expect(resProm).to.not.be.reverted

      // There should be no 'relayedMessage' event logged in the receipt.
      const logs = (
        await Mock__OVM_L2ToL1MessagePasser.provider.getTransactionReceipt(
          (
            await resProm
          ).hash
        )
      ).logs
      expect(logs).to.deep.equal([])

      // The message should be registered as successful.
      expect(
        await L2CrossDomainMessenger.successfulMessages(
          solidityKeccak256(
            ['bytes'],
            [encodeXDomainCalldata(target, sender, message, 0)]
          )
        )
      ).to.be.true
    })

    it('should revert if trying to reenter `relayMessage`', async () => {
      Mock__OVM_L1MessageSender.smocked.getL1MessageSender.will.return.with(
        Mock__L1CrossDomainMessenger.address
      )

      const reentrantMessage =
        L2CrossDomainMessenger.interface.encodeFunctionData('relayMessage', [
          target,
          sender,
          message,
          1,
        ])

      // Calculate xDomainCallData used for indexing
      // (within the first call to the L2 Messenger).
      const xDomainCallData = encodeXDomainCalldata(
        L2CrossDomainMessenger.address,
        sender,
        reentrantMessage,
        0
      )

      // Make the call.
      await L2CrossDomainMessenger.relayMessage(
        L2CrossDomainMessenger.address,
        sender,
        reentrantMessage,
        0
      )

      // We can't test for the nonReentrant revert string because it occurs in the second call frame,
      // and target.call() won't "bubble up" the revert. So we need to use other criteria to ensure the
      // right things are happening.
      // Criteria 1: the reentrant message is NOT listed in successful messages.
      expect(
        await L2CrossDomainMessenger.successfulMessages(
          solidityKeccak256(['bytes'], [xDomainCallData])
        )
      ).to.be.false

      // Criteria 2: the relayID of the reentrant message is recorded.
      // Get blockNumber at time of the call.
      const blockNumber = (await getNextBlockNumber(ethers.provider)) - 1
      const relayId = solidityKeccak256(
        ['bytes'],
        [
          ethers.utils.solidityPack(
            ['bytes', 'address', 'uint256'],
            [xDomainCallData, sender, blockNumber]
          ),
        ]
      )

      expect(await L2CrossDomainMessenger.relayedMessages(relayId)).to.be.true

      // Criteria 3: the target contract did not receive a call.
      expect(Mock__TargetContract.smocked.setTarget.calls[0]).to.be.undefined
    })
  })
})
