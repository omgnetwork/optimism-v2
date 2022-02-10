# NG

EARLY DRAFT - CHANGING CONTINUOUSLY

This directory contains the Portal and Ethpool contracts, along with a deployer script.

## Running the prototype

```bash
$ cd optimism-v2
$ yarn clean
$ yarn
$ yarn build
$ cd ops
$ BUILD=1 ./up_prototype.sh
```
## Basics

The system is based on two agents, the **L1-agent** and the **L2-agent**. The two agents the other chain's events and acts on its own chain. So L2_Agent handles the L1->L2 traffic, and vice versa. These agents interact with a series of new contract's such as `L1_BobaPortal.sol` and `L2_BobaPortal.sol`.

## New Features

**User-triggered proof of liveliness with penalty**

A user can challenge the system to complete a round-trip message cycle within a fixed time window. It costs ETH to do this. If the system is unable to respond in time then the user may claim a larger amount of ETH. A failed challenge will pause all other cross-chain messaging until the underlying condition is resolved (TBD). The idea is to impose a penalty on the sequencer IFF they are not providing the promised service. 

```
  function HealthCheckStart ()
```

**Smart bridges with auto-fallback**

```
  /* Adds L1 liquidity, which is available for fast exits as soon as the L2
     side receives the notice that it has been added. User may withdraw some
     or all from L1 at a later time, but this will be processed through the
     Slow channel. Rewards are calculated and paid on L2
  */
  function addLiquidity(uint amount, address tokenAddr) public payable
```

## Stack spinup

```batch
  l1-agent:
    depends_on:
     - l1_chain
     - l2geth
    image: bobanetwork/l1-agent
    deploy:
      replicas: 1
    build:
      context: ..
      dockerfile: ./ops/docker/Dockerfile.l1-agent
      
  l2-agent:
    depends_on:
     - l1_chain
     - l2geth
    image: bobanetwork/l2-agent
    deploy:
      replicas: 1
    build:
      context: ..
      dockerfile: ./ops/docker/Dockerfile.l2-agent
```

## Tests

Testing the tunneling and new relay system

```bash
$ yarn test:integration # this runs test/ng-test.ts
```

## Main parts of NG

* **L1-agent.py** L1-agent proof of concept. Handles the L2->L1 traffic. Watches for events on L2 and calls L1 portal to act on them.

Also, thread scans the L1 chain to extract SCC batches which are needed to generate proofs for the Optimism message tunnel.

**SlowScanner** goes through the chain and assembles batches of Slow messages which are
older than the fraud window. These are then handed off to the Submitter. There is some
duplicated effort because this thread is re-processing messages which were already
handled on the Fast path (to register the message hash etc) but this is better than
having to store the parsed message data off-chain for 7 days.

**Submitter** thread is responsible for taking finished batches out of the queues and submitting them to 
the contracts. Failed submissions are retried. In future, this thread should have the ability to modify
a pending submission with an increasing gas price if it is not confirmed within a reasonable interval
(replacing the flawed "ynatm" approach which is used in the existing services). 
For now the Slow batches are only processed when the Fast queue is idle, but there should be some limit
to ensure that Slow operations can't stall forever. 

* **L2-agent.py** L2-agent proof of concept. Handles the L1->L2 traffic. Watches for events on L1 and calls L2 portal to act on them, minting oETH as appropriate.

`L1_BobaPortal.sol`

`L2_BobaPortal.sol`






