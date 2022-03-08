# Welcome to Boba

- [Running the Boba stack locally](#running-the-boba-stack-locally)
  * [Basics](#basics)
  * [Spinning up the stack](#spinning-up-the-stack)
    + [Helpful commands](#helpful-commands)
    + [Running unit tests](#running-unit-tests)
    + [Running integration tests](#running-integration-tests)
    
## Basics

Welcome to Boba. Boba is a compute-focused L2 built on an Optimistic Rollup. We believe that L2s can play a unique role in augmenting the base _compute_ capabilities of the Ethereum ecosystem. You can learn more about Turing hybrid compute [here](./packages/boba/turing/README.md). Boba is built on the Optimistic Rollup developed by [Optimism](https://optimism.io). Aside from its main focus, augmenting compute, Boba differs from Optimism by:

  * providing additional cross-chain messaging such as a `message-relayer-fast`
  * using different gas pricing logic
  * providing a swap-based system for rapid L2->L1 exits (without the 7 day delay)
  * providing a community fraud-detector that allows transactions to be independently verified by anyone
  * interacting with L2 ETH using the normal ETH methods (`msg.value`, `send eth_sendTransaction`, and `provider.getBalance(address)` rather than as WETH
  * being organized as a [DAO](./packages/boba/contracts/contracts/DAO)
  * native [NFT bridging](./packages/boba/contracts/contracts/bridges)
  * automatically relaying classical 7-day exit messages to L1 for you, rather than this being a separate step

## Documentation

Developer-focused documentation lives in [this folder](https://github.com/omgnetwork/optimism-v2/blob/develop/boba_documentation) and within the service and contract directories.

## Deploying standard contracts

For most contracts, the deploy experience is exactly like deploying on Ethereum. You will need to have some ETH (or Rinkeby ETH) on Boba and you will have to change your RPC endpoint to either `https://mainnet.boba.network` or `https://rinkeby.boba.network`. That's it!

The [Mainnet blockexplorer](https://blockexplorer.boba.network) and the [Rinkeby blockexplorer](https://blockexplorer.rinkeby.boba.network) are similar to Etherscan. The [mainnet gateway](https://gateway.boba.network) and the [rinkeby gateway](https://gateway.rinkeby.boba.network) allow you to see your balances and bridge funds, among many other functions. 

## Example contract ready to deploy

1. [Turing Monsters](https://github.com/omgnetwork/optimism-v2/blob/develop/boba_community/turing-monsters/README.md) NFTs with on-chain svg and using the Turing random number generator

2. [Truffle ERC20](https://github.com/omgnetwork/optimism-v2/blob/develop/boba_examples/truffle-erc20/README.md) A basic ERC20 deployment using Truffle

3. [Bitcoin Price Feeds](https://github.com/omgnetwork/optimism-v2/blob/develop/packages/boba/turing/test/005_lending.ts) A smart contract that pulls price data from an off-chain commercial endpoint

4. [Stableswap using off-chain compute](https://github.com/omgnetwork/optimism-v2/blob/develop/packages/boba/turing/test/003_stable_swap.ts) A smart contract using an off-chain compute endpoint to do stableswap math

## Boba-feature: Using Turing Hybrid Compute

Turing is a system for interacting with the outside world from within solidity smart contracts. All data returned from external APIs, such as random numbers and real-time financial data, are deposited into a public data-storage contract on Ethereum Mainnet. This extra data allows replicas, verifiers, and fraud-detectors to reproduce and validate the Boba L2 blockchain, block by block. 

[Turing Getting Started - NFTs](https://github.com/omgnetwork/optimism-v2/blob/develop/packages/boba/turing/README.md#feature-highlight-1-using-turing-to-mint-an-nft-with-256-random-attributes-in-a-single-transaction)

[Turing Getting Started - External API](https://github.com/omgnetwork/optimism-v2/blob/develop/packages/boba/turing/README.md#feature-highlight-2-using-turing-to-access-real-time-trading-data-from-within-your-solidity-smart-contract)

## Boba-feature: Obtaining on-chain price data

Price Feed oracles are an essential part of Boba, which allow smart contracts to work with external data and open the path to many more use cases. Currently Boba has several options to get real world price data directly into your contracts - each different in the way they operate to procure data for smart contracts to consume. This list will be updated frequently:

1. Boba-Straw 
2. Witnet
3. Turing (see above section)

[Full Price Feed documentation](https://github.com/omgnetwork/optimism-v2/blob/develop/boba_documentation/Price_Data_Feeds_Overview.md)

## Boba-feature: Bridging NFTs from L2 to L1

NFTs can be minted on Boba and can also be exported to Ethereum, if desired. The minting process is identical to Ethereum. The Boba-specific bridging system and contracts are [documented here](https://github.com/omgnetwork/optimism-v2/blob/develop/packages/boba/contracts/contracts/bridges/README.md).

## Helping to Develop Boba

**Note: this is only relevant to developers who wish to develop Boba core services. For most test uses, it's simpler to use https://rinkeby.boba.network**. 

[Running Boba locally](https://github.com/omgnetwork/optimism-v2/blob/develop/boba_documentation/Quickstart_Local_Boba.md)
