#!/bin/sh

rm /vault/test/tokens_and_accounts.sh || true
apk add --quiet --no-progress --update --no-cache make gcc g++
apk add --quiet --no-progress --update --no-cache python3 && ln -sf python3 /usr/bin/python
python3 -m ensurepip
pip3 install --no-cache --upgrade pip setuptools
apk add --quiet --no-progress --update nodejs npm
cd /vault/test && npm install
nohup /vault/vault.sh > /tmp/vault.out &
while [ $(cat /tmp/vault.out | grep -c "Success! Enabled the immutability-eth-plugin secrets engine at: immutability-eth-plugin/") -ne 1 ];
do
    sleep 10
    echo "Waiting for Vault setup to finish..."
done
export VAULT_TOKEN=$(cat /vault/config/unseal.json | jq -r .root_token)
echo "Config and provisioning, create tokens_and_accounts.sh"
bash /vault/test/config.sh
RETRIES=${RETRIES:-60}
if [[ ! -z "$URL" ]]; then
  # get the addrs from the URL provided
  ADDRESSES=$(curl --fail --show-error --silent --retry-connrefused --retry $RETRIES --retry-delay 5 $URL)
  echo $ADDRESSES
  export OVM_CTC=$(echo $ADDRESSES | jq -r '.OVM_CanonicalTransactionChain') && echo $OVM_CTC
  export OVM_SCC=$(echo $ADDRESSES | jq -r '.OVM_StateCommitmentChain') && echo $OVM_SCC
fi
echo "Sourcing tokens and accounts"
source /vault/test/tokens_and_accounts.sh
  # cleanup
rm /vault/test/tokens_and_accounts.sh
echo "Executing tests"
/vault/test/execute_tests.sh
