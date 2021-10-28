#!/bin/bash


function banner {
    echo "------------------------------------------------------------------------------------------------------------------------------------"
}

function appendStateBatch {
  banner
  banner
  banner
  #getTotalElements 0x7aa63a86
  SHOULD_START_AT_ELEMENT=$(($(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_call", "params":[{"to": "'"$OVM_SCC"'", "data": "0x7aa63a86"}], "id":1}' | jq .result | tr -d '"')))
  echo "Append State Batch tests"
  echo "*** SHOULD NOT FAIL! ***"
  echo "vault write -format=json immutability-eth-plugin/wallets/proposer/accounts/$PROPOSER_ADDRESS/ovm/appendStateBatch batch="0x1111111111111111111111111111111111111111111111111111111111111111" batch="0x1111111111111111111111111111111111111111111111111111111111111111" should_start_at_element=$SHOULD_START_AT_ELEMENT nonce=0 gas_price=$GAS_PRICE_HIGH contract=$OVM_SCC"
  vault write -format=json immutability-eth-plugin/wallets/proposer/accounts/$PROPOSER_ADDRESS/ovm/appendStateBatch batch="0x1111111111111111111111111111111111111111111111111111111111111111" batch="0x1111111111111111111111111111111111111111111111111111111111111111" should_start_at_element=$SHOULD_START_AT_ELEMENT nonce=0 gas_price=$GAS_PRICE_HIGH contract=$OVM_SCC
  check_result $? 0
  banner
  vault write  -output-curl-string immutability-eth-plugin/wallets/proposer/accounts/$PROPOSER_ADDRESS/ovm/appendStateBatch nonce=0 gas_price=$GAS_PRICE_HIGH batch="0x1111111111111111111111111111111111111111111111111111111111111111" batch="0x1111111111111111111111111111111111111111111111111111111111111111" should_start_at_element=$SHOULD_START_AT_ELEMENT contract=$OVM_SCC
}

function appendSequencerBatch {
  banner
  banner
  banner
  echo "Append Sequencer Batch tests"
  echo "*** SHOULD NOT FAIL! ***"
  echo "AUTHORIZED SUBMISSION OF AppendSequencerBatch BY $SEQUENCER_ADDRESS"
  #GetNextQueueIndex 0x7a167a8a
  GET_NEXT_QUEUE_INDEX=$(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_call", "params":[{"to": "'"$OVM_CTC"'", "data": "0x7a167a8a"}], "id":1}' | jq .result | sed 's/0x//' | tr -d '"')
  #GetQueueElement 0x2a7f18be
  GET_QUEUE_ELEMENT=$(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_call", "params":[{"to": "'"$OVM_CTC"'", "data": "0x2a7f18be'"$GET_NEXT_QUEUE_INDEX"'"}], "id":1}' | jq .result | tr -d '"')
  #getTotalElements 0x7aa63a86
  SHOULD_START_AT_ELEMENT=$(($(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_call", "params":[{"to": "'"$OVM_CTC"'", "data": "0x7aa63a86"}], "id":1}' | jq .result | tr -d '"')))
  TIMESTAMP=$(($(echo $GET_QUEUE_ELEMENT | cut -c67-130 | (echo -n 0x && cat))))
  BLOCKNUMBER=$(($(echo $GET_QUEUE_ELEMENT | cut -c131-194 | (echo -n 0x && cat))))
  echo $TIMESTAMP
  echo $BLOCKNUMBER
  echo "vault write -format=json immutability-eth-plugin/wallets/sequencer/accounts/$SEQUENCER_ADDRESS/ovm/appendSequencerBatch should_start_at_element=$SHOULD_START_AT_ELEMENT total_elements_to_append=2 contexts="{\"num_sequenced_transactions\": 2, \"num_subsequent_queue_transactions\": 0, \"timestamp\": $TIMESTAMP, \"block_number\": $BLOCKNUMBER}" transactions="0x11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111" transactions="0x11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111" nonce=0 gas_price=$GAS_PRICE_HIGH2 contract=$OVM_CTC"
  vault write -format=json immutability-eth-plugin/wallets/sequencer/accounts/$SEQUENCER_ADDRESS/ovm/appendSequencerBatch should_start_at_element=$SHOULD_START_AT_ELEMENT total_elements_to_append=2 contexts="{\"num_sequenced_transactions\": 2, \"num_subsequent_queue_transactions\": 0, \"timestamp\": $TIMESTAMP, \"block_number\": $BLOCKNUMBER}" transactions="0x11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111" transactions="0x11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111" nonce=0 gas_price=$GAS_PRICE_HIGH2 contract=$OVM_CTC
  check_result $? 0
  banner
  vault write  -output-curl-string immutability-eth-plugin/wallets/sequencer/accounts/$SEQUENCER_ADDRESS/ovm/appendSequencerBatch should_start_at_element=$SHOULD_START_AT_ELEMENT total_elements_to_append=2 contexts="{\"num_sequenced_transactions\": 2, \"num_subsequent_queue_transactions\": 0, \"timestamp\": $TIMESTAMP, \"block_number\": $BLOCKNUMBER}" transactions="0x11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111" transactions="0x11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111" nonce=0 gas_price=$GAS_PRICE_HIGH2 contract=$OVM_CTC
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"

source $DIR/smoke.env.sh
OVM="OVM-wallet"
node index.js $SEQUENCER_ADDRESS
node index.js $PROPOSER_ADDRESS
banner
echo "CONFIGURE MOUNT"
echo "vault write -format=json immutability-eth-plugin/config  rpc_url='$RPC_URL' chain_id='$CHAIN_ID' rpc_l2_url='$RPC_L2_URL' chain_l2_id='$CHAIN_L2_ID'"
vault write -format=json immutability-eth-plugin/config rpc_url="$RPC_URL" chain_id="$CHAIN_ID" rpc_l2_url="$RPC_L2_URL" chain_l2_id="$CHAIN_L2_ID"
check_result $? 0
banner
#vault write  -output-curl-string immutability-eth-plugin/config rpc_url="$RPC_URL" chain_id="$CHAIN_ID" rpc_l2_url="$RPC_L2_URL" chain_l2_id="$CHAIN_L2_ID"

# banner
echo "CREATE WALLET WITH MNEMONIC"
echo "vault write -format=json immutability-eth-plugin/wallets/$OVM mnemonic='$MNEMONIC'"
vault write -format=json immutability-eth-plugin/wallets/$OVM mnemonic="$MNEMONIC"
check_result $? 0
banner
#vault write  -output-curl-string immutability-eth-plugin/wallets/$OVM mnemonic="$MNEMONIC"

banner
echo "CREATE UNAUTHORIZED ACCOUNT IN WALLET"
echo "vault write -format=json -f immutability-eth-plugin/wallets/$OVM/accounts"
UNAUTHORIZED=$(vault write -f -field=address immutability-eth-plugin/wallets/$OVM/accounts)
check_result $? 0
echo "UNAUTHORIZED=$UNAUTHORIZED"
banner
#vault write -format=json -f -output-curl-string immutability-eth-plugin/wallets/$OVM/accounts
banner

#this is a POLICY test
banner
banner
banner
echo "Append Sequencer Batch tests"
echo "*** SHOULD FAIL! ***"
echo "UNAUTHORIZED SUBMISSION OF AppendSequencerBatch BY $UNAUTHORIZED"
echo "vault write -format=json immutability-eth-plugin/wallets/$OVM/accounts/$UNAUTHORIZED/ovm/appendSequencerBatch should_start_at_element=10 total_elements_to_append=1 contexts="{\"num_sequenced_transactions\": 2, \"num_subsequent_queue_transactions\": 1, \"timestamp\": 100, \"block_number\": 200}" transactions="0x45423400000011" transactions="0x45423400000012" nonce=0 gas_price=$GAS_PRICE_HIGH contract=$OVM_CTC"
SEQUENCER_TOKEN=$(vault token create -field=token -period=30m -policy=append-sequencer-batch)
VAULT_TOKEN=$SEQUENCER_TOKEN vault write -format=json immutability-eth-plugin/wallets/$OVM/accounts/$UNAUTHORIZED/ovm/appendSequencerBatch should_start_at_element=10 total_elements_to_append=1 contexts="{\"num_sequenced_transactions\": 2, \"num_subsequent_queue_transactions\": 1, \"timestamp\": 100, \"block_number\": 200}" transactions="0x45423400000011" transactions="0x45423400000012" nonce=0 gas_price=$GAS_PRICE_HIGH contract=$OVM_CTC
check_result $? 2
banner
vault write  -output-curl-string immutability-eth-plugin/wallets/$OVM/accounts/$UNAUTHORIZED/ovm/appendSequencerBatch should_start_at_element=10 total_elements_to_append=1 contexts="{\"num_sequenced_transactions\": 2, \"num_subsequent_queue_transactions\": 1, \"timestamp\": 100, \"block_number\": 200}" transactions="0x45423400000011" transactions="0x45423400000012" nonce=0 gas_price=$GAS_PRICE_HIGH contract=$OVM_CTC

appendSequencerBatch

appendStateBatch

# this particular test does not work towards Hardhat
# because the pending block response does not conform to what Geth and other clients return
# https://github.com/nomiclabs/hardhat/pull/1990
# banner
# banner
# banner
# echo "Gathering pending transactions"
# curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"evm_setAutomine", "params":[false], "id":1}' | jq
# curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"evm_setIntervalMining", "params":[5000], "id":2}' | jq
# appendSequencerBatch
# echo "eth_getBlockByNumber before re-submission:"
# PENDING_TRANSACTIONS=$(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_getBlockByNumber", "params":["pending", false], "id":3}' | jq .result.transactions)
# echo "Clear pending transactions"
# echo "*** SHOULD NOT FAIL! ***"
# #there's no body on a HTTP PUT so we use force
# echo "vault write -force -format=json immutability-eth-plugin/wallets/sequencer/accounts/$SEQUENCER_ADDRESS/ovm/clearPendingTransactions"
# vault write -force -format=json immutability-eth-plugin/wallets/sequencer/accounts/$SEQUENCER_ADDRESS/ovm/clearPendingTransactions
# check_result $? 0
# banner
# vault write -force -output-curl-string immutability-eth-plugin/wallets/sequencer/accounts/$SEQUENCER_ADDRESS/ovm/clearPendingTransactions
# echo "eth_getBlockByNumber after re-submission:"
# REPLACED_TRANSACTIONS=$(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_getBlockByNumber", "params":["pending", false], "id":4}' | jq .result.transactions)
# if [ "$PENDING_TRANSACTIONS" == "$REPLACED_TRANSACTIONS" ]; then
#   echo 'DID NOT PASS THE REQUIRED TEST, THE TRANSACTION WAS NOT REPLACED' && exit 1
# fi
# curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"evm_setAutomine", "params":[true], "id":5}' | jq
# echo "eth_getBlockByNumber after re-submission and enabling mining:"
# sleep 5s
# EMPTY=$(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_getBlockByNumber", "params":["pending", false], "id":6}' | jq .result.transactions)
# if [ "$EMPTY" != "[]" ]; then
#   echo 'DID NOT PASS THE REQUIRED TEST, THE REPLACED TRANSACTION WAS NOT MINED' && exit 1
# fi
# PT=$(echo "$REPLACED_TRANSACTIONS" | tr -d '[]"\n ' | tr -d '"' | tr -d '\n' | tr -d ' ')
# STATUS=$(curl $RPC_URL -X POST --data '{"jsonrpc":"2.0", "method":"eth_getTransactionReceipt", "params":["'"$PT"'"], "id":7}' | jq .result.status)
# echo "Transaction status "$STATUS
