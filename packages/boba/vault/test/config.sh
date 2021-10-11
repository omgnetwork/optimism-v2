#!/bin/bash

export CHAIN_ID=31337
export CHAIN_L2_ID=28
export RPC_URL="http://l1_chain:8545"
export RPC_L2_URL="http://l2geth:8545"
export WALLET_NAME=sequencer
export WALLET_NAME_2=proposer
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
echo "CONFIGURE BACKEND"
vault write -format=json immutability-eth-plugin/config rpc_url="$RPC_URL" chain_id="$CHAIN_ID" rpc_l2_url="$RPC_L2_URL" chain_l2_id="$CHAIN_L2_ID"
echo "DONE CONFIGURING BACKEND"

# lets create a sequencer wallet without mnemonic
echo "WALLET $WALLET_NAME WITHOUT MNEMONIC"
vault write -format=json -f immutability-eth-plugin/wallets/$WALLET_NAME
# lets create a proposer wallet without mnemonic
echo "WALLET $WALLET_NAME_2 WITHOUT MNEMONIC"
vault write -format=json -f immutability-eth-plugin/wallets/$WALLET_NAME_2

echo "CREATE TWO NEW ACCOUNTS IN WALLET $WALLET_NAME and $WALLET_NAME_2"
ACCOUNT0=$(vault write -f -field=address immutability-eth-plugin/wallets/$WALLET_NAME/accounts)
ACCOUNT1=$(vault write -f -field=address immutability-eth-plugin/wallets/$WALLET_NAME_2/accounts)

tee append-sequencer-batch.hcl <<EOF
path "immutability-eth-plugin/wallets/$WALLET_NAME/accounts/$ACCOUNT0/ovm/appendSequencerBatch" {
    capabilities = ["create", "update"]
}
EOF

vault policy write append-sequencer-batch append-sequencer-batch.hcl

tee append-state-batch-proposer.hcl <<EOF
path "immutability-eth-plugin/wallets/$WALLET_NAME_2/accounts/$ACCOUNT1/ovm/appendStateBatch" {
    capabilities = ["create", "update"]
}
EOF

vault policy write append-state-batch-proposer append-state-batch-proposer.hcl
vault policy list

node index.js $ACCOUNT0
node index.js $ACCOUNT1
echo "Creating tokens helper file"
rm $DIR/tokens_and_accounts.sh || true
touch $DIR/tokens_and_accounts.sh
echo "export SEQUENCER_ADDRESS=$ACCOUNT0" >> $DIR/tokens_and_accounts.sh
echo "export PROPOSER_ADDRESS=$ACCOUNT1" >> $DIR/tokens_and_accounts.sh

if [[ ! -z "$AWS_ROLE" && ! -z "$AWS_BOUND_IAM_PRINCIPAL_ARN" && ! -z "$AWS_ACCESS_KEY_ID" && ! -z "$AWS_SECRET_ACCESS_KEY" ]]; then
  echo "Not writting tokens in helper - enabling AWS auth backend"
  vault auth enable aws
  vault write auth/aws/role/${AWS_ROLE} auth_type=iam \
                bound_iam_principal_arn=${AWS_BOUND_IAM_PRINCIPAL_ARN} policies=append-state-batch-proposer,append-sequencer-batch max_ttl=500h
  vault login -method=aws role=${AWS_ROLE}
else
  PROPOSER_TOKEN=$(vault token create -field=token -period=30m -policy=append-state-batch-proposer)
  SEQUENCER_TOKEN=$(vault token create -field=token -period=30m -policy=append-sequencer-batch)
  echo "export PROPOSER_TOKEN=$PROPOSER_TOKEN" >> $DIR/tokens_and_accounts.sh
  echo "export SEQUENCER_TOKEN=$SEQUENCER_TOKEN" >> $DIR/tokens_and_accounts.sh
fi
cat $DIR/tokens_and_accounts.sh



