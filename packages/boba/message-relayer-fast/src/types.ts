import { BigNumber } from 'ethers'

export interface StateRootBatchHeader {
  batchIndex: BigNumber
  batchRoot: string
  batchSize: BigNumber
  prevTotalElements: BigNumber
  extraData: string
}

export interface SentMessage {
  target: string
  sender: string
  message: string
  messageNonce: number
  encodedMessage: string
  encodedMessageHash: string
  parentTransactionIndex: number
  parentTransactionHash: string
}

export interface SentMessageProof {
  stateRoot: string
  stateRootBatchHeader: StateRootBatchHeader
  stateRootProof: StateRootProof
  stateTrieWitness: string | Buffer
  storageTrieWitness: string | Buffer
}

export interface StateRootProof {
  index: number
  siblings: string[]
}

interface BatchMessagePayload {
  target: string
  message: string
  sender: string
  messageNonce: number
  proof: SentMessageProof
}

export interface BatchMessage {
  payload: BatchMessagePayload
  message: SentMessage
}
