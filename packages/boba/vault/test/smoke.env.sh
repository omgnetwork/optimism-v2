#!/bin/bash

export MNEMONIC="explain foam nice clown method avocado hill basket echo blur elevator marble"
export CHAIN_ID=31337
export CHAIN_L2_ID=28
export PORT=8545
export RPC_URL="http://l1_chain:8545"
export RPC_L2_URL="http://l2geth:8545"
export CONTRACTS_PATH="/vault/contracts/erc20/build/"
export GAS_PRICE_LOW="1"
export GAS_PRICE_HIGH="37000000000"
export GAS_PRICE_HIGH2="700000000000"
export FUNDING_AMOUNT=100000000000000000
export TEST_AMOUNT=10000000000000000
export PASSPHRASE="passion bauble hypnotic hanky kiwi effective overcast roman staleness"
export EMPTY=""
export VAULT_ADDR="$VAULT_ADDR"
function check_result(){
  EXIT_STATUS=$1
  EXPECTED=$2
  echo "Exit status of command was $EXIT_STATUS."
  [[ $EXIT_STATUS -ne $EXPECTED ]] && echo 'DID NOT PASS THE REQUIRED TEST' && exit $EXIT_STATUS
}
function check_string_result(){
  EXIT_STRING=$1
  EXPECTED=$2
  echo "Exit string of command was $EXIT_STRING."
  echo "Expected output of command was $EXPECTED."
  [[ $EXIT_STRING != $EXPECTED ]] && echo 'DID NOT PASS THE REQUIRED TEST' && exit 1
}
