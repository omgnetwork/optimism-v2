import { RequestToken } from '../generated/TokenPool/TokenPool'
import { TokenPool } from '../generated/schema'

export function handleRequestToken(event: RequestToken): void {
  let tokenPool = new TokenPool(event.transaction.hash.toHex())
  tokenPool.sender = event.params._requestAddress
  tokenPool.amount = event.params._amount.toString()
  tokenPool.timestamp = event.params._timestamp.toString()
  tokenPool.save()
}
