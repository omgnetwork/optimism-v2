## How to setup dummy-transaction
1. Create .env follow example:
    ```
    NODE_ENV=rinkeby
    APP_METHOD=dummy // method name for dummy transaction service
    L1_NODE_WEB3_URL=https://rinkeby.infura.io/v3/d64a23da1a714a0f9f8bf6c9352235a8
    L2_NODE_WEB3_URL=http://ec2-54-226-193-17.compute-1.amazonaws.com:8545
    L1_LIQUIDITY_POOL_ADDRESS=0x473d2bbF979D0BFA39EBAB320c3216408386e68d
    L2_LIQUIDITY_POOL_ADDRESS=0x1eCD5FBbb64F375A74670A1233CfA74D695fD861
    WALLET_PRIVATE_KEY=01d2b17d3c081725b5bcb2afd11ad0d4a459624c6f87c336aeedd3e7a97dc87c
    L2_GAS_LIMIT=3000000
    L1_ADDRESS_MANAGER=0x93A96D6A5beb1F661cf052722A1424CDDA3e9418
    L2_DEPOSITED_ERC20=0x0e52DEfc53ec6dCc52d630af949a9b6313455aDF
    DUMMY_DELAY_MINS=30 // delay after every transaction in minutes
    DUMMY_ETH_AMOUNT=0.0005 // transaction amount in eth
    DUMMY_WATCHER_TIMEOUT_MINS=15 // time out when transaction error in minutes
    ```
2. run `npm start`

## How to deploy image
1. Build new image: `docker build -t enyalabs/omgx-monitor:{version-number} .`
2. Push new image to docker hub: `docker push enyalabs/omgx-monitor:{version-number}`
