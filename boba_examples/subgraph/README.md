# Boba Subgraph Example

## Boba Graph Node

> Mainnet endpoint: https://graph.mainnet.boba.network

| **Port** | **Purpose**                               | **Routes**              | URL                                                          | **Permission** |
| -------- | ----------------------------------------- | ----------------------- | ------------------------------------------------------------ | -------------- |
| 8000     | GraphQL HTTP server                       | /subgraphs/name/.../... | https://graph.mainnet.boba.network <br />https://graph.mainnet.boba.network:8000 | Public         |
| 8020     | JSON-RPC<br /> (for managing deployments) | /                       | https://graph.mainnet.boba.network:8020                      | Private        |
| 8030     | Subgraph indexing status API              | /graphql                | https://graph.mainnet.boba.network:8030                      | Public         |
| 8040     | Prometheus metrics                        | /metrics                | https://graph.mainnet.boba.network:8040                      | Public         |

> Rinkeby endpoint: https://graph.rinkeby.boba.network

| **Port** | **Purpose**                               | **Routes**              | URL                                                          | **Permission** |
| -------- | ----------------------------------------- | ----------------------- | ------------------------------------------------------------ | -------------- |
| 8000     | GraphQL HTTP server                       | /subgraphs/name/.../... | https://graph.rinkeby.boba.network <br />https://graph.rinkeby.boba.network:8000 | Public         |
| 8020     | JSON-RPC<br /> (for managing deployments) | /                       | https://graph.rinkeby.boba.network:8020                      | Private        |
| 8030     | Subgraph indexing status API              | /graphql                | https://graph.rinkeby.boba.network:8030                      | Public         |
| 8040     | Prometheus metrics                        | /metrics                | https://graph.rinkeby.boba.network:8040                      | Public         |

## Deploy Subgraph to Boba Graph Node

### Dependencies

You'll need the following:

- [Git](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

Clone the the example repository, open it, and install nodejs packages with `yarn`:

```bash

git clone git@github.com:omgnetwork/optimism-v2.git
cd boba_examples/subgraph
cd contract
yarn install

```

Note that you will need to copy needed contract **abi** files into `contract/abis`.

### Update `subgraph.yml`

This is an example `subgraph.yml`. Depending on your application, you will need to change various paremeters as needed.

```yaml

specVersion: 0.0.2
description: TokenPool for Boba
repository: https://github.com/omgnetwork/optimism-v2/boba_examples/subgraph
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum/contract
    name: TokenPool # Contract name
    network: boba   # Don't change if you want to deploy to Boba
    source:
      address: '0x82B178EE692572e21D73d5F1ebC1c7c438Fc52DD' # Contract address
      abi: TokenPool # Contract name
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.4
      language: wasm/assemblyscript
      entities:
        - TokenPool # Contract name
      abis:
        - name: TokenPool # Contract name
          file: ./abis/TokenPool.json # Contract ABI location
      eventHandlers:
        - event: RequestToken(address,uint256,uint256) # event fucntion in the contract
          handler: handleRequestToken
      file: ./src/mapping.ts

```

### Update `schema.graphql`

Update the database structure for the contract event data. A simple example is 

```
type TokenPool @entity {
  id: ID!
  sender: Bytes
  amount: String
  timestamp: String
}
```

### Generate the schema and contract code

```bash

yarn codegen

```

or you can run the following command if you have installed the global `graph-cli`

```bash

graph build

```

The automatically generated code is in the `generated` folder.

### Update `src/mapping.ts`

`src/mapping.ts` is used to store the contract event data into `graphql`.

### Deploy to Boba Graph Node

Update the project name in `package.json`. The subgraph name needs to have the format `PREFIX/NAME`.

```json
{  
  "create:subgraph": "graph create --node https://graph.rinkeby.boba.network:8020 PREFIX/NAME",
  "deploy:subgraph": "graph deploy --ipfs https://graph.rinkeby.boba.network:5001 --node https://graph.rinkeby.boba.network:8020 PREFIX/NAME"
}
```

```bash

yarn create:subgraph
yarn deploy:subgraph

```

or you can directly run the following command if you have installed the global `graph-cli`

```bash

graph create --node https://graph.rinkeby.boba.network:8020 PREFIX/NAME
graph deploy --ipfs https://graph.rinkeby.boba.network:5001 --node https://graph.rinkeby.boba.network:8020 PREFIX/NAME 

```

> NOTE: The `https://graph.rinkeby.boba.network:8020` endpoint is **private**. Please contact us if you want to deploy subgraphs.

## L2 Liquidity Pool Example

The deployment code is in `L2LP` folder. You can access deployed subgraphs through [L2LiquidityPoolSubgraph](https://graph.rinkeby.boba.network/subgraphs/name/boba/L2LiquidityPool).

## L2 Token Pool Example

The deployment code in `TokenPool` folder. You can access deployed subgraphs through [L2TokenPoolSubgraph](https://graph.rinkeby.boba.network/subgraphs/name/boba/TokenPool).

## Known Bugs

* The Graph cannot currently events in functions that send cross-chain messages.
