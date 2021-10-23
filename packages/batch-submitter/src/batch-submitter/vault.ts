import * as fs from 'fs'
import fetch from 'node-fetch'
import {
  AppendSequencerBatch,
  AppendStateBatch,
  TxSubmissionHooks,
} from '../utils'
import { Vault } from '..'
import { BatchContext } from '../transaction-chain-contract'

export interface VaultPopulatedTransaction {
  url: RequestInfo
  requestInit: RequestInit
}

export interface VaultTransactionResponse {
  requestId: string
  leaseId: string
  renewable: boolean
  leaseDuration: number
  data: VaultTransactionResponseData
  wrapInfo: any
  warnings: any
  auth: any
}

export interface VaultTransactionResponseData {
  contract: string
  from: string
  gasLimit: boolean
  gasPrice: number
  nonce: number
  signedTransaction: string
  transactionHash: string
}

export const submitToVault = async (
  call: AppendStateBatch | AppendSequencerBatch,
  vault: Vault,
  hooks: TxSubmissionHooks,
  gasPrice: number
): Promise<string> => {
  const token = getToken(vault)
  if (call.type === 'AppendStateBatch') {
    const url =
      vault.vault_url +
      '/v1/immutability-eth-plugin/wallets/proposer/accounts/' +
      vault.account_address +
      '/ovm/appendStateBatch'
    const requestInit = {
      method: 'PUT',
      headers: {
        'X-Vault-Request': 'true',
        'X-Vault-Token': token,
      },
      body: JSON.stringify({
        nonce: call.nonce,
        gas_price: gasPrice,
        contract: call.address,
        batch: call.batch,
        should_start_at_element: call.offsetStartsAtIndex,
      }),
    }
    hooks.beforeSendTransaction({ url, requestInit })
    const response = await fetch(url, requestInit)
    const data = await response.json()
    hooks.onTransactionResponse(data)
    return data.data.transaction_hash
  } else if (call.type === 'AppendSequencerBatch') {
    const url =
      vault.vault_url +
      '/v1/immutability-eth-plugin/wallets/sequencer/accounts/' +
      vault.account_address +
      '/ovm/appendSequencerBatch'
    const requestInit = {
      method: 'PUT',
      headers: {
        'X-Vault-Request': 'true',
        'X-Vault-Token': token,
      },
      body: JSON.stringify({
        nonce: call.nonce,
        gas_price: gasPrice,
        contract: call.address,
        should_start_at_element: call.batchParams.shouldStartAtElement,
        total_elements_to_append: call.batchParams.totalElementsToAppend,
        contexts: transformContexts(call.batchParams.contexts),
        transactions: call.batchParams.transactions,
      }),
    }
    hooks.beforeSendTransaction({ url, requestInit })
    const response = await fetch(url, requestInit)
    const data = await response.json()
    hooks.onTransactionResponse(data)
    return data.data.transaction_hash
  }
}

export const clearPendingTransactions = async (
  vault: Vault
): Promise<string[]> => {
  const token = getToken(vault)
  const url =
    vault.vault_url +
    '/v1/immutability-eth-plugin/wallets/proposer/accounts/' +
    vault.account_address +
    '/ovm/appendStateBatch'
  const requestInit = {
    method: 'PUT',
    headers: {
      'X-Vault-Request': 'true',
      'X-Vault-Token': token,
    },
  }
  const response = await fetch(url, requestInit)
  const data = await response.json()
  return data.transaction_hashes
}

//needs to be stringyfied so that Vault can consume it
const transformContexts = (contexts: BatchContext[]): any => {
  const apiContexts: any = []
  for (const context of contexts) {
    apiContexts.push(
      JSON.stringify({
        num_sequenced_transactions: context.numSequencedTransactions,
        num_subsequent_queue_transactions:
          context.numSubsequentQueueTransactions,
        timestamp: context.timestamp,
        block_number: context.blockNumber,
      })
    )
  }
  return apiContexts
}

const getToken = (vault: Vault): string => {
  const env = process.env
  if (env.AWS_SINK_JWT_TOKEN_PATH === undefined) {
    return vault.authentication_token
  } else {
    if (fs.existsSync(env.AWS_SINK_JWT_TOKEN_PATH)) {
      return fs.readFileSync(env.AWS_SINK_JWT_TOKEN_PATH, 'utf-8')
    } else {
      return vault.authentication_token
    }
  }
}
