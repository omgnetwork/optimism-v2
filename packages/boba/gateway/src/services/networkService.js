/* eslint-disable quotes */
/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import { parseEther, formatEther } from '@ethersproject/units'
import { Watcher } from '@eth-optimism/core-utils'
import { ethers, BigNumber, utils } from 'ethers'

import store from 'store'
import { orderBy } from 'lodash'
import BN from 'bn.js'

import { logAmount } from 'util/amountConvert'

import { getToken } from 'actions/tokenAction'

import {
  addNFT,
  getNFTs,
  //addNFTContract,
  getNFTContracts,
} from 'actions/nftAction'

import {
  updateSignatureStatus_exitLP,
  updateSignatureStatus_exitTRAD,
  updateSignatureStatus_depositLP,
  updateSignatureStatus_depositTRAD
} from 'actions/signAction'

//Base contracts
import AddressManagerJson from '../deployment/artifacts-base/contracts/libraries/resolver/Lib_AddressManager.sol/Lib_AddressManager.json'
import L1StandardBridgeJson from '../deployment/artifacts-base/contracts/L1/messaging/L1StandardBridge.sol/L1StandardBridge.json'
import L2StandardBridgeJson from '../deployment/artifacts-base/contracts/L2/messaging/L2StandardBridge.sol/L2StandardBridge.json'

import DiscretionaryExitBurnJson from '../deployment/artifacts-boba/contracts/DiscretionaryExitBurn.sol/DiscretionaryExitBurn.json'

//OMGX LP contracts
import L1LPJson from '../deployment/artifacts-boba/contracts/LP/L1LiquidityPool.sol/L1LiquidityPool.json'
import L2LPJson from '../deployment/artifacts-boba/contracts/LP/L2LiquidityPool.sol/L2LiquidityPool.json'

//L2 Staking
import L2SaveJson from '../deployment/artifacts-boba/contracts/BobaFixedSavings.sol/BobaFixedSavings.json'

//Standard ERC20 jsons
import L1ERC20Json from '../deployment/contracts/L1ERC20.json'
import L2ERC20Json from '../deployment/artifacts-base/contracts/standards/L2StandardERC20.sol/L2StandardERC20.json'

//special one-off location
import OMGJson from '../deployment/contracts/OMG.json'

//BOBA L2 Contracts
import L2ERC721Json from '../deployment/artifacts-boba/contracts/ERC721Genesis.sol/ERC721Genesis.json'

//DAO
import Boba from                   "../deployment/artifacts-boba/contracts/DAO/governance-token/BOBA.sol/BOBA.json"
import GovernorBravoDelegate from  "../deployment/artifacts-boba/contracts/DAO/governance/GovernorBravoDelegate.sol/GovernorBravoDelegate.json"
import GovernorBravoDelegator from "../deployment/artifacts-boba/contracts/DAO/governance/GovernorBravoDelegator.sol/GovernorBravoDelegator.json"

//Airdrop
import BobaAirdropJson from "../deployment/contracts/BobaAirdrop.json"
import BobaAirdropL1Json from "../deployment/contracts/BobaAirdropSecond.json"

import { accDiv, accMul } from 'util/calculation'
import { getNftImageUrl } from 'util/nftImage'
import { getAllNetworks } from 'util/masterConfig'

import etherScanInstance from 'api/etherScanAxios'
import omgxWatcherAxiosInstance from 'api/omgxWatcherAxios'
import coinGeckoAxiosInstance from 'api/coinGeckoAxios'
import { sortRawTokens } from 'util/common'

require('dotenv').config()

const ERROR_ADDRESS = '0x0000000000000000000000000000000000000000'
const L1_ETH_Address = '0x0000000000000000000000000000000000000000'
const L2_ETH_Address = '0x4200000000000000000000000000000000000006'
const L2MessengerAddress = '0x4200000000000000000000000000000000000007'
const L2StandardBridgeAddress = '0x4200000000000000000000000000000000000010'

let allAddresses = {}
let allTokens = {}

class NetworkService {

  constructor() {

    this.L1Provider = null
    this.L2Provider = null

    this.provider = null
    this.environment = null

    // L1 or L2
    this.L1orL2 = null
    this.masterSystemConfig = null

    // Watcher
    this.watcher = null
    this.fastWatcher = null

    // addresses
    this.AddressManagerAddress = null
    this.AddressManager = null

    //this.ERC721Address = null
    //this.ERC721RegAddress = null

    this.L1_TEST_Contract = null
    this.L2_TEST_Contract = null
    this.L1_OMG_Contract = null
    this.L2_ETH_Contract = null

    this.ERC721Contract = null
    this.ERC721RegContract = null

    this.L2TokenPoolContract = null
    this.AtomicSwapContract = null

    this.tokenAddresses = null
    this.addresses = null

    // chain ID
    this.chainID = null
    this.networkName = null

    // gas
    this.L1GasLimit = 9999999 //setting of this value not important since it's not connected to anything in the contracts
    // "param _l1Gas Unused, but included for potential forward compatibility considerations"
    this.L2GasLimit = 1300000 //use the same as the hardcoded receive

    // Dao
    this.BobaContract = null
    this.xBobaContract = null
    this.delegateContract = null
    this.delegatorContract = null

  }

  async enableBrowserWallet() {
    console.log('NS: enableBrowserWallet()')
    try {
      // connect to the wallet
      await window.ethereum.request({method: 'eth_requestAccounts'})
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      return true
    } catch (error) {
      return false
    }
  }

  bindProviderListeners() {
    window.ethereum.on('accountsChanged', () => {
      window.location.reload()
    })

    window.ethereum.on('chainChanged', () => {
      console.log('chainChanged')
      localStorage.setItem('changeChain', true)
      window.location.reload()
    })
  }

  async fetchAirdropStatusL1() {

    //console.log("fetching airdrop L1 status")

    // NOT SUPPORTED on LOCAL
    if (this.masterSystemConfig === 'local') return
    //if (this.masterSystemConfig === 'mainnet') return

    const response = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('get.l1.airdrop', {
      address: this.account,
      key: process.env.REACT_APP_AIRDROP
    })

    console.log("L1 response:", response)

    if (response.status === 201) {
      const status = response.data
      return status
    } else {
      console.log("Bad gateway response")
      return false
    }

  }

  async fetchAirdropStatusL2() {

    //console.log("fetching airdrop L2 status")

    // NOT SUPPORTED on LOCAL
    if (this.masterSystemConfig === 'local') return

    const response = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('get.l2.airdrop', {
      address: this.account,
      key: process.env.REACT_APP_AIRDROP
    })

    if (response.status === 201) {
      const status = response.data
      return status
    } else {
      console.log("Bad gateway response")
      return false
    }

  }

  async initiateAirdrop(callData) {

    console.log("Initiating airdrop")
    console.log("getAirdropL1(callData)",callData.merkleProof)

    // NOT SUPPORTED on LOCAL
    if (this.masterSystemConfig === 'local') return
    //if (this.masterSystemConfig === 'mainnet') return

  //Interact with contract
    const airdropContract = new ethers.Contract(
      allAddresses.BobaAirdropL1,
      BobaAirdropL1Json.abi,
      this.provider.getSigner()
    )

    console.log("airdropL1Contract.address:", airdropContract.address)

    try {

      //function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof)
      let claim = await airdropContract.initiateClaim(
        callData.merkleProof.index,  //Spec - 1 - Type Number,
        callData.merkleProof.amount, //Spec 101 Number - this is Number in the spec but an StringHexWei in the payload
        callData.merkleProof.proof   //proof1
      )

      await claim.wait()

      //Interact with API if the contract interaction was successful
      //success of this this call has no bearing on the airdrop itself, since the api is just
      //used for user status updates etc.
      //send.l1.airdrop
      const response = await omgxWatcherAxiosInstance(
        this.masterSystemConfig
      ).post('initiate.l1.airdrop', {
          address: this.account,
          key: process.env.REACT_APP_AIRDROP
      })

      if (response.status === 201) {
        console.log("L1 Airdrop gateway response:",response.data)
      } else {
        console.log("L1 Airdrop gateway response:",response)
      }

      return claim

    } catch (error) {
      console.log(error)
      return error
    }

  }

  async getAirdropL1(callData) {

    console.log("getAirdropL1")
    console.log("getAirdropL1(callData)",callData.merkleProof)
    console.log("this.account:",this.account)

    //Interact with contract
    const airdropContract = new ethers.Contract(
      allAddresses.BobaAirdropL1,
      BobaAirdropL1Json.abi,
      this.provider.getSigner()
    )

    console.log("airdropL1Contract.address:", airdropContract.address)

    try {

      //function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof)
      let claim = await airdropContract.claim(
        callData.merkleProof.index,  //Spec - 1 - Type Number,
        this.account,                //wallet address
        callData.merkleProof.amount, //Spec 101 Number - this is Number in the spec but an StringHexWei in the payload
        callData.merkleProof.proof   //proof1
      )

      await claim.wait()

      //Interact with API if the contract interaction was successful
      //success of this this call has no bearing on the airdrop itself, since the api is just
      //used for user status updates etc.
      //send.l1.airdrop
      const response = await omgxWatcherAxiosInstance(
        this.masterSystemConfig
      ).post('send.l1.airdrop', {
          address: this.account,
          key: process.env.REACT_APP_AIRDROP
      })

      if (response.status === 201) {
        console.log("L1 Airdrop gateway response:",response.data)
      } else {
        console.log("L1 Airdrop gateway response:",response)
      }

      return claim

    } catch (error) {
      console.log(error)
      return error
    }

  }

  async getAirdropL2(callData) {

    console.log("getAirdropL2(callData)",callData)
    console.log("this.account:",this.account)

    //Interact with contract
    const airdropContract = new ethers.Contract(
      allAddresses.BobaAirdropL2,
      BobaAirdropJson.abi,
      this.provider.getSigner()
    )

    console.log("airdropL2Contract.address:", airdropContract.address)

    try {

      //function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof)
      let claim = await airdropContract.claim(
        callData.merkleProof.index,  //Spec - 1 - Type Number,
        this.account,                //wallet address
        callData.merkleProof.amount, //Spec 101 Number - this is Number in the spec but an StringHexWei in the payload
        callData.merkleProof.proof   //proof1
      )

      await claim.wait()

      //Interact with API if the contract interaction was successful
      //success of this this call has no bearing on the airdrop itself, since the api is just
      //used for user status updates etc.
      //send.l2.airdrop
      const response = await omgxWatcherAxiosInstance(
        this.masterSystemConfig
      ).post('send.l2.airdrop', {
          address: this.account,
          key: process.env.REACT_APP_AIRDROP
      })

      if (response.status === 201) {
        console.log("L2 Airdrop gateway response:",response.data)
      } else {
        console.log("L2 Airdrop gateway response:",response)
      }

      return claim

    } catch (error) {
      console.log(error)
      return error
    }

  }

  async getAddress(contractName, varToSet) {
    const address = await this.AddressManager.getAddress(contractName)
    if (address === ERROR_ADDRESS) {
      console.log(contractName + ' ERROR: NOT IN ADDRESSMANAGER')
      return false
    } else {
      allAddresses = {
        ...allAddresses,
        [varToSet]: address
      }
      console.log(contractName +' pulled from AddressManager and set to:', address)
      return true
    }
  }

  getAllAddresses() {
     return allAddresses
  }

  async initializeAccounts( masterSystemConfig ) {

    console.log('NS: initializeAccounts() for', masterSystemConfig)

    try {

      //at this point, the wallet should be connected
      this.account = await this.provider.getSigner().getAddress()
      console.log('this.account', this.account)

      const network = await this.provider.getNetwork()

      this.chainID = network.chainId
      this.networkName = network.name

      this.masterSystemConfig = masterSystemConfig

      console.log('NS: network:', network)
      console.log('NS: masterConfig:', this.masterSystemConfig)
      console.log('NS: this.chainID:', this.chainID)
      console.log('NS: this.networkName:', this.networkName)

      // defines the set of possible networks along with chainId for L1 and L2
      const nw = getAllNetworks()
      const L1ChainId = nw[masterSystemConfig]['L1']['chainId']
      const L2ChainId = nw[masterSystemConfig]['L2']['chainId']

      //there are numerous possible chains we could be on
      //either local, rinkeby etc
      //also, either L1 or L2

      //at this point, we only know whether we want to be on local or rinkeby etc
      if (masterSystemConfig === 'local' && network.chainId === L2ChainId) {
        //ok, that's reasonable
        //local deployment, L2
        this.L1orL2 = 'L2'
      } else if (masterSystemConfig === 'local' && network.chainId === L1ChainId) {
        //ok, that's reasonable
        //local deployment, L1
        this.L1orL2 = 'L1'
      } else if (masterSystemConfig === 'rinkeby' && network.chainId === L1ChainId) {
        //ok, that's reasonable
        //rinkeby, L1
        this.L1orL2 = 'L1'
      } else if (masterSystemConfig === 'rinkeby' && network.chainId === L2ChainId) {
        //ok, that's reasonable
        //rinkeby, L2
        this.L1orL2 = 'L2'
      } else if (masterSystemConfig === 'rinkeby_integration' && network.chainId === L1ChainId) {
        //ok, that's reasonable
        //rinkeby, L1
        this.L1orL2 = 'L1'
      } else if (masterSystemConfig === 'rinkeby_integration' && network.chainId === L2ChainId) {
        //ok, that's reasonable
        //rinkeby, L2
        this.L1orL2 = 'L2'
      } else if (masterSystemConfig === 'mainnet' && network.chainId === L1ChainId) {
        //ok, that's reasonable
        //rinkeby, L2
        this.L1orL2 = 'L1'
      } else if (masterSystemConfig === 'mainnet' && network.chainId === L2ChainId) {
        //ok, that's reasonable
        //rinkeby, L2
        this.L1orL2 = 'L2'
      } else {
        console.log("ERROR: masterSystemConfig does not match actual network.chainId")
        this.bindProviderListeners()
        return 'wrongnetwork'
      }

      this.L1Provider = new ethers.providers.StaticJsonRpcProvider(
        nw[masterSystemConfig]['L1']['rpcUrl']
      )
      this.L2Provider = new ethers.providers.StaticJsonRpcProvider(
        nw[masterSystemConfig]['L2']['rpcUrl']
      )

      this.AddressManagerAddress = nw[masterSystemConfig].addressManager
      console.log("AddressManager address:",this.AddressManagerAddress)

      this.AddressManager = new ethers.Contract(
        this.AddressManagerAddress,
        AddressManagerJson.abi,
        this.L1Provider
      )
      //console.log("AddressManager Contract:",this.AddressManager)

      if (!(await this.getAddress('Proxy__L1CrossDomainMessenger', 'L1MessengerAddress'))) return
      if (!(await this.getAddress('L2CrossDomainMessenger', 'L2MessengerAddress'))) return
      if (!(await this.getAddress('Proxy__L1CrossDomainMessengerFast', 'L1FastMessengerAddress'))) return
      if (!(await this.getAddress('Proxy__L1StandardBridge', 'L1StandardBridgeAddress'))) return
      if (!(await this.getAddress('DiscretionaryExitBurn', 'DiscretionaryExitBurn'))) return
      if (!(await this.getAddress('Proxy__BobaFixedSavings', 'BobaFixedSavings'))) return

      await this.getAddress('BobaAirdropL1', 'BobaAirdropL1')
      console.log("BobaAirdropL1:",allAddresses.BobaAirdropL1)

      await this.getAddress('BobaAirdropL2', 'BobaAirdropL2')
      console.log("BobaAirdropL2:",allAddresses.BobaAirdropL2)

      //L2StandardBridgeAddress is a predeploy, so add by hand....
      allAddresses = {
        ...allAddresses,
        'L2StandardBridgeAddress': L2StandardBridgeAddress,
        //'BobaAirdrop': '0x4cA698d5c23bE5A79813687a99BB2269bDdA5B2e' //manual for now
      }

      //L2MessengerAddress is a predeploy, so add by hand....
      allAddresses = {
        ...allAddresses,
        'L2MessengerAddress': L2MessengerAddress
      }

      //L2_ETH_Address is a predeploy, so add by hand....
      allAddresses = {
        ...allAddresses,
        'L2_ETH_Address': L2_ETH_Address
      }

      //L1_ETH_Address is a predeploy, so add by hand....
      allAddresses = {
        ...allAddresses,
        'L1_ETH_Address': L1_ETH_Address
      }

      this.L1StandardBridgeContract = new ethers.Contract(
        allAddresses.L1StandardBridgeAddress,
        L1StandardBridgeJson.abi,
        this.provider.getSigner()
      )
      console.log("L1StandardBridgeContract:", this.L1StandardBridgeContract.address)

      let supportedTokens = [ 'USDT', 'DAI', 'USDC', 'WBTC',
                              'REP',  'BAT', 'ZRX',  'SUSHI',
                              'LINK', 'UNI', 'BOBA', 'xBOBA', 'OMG',
                              'FRAX', 'FXS', 'DODO', 'UST',
                              'BUSD', 'BNB', 'FTM',  'MATIC'
                            ]

      //not all tokens are on Rinkeby
      if ( masterSystemConfig === 'rinkeby') {
        supportedTokens = [ 'USDT', 'DAI', 'USDC', 'WBTC',
                          'REP',  'BAT', 'ZRX',  'SUSHI',
                          'LINK', 'UNI', 'BOBA', 'xBOBA', 'OMG',
                          //'FRAX', 'FXS', 'UST',
                          //'BUSD', 'BNB', 'FTM',  'MATIC'
                        ]
      }

      await Promise.all(supportedTokens.map(async (key) => {

        const L2a = await this.AddressManager.getAddress('TK_L2'+key)

        if(key === 'xBOBA') {
          if (L2a === ERROR_ADDRESS) {
            console.log(key + ' ERROR: TOKEN NOT IN ADDRESSMANAGER')
            return false
          } else {
            allTokens[key] = {
              'L1': 'xBOBA',
              'L2': L2a
            }
          }
        } else {
          const L1a = await this.AddressManager.getAddress('TK_L1'+key)
          if (L1a === ERROR_ADDRESS || L2a === ERROR_ADDRESS) {
            console.log(key + ' ERROR: TOKEN NOT IN ADDRESSMANAGER')
            return false
          } else {
            allTokens[key] = {
              'L1': L1a,
              'L2': L2a
            }
          }
        }

      }))

      console.log("tokens:",allTokens)
      this.tokenAddresses = allTokens

      if (!(await this.getAddress('Proxy__L1LiquidityPool', 'L1LPAddress'))) return
      if (!(await this.getAddress('Proxy__L2LiquidityPool', 'L2LPAddress'))) return

      if(allAddresses.L2StandardBridgeAddress !== null) {
        this.L2StandardBridgeContract = new ethers.Contract(
          allAddresses.L2StandardBridgeAddress,
          L2StandardBridgeJson.abi,
          this.provider.getSigner()
        )
      }
      console.log("L2StandardBridgeContract:", this.L2StandardBridgeContract.address)

      this.L2_ETH_Contract = new ethers.Contract(
        allAddresses.L2_ETH_Address,
        L2ERC20Json.abi,
        this.provider.getSigner()
      )
      //console.log("L2_ETH_Contract:", this.L2_ETH_Contract.address)

      /*The test token*/
      this.L1_TEST_Contract = new ethers.Contract(
        allTokens.BOBA.L1, //this will get changed anyway when the contract is used
        L1ERC20Json.abi,
        this.provider.getSigner()
      )
      //console.log('L1_TEST_Contract:', this.L1_TEST_Contract)

      this.L2_TEST_Contract = new ethers.Contract(
        allTokens.BOBA.L2, //this will get changed anyway when the contract is used
        L2ERC20Json.abi,
        this.provider.getSigner()
      )
      //console.log('L2_TEST_Contract:', this.L2_TEST_Contract)

      /*The OMG token*/
      //We need this seperately because OMG is not ERC20 compliant
      this.L1_OMG_Contract = new ethers.Contract(
        allTokens.OMG.L1,
        OMGJson,
        this.provider.getSigner()
      )
      //console.log('L1_OMG_Contract:', this.L1_OMG_Contract)

      // Liquidity pools
      console.log('Setting up contract for L1LP at:',allAddresses.L1LPAddress)
      this.L1LPContract = new ethers.Contract(
        allAddresses.L1LPAddress,
        L1LPJson.abi,
        this.provider.getSigner()
      )

      console.log('Setting up contract for L2LP at:',allAddresses.L2LPAddress)
      this.L2LPContract = new ethers.Contract(
        allAddresses.L2LPAddress,
        L2LPJson.abi,
        this.provider.getSigner()
      )

      // if (!(await this.getAddress('L2ERC721', 'L2ERC721Address'))) return
      // if (!(await this.getAddress('L2ERC721Reg', 'L2ERC721RegAddress'))) return

      // this.ERC721Contract = new ethers.Contract(
      //   allAddresses.L2ERC721Address,
      //   L2ERC721Json.abi,
      //   this.L2Provider
      // )

      // this.ERC721Contract = new ethers.Contract(
      //   allAddresses.L2ERC721RegAddress,
      //   L2ERC721RegJson.abi,
      //   this.L2Provider
      // )

      this.watcher = new Watcher({
        l1: {
          provider: this.L1Provider,
          messengerAddress: allAddresses.L1MessengerAddress,
        },
        l2: {
          provider: this.L2Provider,
          messengerAddress: allAddresses.L2MessengerAddress,
        },
      })

      this.fastWatcher = new Watcher({
        l1: {
          provider: this.L1Provider,
          messengerAddress: allAddresses.L1FastMessengerAddress,
        },
        l2: {
          provider: this.L2Provider,
          messengerAddress: allAddresses.L2MessengerAddress,
        },
      })

      console.log('Setting up BOBA for the DAO:',allTokens.BOBA.L2)

      this.BobaContract = new ethers.Contract(
        allTokens.BOBA.L2,
        Boba.abi,
        this.provider.getSigner()
      )

      this.xBobaContract = new ethers.Contract(
        allTokens.xBOBA.L2,
        Boba.abi,
        this.provider.getSigner()
      )

      //DAO related
      if( /*(masterSystemConfig === 'local' || masterSystemConfig === 'rinkeby') && */ this.L1orL2 === 'L2' ) {

        if (!(await this.getAddress('GovernorBravoDelegate', 'GovernorBravoDelegate'))) return
        if (!(await this.getAddress('GovernorBravoDelegator', 'GovernorBravoDelegator'))) return

        this.delegateContract = new ethers.Contract(
          allAddresses.GovernorBravoDelegate,
          GovernorBravoDelegate.abi,
          this.provider.getSigner()
        )

        this.delegatorContract = new ethers.Contract(
          allAddresses.GovernorBravoDelegator,
          GovernorBravoDelegator.abi,
          this.provider.getSigner()
        )
      }

      this.bindProviderListeners()

      return 'enabled'
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async addL2Network() {

    console.log("MetaMask: Adding network to MetaMask")

    const nw = getAllNetworks()
    const masterConfig = store.getState().setup.masterConfig

    const chainParam = {
      chainId: '0x' + nw[masterConfig].L2.chainId.toString(16),
      chainName: nw[masterConfig].L2.name,
      rpcUrls: [nw[masterConfig].L2.rpcUrl],
      blockExplorerUrls: [nw[masterConfig].L2.blockExplorer.slice(0, -1)],
    }

    console.log("MetaMask: Adding ", chainParam)

    // connect to the wallet
    this.provider = new ethers.providers.Web3Provider(window.ethereum)
    let res = await this.provider.send('wallet_addEthereumChain', [chainParam, this.account])

    if( res === null ){
      console.log("MetaMask - Added new RPC")
    } else {
      console.log("MetaMask - Error adding new RPC: ", res)
    }

  }

  /* Yes, this almost completely duplicates async switchChain( layer )
  but that's safest for now */
  async correctChain( targetLayer ) {

    const nw = getAllNetworks()
    const masterConfig = store.getState().setup.masterConfig

    let blockExplorerUrls = null

    //local does not have a blockexplorer
    if( masterConfig !== 'local') {
      blockExplorerUrls = [nw[masterConfig].L2.blockExplorer.slice(0, -1)]
    }

    //the chainParams are only needed for the L2's
    const chainParam = {
      chainId: '0x' + nw[masterConfig].L2.chainId.toString(16),
      chainName: nw[masterConfig].L2.name,
      rpcUrls: [nw[masterConfig].L2.rpcUrl],
      blockExplorerUrls
    }

    const targetIDHex = nw[masterConfig][targetLayer].chainIdHex

    this.provider = new ethers.providers.Web3Provider(window.ethereum)

    try {
      await this.provider.send('wallet_switchEthereumChain', [{ chainId: targetIDHex }])
    } catch (error) {
      // 4902 = the chain has not been added to MetaMask.
      if (error.code === 4902) {
        try {
          await this.provider.send('wallet_addEthereumChain', [chainParam, this.account])
        } catch (addError) {
          console.log("MetaMask - Error adding new RPC: ", addError)
        }
      } else { //some other error code
        console.log("MetaMask - Switch Error: ", error.code)
      }
    }
  }

  async switchChain( layer ) {

    if(this.L1orL2 === layer) {
      console.log("Nothing to do - You are already on ",layer)
      return
    }

    this.correctChain( layer )

  }

  async getTransactions() {

    // NOT SUPPORTED on LOCAL
    if (this.masterSystemConfig === 'local') return

    console.log("Getting transactions...")

    let txL1 = []
    let txL1pending = []
    let txL2 = []

    const responseL1 = await etherScanInstance(
      this.masterSystemConfig,
      'L1'
    ).get(`&address=${this.account}`)

    if (responseL1.status === 200) {
      const transactionsL1 = await responseL1.data
      if (transactionsL1.status === '1') {
        //thread in ChainID
        txL1 = transactionsL1.result.map(v => ({
          ...v,
          blockNumber: parseInt(v.blockNumber), //fix bug - sometimes this is string, sometimes an integer
          timeStamp: parseInt(v.timeStamp),     //fix bug - sometimes this is string, sometimes an integer
          chain: 'L1'
        }))
      }
    }

    //console.log("responseL1",txL1)

    const responseL2 = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('get.l2.transactions', {
      address: this.account,
      fromRange:  0,
      toRange: 1000,
    })

    //console.log("responseL2",responseL2)

    if (responseL2.status === 201) {
      //add the chain: 'L2' field
      txL2 = responseL2.data.map(v => ({...v, chain: 'L2'}))
    }

    const responseL1pending = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('get.l1.transactions', {
      address: this.account,
      fromRange:  0,
      toRange: 1000,
    })

    //console.log("responseL1pending",responseL1pending)

    if (responseL1pending.status === 201) {
      //add the chain: 'L1pending' field
      txL1pending = responseL1pending.data.map(v => ({...v, chain: 'L1pending'}))
      //console.log("txL1pending",txL1pending)
      const annotated = //await this.parseTransaction(
        [
          ...txL1,
          ...txL2,
          ...txL1pending //the new data product
        ]
      //)
      //console.log("annotated:",annotated)
      return annotated
    }

  }

  async getExits() {

    console.log("getExits()")

    // NOT SUPPORTED on LOCAL
    if (this.masterSystemConfig === 'local') return

    const response = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('get.l2.transactions', {
      address: this.account,
      fromRange:  0,
      toRange: 1000,
    })

    if (response.status === 201) {
      const transactions = response.data
      const filteredTransactions = transactions.filter(
        (i) => i.exitL2 && i.crossDomainMessage
      )
      return { exited: filteredTransactions }
    }

  }

  async getSevens() {

    console.log("getSevens()")

    // NOT SUPPORTED on LOCAL
    if (this.masterSystemConfig === 'local') return

    const response = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).get('get.l2.pendingexits')

    if (response.status === 201) {
      const data = response.data
      const filtered = data.filter(
        (i) => (i.fastRelay === 0) && (i.status === 'pending')
      )
      return filtered
    } else {
      return []
    }

  }

  async getFastExits() {

    console.log("getFastExits()")

    // NOT SUPPORTED on LOCAL
    if (this.masterSystemConfig === 'local') return

    const response = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).get('get.l2.pendingexits')

    if (response.status === 201) {
      const data = response.data
      const filtered = data.filter(
        (i) => (i.fastRelay === 1) && (i.status === 'pending')
      )
      return filtered
    } else {
      return []
    }
  }

  async addNFTContract( address ) {

    try {

      const contract = new ethers.Contract(
        address,
        L2ERC721Json.abi,
        this.L2Provider
      )

      let nftName = await contract.name()
      let nftSymbol = await contract.symbol()

      const newContract = {
        name: nftName,
        symbol: nftSymbol,
        address,
      }


      //console.log("newContract:",newContract)
      return newContract

    } catch (error) {
      console.log("NS: addNFTContract error:",error)
      return error
    }

  }

  //goal is to find your NFTs and NFT contracts based on local cache and registry data
  async fetchNFTs() {

    let NFTContracts = Object.entries(await getNFTContracts())
    //console.log("Step 1 - NFTContracts:",NFTContracts)

    //How many NFTs do you have right now?
    let numberOfNFTS = 0

    NFTContracts = Object.entries(await getNFTContracts())

    for(let i = 0; i < NFTContracts.length; i++) {
      
      const address = NFTContracts[i][1].address

      //console.log("address:",address)
      
      let contract = new ethers.Contract(
        address,
        L2ERC721Json.abi,
        this.L2Provider
      )

      //how many NFTs of this flavor do I own?
      const balance = await contract.connect(
        this.L2Provider
      ).balanceOf(this.account)

      numberOfNFTS = numberOfNFTS + Number(balance.toString())

    }

    //let's see if we already know about them
    const myNFTS = getNFTs()
    const numberOfStoredNFTS = Object.keys(myNFTS).length

    if (numberOfNFTS !== numberOfStoredNFTS) {

      //console.log('NFT change - need to add one or more NFTs')

      for(let i = 0; i < NFTContracts.length; i++) {

        const address = NFTContracts[i][1].address

        const contract = new ethers.Contract(
          address,
          L2ERC721Json.abi,
          this.L2Provider
        )

        //console.log("NFT contracts:",contract)

        const ownerTokenIDs = await contract.getOwnerNFTs(
          this.account
        )
        //console.log("ownerTokenIDs:",ownerTokenIDs)

        const balance = ownerTokenIDs.length
        //console.log("balance:",balance)

        //always the same, no need to have in the loop
        let nftName = await contract.name()
        let nftSymbol = await contract.symbol()

        //can have more than 1 per contract
        for (let i = 0; i < balance; i++) {

          const tokenID = ownerTokenIDs[i]
          const UUID = address.substring(1, 6) + '_' + tokenID.toString() + '_' + this.account.substring(1, 6)
          const nftMeta = await contract.tokenURI(tokenID)

          const { url , meta = [] } = await getNftImageUrl(nftMeta !== '' ? nftMeta : `https://boredapeyachtclub.com/api/mutants/121`)

          let NFT = {
            UUID, 
            address,
            name: nftName,
            tokenID,
            symbol: nftSymbol,
            url,
            meta
          }

          console.log("NFT:",NFT)

          await addNFT( NFT )

        }
      }
    }
  }

  async addTokenList() {
    // Add the token to our master list, if we do not have it yet
    // if the token is already in the list, then this function does nothing
    // but if a new token shows up, then it will get added
    if(allTokens === null) return

    Object.keys(allTokens).forEach((token, i) => {
      //console.log("allTokens[token].L1:",allTokens[token].L1)
      getToken(allTokens[token].L1)
    })
  }

  async getL1FeeBalance() {
    try {
      const balance = await this.L1Provider.getBalance(this.account)
      return utils.formatEther(balance)
    } catch (error) {
      console.log("NS: getL1FeeBalance error:",error)
      return error
    }
  }

  async getL2FeeBalance() {
    try {
      const balance = await this.L2Provider.getBalance(this.account)
      return utils.formatEther(balance)
    } catch (error) {
      console.log("NS: getL2FeeBalance error:",error)
      return error
    }
  }

  async getGas() {

    try {
      const gasPrice2 = await this.L2Provider.getGasPrice()
      //console.log("L2 gas", gasPrice2.toString())

      const block2 = await this.L2Provider.getBlockNumber()

      const gasPrice1 = await this.L1Provider.getGasPrice()
      //console.log("L1 gas", gasPrice1.toString())

      const block1 = await this.L1Provider.getBlockNumber()

      const gasData = {
        gasL1: Number(logAmount(gasPrice1.toString(),9)).toFixed(0),
        gasL2: Number(logAmount(gasPrice2.toString(),9)).toFixed(0),
        blockL1: Number(block1),
        blockL2: Number(block2),
      }

      //console.log(gasData)

      return gasData
    } catch (error) {
      console.log("NS: getGas error:",error)
      return error
    }

  }

  async getBalances() {

    try {

      // Always check ETH
      const layer1Balance = await this.L1Provider.getBalance(this.account)
      const layer2Balance = await this.L2Provider.getBalance(this.account)

      const layer1Balances = [
        {
          address: allAddresses.L1_ETH_Address,
          addressL2: allAddresses.L2_ETH_Address,
          currency: allAddresses.L1_ETH_Address,
          symbol: 'ETH',
          decimals: 18,
          balance: new BN(layer1Balance.toString()),
        },
      ]

      const layer2Balances = [
        {
          address: allAddresses.L2_ETH_Address,
          addressL1: allAddresses.L1_ETH_Address,
          addressL2: allAddresses.L2_ETH_Address,
          currency: allAddresses.L1_ETH_Address,
          symbol: 'ETH',
          decimals: 18,
          balance: new BN(layer2Balance.toString()),
        },
      ]

      const state = store.getState()
      const tA = Object.values(state.tokenList)

      const tokenC = new ethers.Contract(
        allAddresses.L1_ETH_Address,
        L1ERC20Json.abi,
        this.L1Provider
      )

      const getERC20Balance = async(token, tokenAddress, layer, provider) => {
        const balance = await tokenC.attach(tokenAddress).connect(provider).balanceOf(this.account)
        return {
          ...token,
          balance: new BN(balance.toString()),
          layer,
          address: layer === 'L1' ? token.addressL1 : token.addressL2,
          symbol: token.symbolL1
        }
      }

      const getBalancePromise = []

      tA.forEach((token) => {
        if (token.addressL1 === allAddresses.L1_ETH_Address) return
        if (token.addressL2 === allAddresses.L2_ETH_Address) return
        if (token.addressL1 === null) return
        if (token.addressL2 === null) return
        if(token.symbolL1 === 'xBOBA') {
          //there is no L1 xBOBA
          getBalancePromise.push(getERC20Balance(token, token.addressL2, "L2", this.L2Provider))
        } else {
          getBalancePromise.push(getERC20Balance(token, token.addressL1, "L1", this.L1Provider))
          getBalancePromise.push(getERC20Balance(token, token.addressL2, "L2", this.L2Provider))
        }
      })

      const tokenBalances = await Promise.all(getBalancePromise)

      tokenBalances.forEach((token) => {
        if (token.layer === 'L1' && token.symbol !== 'xBOBA' && token.balance.gt(new BN(0)) ) {
          layer1Balances.push(token)
        } else if (token.layer === 'L2' && (token.balance.gt(new BN(0)) || token.symbol === 'xBOBA')) {
          layer2Balances.push(token)
        }
      })

      return {
        layer1: orderBy(layer1Balances, (i) => i.currency),
        layer2: orderBy(layer2Balances, (i) => i.currency),
      }
    } catch (error) {
      console.log("NS: getBalances error:",error)
      return error
    }
  }

  handleMetaMaskError = (errorCode) => {
    console.log("MetaMask Errorcode:",errorCode)
    switch (errorCode) {
      case 4001:
        return 'Transaction was rejected by user: signature denied'
      //case -32603:
      //  return 'Execution reverted: ERC20: transfer amount exceeds balance'
      default:
        return null
    }
  }

  //Move ETH from L1 to L2 using the standard deposit system
  depositETHL2 = async (value_Wei_String) => {

    //console.log("this.L1StandardBridgeContract:",this.L1StandardBridgeContract)

    updateSignatureStatus_depositTRAD(false)

    try {

      const time_start = new Date().getTime()
      console.log("TX start time:", time_start)

      const depositTx = await this.L1StandardBridgeContract.depositETH(
        this.L2GasLimit,
        utils.formatBytes32String(new Date().getTime().toString()),
        {
          value: value_Wei_String
        }
      )

      //at this point the tx has been submitted, and we are waiting...
      await depositTx.wait()

      const block = await this.L1Provider.getTransaction(depositTx.hash)
      console.log(' block:', block)

      //closes the Deposit modal
      updateSignatureStatus_depositTRAD(true)

      const [msgHash] = await this.watcher.getMessageHashesFromL1Tx(
        depositTx.hash
      )
      console.log(' got L1->L2 message hash', msgHash)

      const receipt = await this.watcher.getL2TransactionReceipt(
        msgHash
      )
      console.log(' completed Deposit! L2 tx hash:', receipt.transactionHash)

      const time_stop = new Date().getTime()
      console.log("TX finish time:", time_stop)

      const data = {
        "key": process.env.REACT_APP_SPEED_CHECK,
        "hash": depositTx.hash,
        "l1Tol2": false, //since we are going L2->L1
        "startTime": time_start,
        "endTime": time_stop,
        "block": block.blockNumber,
        "cdmHash": receipt.transactionHash,
        "cdmBlock": receipt.blockNumber
      }

      console.log("Speed checker data payload:", data)

      const speed = await omgxWatcherAxiosInstance(
        this.masterSystemConfig
      ).post('send.crossdomainmessage', data)

      console.log("Speed checker:", speed)

      return receipt
    } catch(error) {
      console.log("NS: depositETHL2 error:",error)
      return error
    }
  }

  //Transfer funds from one account to another, on the L2
  async transfer(address, value_Wei_String, currency) {

    let tx = null

    try {

      if(currency === allAddresses.L2_ETH_Address) {
        //we are sending ETH

        let wei = BigNumber.from(value_Wei_String)

        tx = await this.provider.send('eth_sendTransaction',
          [
            {
              from: this.account,
              to: address,
              value: ethers.utils.hexlify(wei)
            }
          ]
        )

      } else {
        //any ERC20 json will do....
        tx = await this.L2_TEST_Contract.attach(currency).transfer(
          address,
          value_Wei_String
        )
        await tx.wait()
      }

      return tx
    } catch (error) {
      console.log("NS: transfer error:", error)
      return error
    }
  }

  //figure out which layer we are on right now
  confirmLayer = (layerToConfirm) => async (dispatch) => {
    if (layerToConfirm === this.L1orL2) {
      return true
    } else {
      return false
    }
  }

  async checkAllowance(
    currencyAddress,
    targetContract
  ) {
    console.log("currencyAddress",currencyAddress)
    console.log("targetContract",targetContract)
    try {
      const ERC20Contract = new ethers.Contract(
        currencyAddress,
        L1ERC20Json.abi, //could use any abi - just something with .allowance
        this.provider.getSigner()
      )
      const allowance = await ERC20Contract.allowance(
        this.account,
        targetContract
      )
      return allowance
    } catch (error) {
      console.log("NS: checkAllowance error:", error)
      return error
    }
  }

  // Used when people want to fast exit - they have to deposit funds into the L2LP
  // to start the fast exit
  async approveERC20_L2LP(
    value_Wei_String,
    currencyAddress
  ) {

    try {

      console.log("approveERC20_L2LP")

      //we could use any L2 ERC contract here - just getting generic parts of the abi
      //but we know we alaways have the TEST contract, so will use that
      const L2ERC20Contract = this.L2_TEST_Contract.attach(currencyAddress)

      let allowance_BN = await L2ERC20Contract.allowance(
        this.account,
        allAddresses.L2LPAddress
      )

      //let depositAmount_BN = new BN(value_Wei_String)
      let depositAmount_BN = BigNumber.from(value_Wei_String)

      if (depositAmount_BN.gt(allowance_BN)) {
        const approveStatus = await L2ERC20Contract.approve(
          allAddresses.L2LPAddress,
          value_Wei_String
        )
        await approveStatus.wait()
        return approveStatus
      }

      return allowance_BN
    } catch (error) {
      console.log("NS: approveERC20_L2LP error:", error)
      return error
    }
  }

  //used to stake funds in the L1LP
  async approveERC20_L1LP(
    value_Wei_String,
    currency
  ) {

    console.log("approveERC20_L1LP")
    const approveContractAddress = allAddresses.L1LPAddress

    let allowance_BN = BigNumber.from("0")
    let allowed = false

    try {

      const ERC20Contract = new ethers.Contract(
        currency,
        L1ERC20Json.abi,
        this.provider.getSigner()
      )

      if( currency !== allAddresses.L1_ETH_Address ) {

        let allowance_BN = await ERC20Contract.allowance(
          this.account,
          approveContractAddress
        )
        console.log("Initial allowance:",allowance_BN)

        /*
        OMG IS A SPECIAL CASE - allowance needs to be set to zero, and then
        set to actual amount, unless current approval amount is equal to, or
        bigger than, the current approval value
        */
        if( allowance_BN.lt(BigNumber.from(value_Wei_String)) &&
            (currency.toLowerCase() === allTokens.OMG.L1.toLowerCase())
        )
        {
          console.log("Current OMG Token allowance too small - might need to reset to 0, unless it's already zero")
          if (allowance_BN.gt(BigNumber.from("0"))) {
            const approveOMG = await ERC20Contract.approve(
              approveContractAddress,
              ethers.utils.parseEther("0")
            )
            await approveOMG.wait()
            console.log("OMG Token allowance has been set to 0")
          }
        }

        //recheck the allowance
        allowance_BN = await ERC20Contract.allowance(
          this.account,
          approveContractAddress
        )

        allowed = allowance_BN.gte(BigNumber.from(value_Wei_String))

      } else {
        //we are dealing with ETH - go straight to approve

      }

      if(!allowed) {
        //and now, the normal allowance transaction
        const approveStatus = await ERC20Contract.approve(
          approveContractAddress,
          value_Wei_String
        )
        await approveStatus.wait()
        console.log("ERC 20 L1 Staking approved:",approveStatus)
        return approveStatus
      }

      return allowance_BN

    } catch (error) {
      console.log("NS: approveERC20_L1LP error:", error)
      return error
    }
  }

  async approveERC20(
    value_Wei_String,
    currency,
    approveContractAddress = allAddresses.L1StandardBridgeAddress,
    contractABI = L1ERC20Json.abi
  ) {

    try {

      const ERC20Contract = new ethers.Contract(
        currency,
        contractABI,
        this.provider.getSigner()
      )

      /***********************/

      let allowance_BN = await ERC20Contract.allowance(
        this.account,
        approveContractAddress
      )
      console.log("Initial Allowance is:",allowance_BN)

      /*
      OMG IS A SPECIAL CASE - allowance needs to be set to zero, and then
      set to actual amount, unless current approval amount is equal to, or
      bigger than, the current approval value
      */
      if( allowance_BN.lt(BigNumber.from(value_Wei_String)) &&
          (currency.toLowerCase() === allTokens.OMG.L1.toLowerCase())
      )
      {
        console.log("Current OMG Token allowance too small - might need to reset to 0, unless it's already zero")
        if (allowance_BN.gt(BigNumber.from("0"))) {
          const approveOMG = await ERC20Contract.approve(
            approveContractAddress,
            ethers.utils.parseEther("0")
          )
          await approveOMG.wait()
          console.log("OMG Token allowance has been set to 0")
        }
      }

      //recheck the allowance
      allowance_BN = await ERC20Contract.allowance(
        this.account,
        approveContractAddress
      )
      console.log("Second Allowance is:",allowance_BN)

      const allowed = allowance_BN.gte(BigNumber.from(value_Wei_String))

      console.log("Allowed?:",allowed)

      if(!allowed) {
        console.log("Not good enough - need to set to:",value_Wei_String)
        //and now, the normal allowance transaction
        const approveStatus = await ERC20Contract.approve(
          approveContractAddress,
          value_Wei_String
        )
        await approveStatus.wait()
        console.log("ERC 20 L1 SWAP ops approved:",approveStatus)
      }

      return true
    } catch (error) {
      console.log("NS: approveERC20 error:", error)
      return error
    }
  }

  //Used to move ERC20 Tokens from L1 to L2 using the classic deposit
  async depositErc20(value_Wei_String, currency, currencyL2) {

    updateSignatureStatus_depositTRAD(false)

    const L1_TEST_Contract = this.L1_TEST_Contract.attach(currency)

    let allowance_BN = await L1_TEST_Contract.allowance(
      this.account,
      allAddresses.L1StandardBridgeAddress
    )

    try {
      /*
      OMG IS A SPECIAL CASE - allowance needs to be set to zero, and then
      set to actual amount, unless current approval amount is equal to, or
      bigger than, the current approval value
      */
      if( allowance_BN.lt(BigNumber.from(value_Wei_String)) &&
          (currency.toLowerCase() === allTokens.OMG.L1.toLowerCase())
      )
      {
        console.log("Current OMG Token allowance too small - might need to reset to 0, unless it's already zero")
        if (allowance_BN.gt(BigNumber.from("0"))) {
          const approveOMG = await L1_TEST_Contract.approve(
            allAddresses.L1StandardBridgeAddress,
            ethers.utils.parseEther("0")
          )
          await approveOMG.wait()
          console.log("OMG Token allowance has been set to 0")
        }
      }

      //recheck the allowance
      allowance_BN = await L1_TEST_Contract.allowance(
        this.account,
        allAddresses.L1StandardBridgeAddress
      )

      const allowed = allowance_BN.gte(BigNumber.from(value_Wei_String))

      if(!allowed) {
        //and now, the normal allowance transaction
        const approveStatus = await L1_TEST_Contract.approve(
          allAddresses.L1StandardBridgeAddress,
          value_Wei_String
        )
        await approveStatus.wait()
        console.log("ERC 20 L1 ops approved:",approveStatus)
      }

      const time_start = new Date().getTime()
      console.log("TX start time:", time_start)

      const depositTx = await this.L1StandardBridgeContract.depositERC20(
        currency,
        currencyL2,
        value_Wei_String,
        this.L2GasLimit,
        utils.formatBytes32String(new Date().getTime().toString())
      )

      console.log("depositTxStatus:",depositTx)

      //at this point the tx has been submitted, and we are waiting...
      await depositTx.wait()

      const block = await this.L1Provider.getTransaction(depositTx.hash)
      console.log(' block:', block)

      //closes the Deposit modal
      updateSignatureStatus_depositTRAD(true)

      const [msgHash] = await this.watcher.getMessageHashesFromL1Tx(
        depositTx.hash
      )
      console.log(' got L1->L2 message hash', msgHash)

      const receipt = await this.watcher.getL2TransactionReceipt(
        msgHash
      )
      console.log(' completed Deposit! L2 tx hash:', receipt.transactionHash)

      const time_stop = new Date().getTime()
      console.log("TX finish time:", time_stop)

      const data = {
        "key": process.env.REACT_APP_SPEED_CHECK,
        "hash": depositTx.hash,
        "l1Tol2": true,
        "startTime": time_start,
        "endTime": time_stop,
        "block": block.blockNumber,
        "cdmHash": receipt.transactionHash,
        "cdmBlock": receipt.blockNumber
      }

      console.log("Speed checker data payload:", data)

      const speed = await omgxWatcherAxiosInstance(
        this.masterSystemConfig
      ).post('send.crossdomainmessage', data)

      console.log("Speed checker:", speed)

      this.getBalances()

      return receipt
    } catch (error) {
      console.log("NS: depositErc20 error:", error)
      return error
    }
  }

  //Standard 7 day exit from BOBA
  async exitBOBA(currencyAddress, value_Wei_String) {

    updateSignatureStatus_exitTRAD(false)

    try {
      //now coming in as a value_Wei_String
      const value = BigNumber.from(value_Wei_String)

      const allowance = await this.checkAllowance(
        currencyAddress,
        allAddresses.DiscretionaryExitBurn
      )

      //no need to approve L2 ETH
      if( currencyAddress !== allAddresses.L2_ETH_Address && allowance.lt(value) ) {
        const res = await this.approveERC20(
          value_Wei_String,
          currencyAddress,
          allAddresses.DiscretionaryExitBurn
        )
        if (!res) return false
      }

      /*
      const estimatedGas = await ExitBurn.estimateGas.burnAndWithdraw(
        L2ERC20.address,
        utils.parseEther('10'),
        9999999,
        ethers.utils.formatBytes32String(new Date().getTime().toString())
      )
      */

      const DiscretionaryExitBurnContract = new ethers.Contract(
        allAddresses.DiscretionaryExitBurn,
        DiscretionaryExitBurnJson.abi,
        this.provider.getSigner()
      )
      console.log("DiscretionaryExitBurnContract",DiscretionaryExitBurnContract)

      const tx = await DiscretionaryExitBurnContract.burnAndWithdraw(
        currencyAddress,
        value_Wei_String,
        this.L1GasLimit,
        utils.formatBytes32String(new Date().getTime().toString()),
        currencyAddress === allAddresses.L2_ETH_Address ?
          { value: value_Wei_String } : {}
      )

      //everything submitted... waiting
      await tx.wait()

      //can close window now
      updateSignatureStatus_exitTRAD(true)

      const [L2ToL1msgHash] = await this.watcher.getMessageHashesFromL2Tx(tx.hash)
      console.log(' got L2->L1 message hash', L2ToL1msgHash)

      return tx
    } catch (error) {
      console.log("NS: exitBOBA error:", error)
      return error
    }

  }

  /* Estimate cost of Classical Exit to L1 */
  async getExitCost(currencyAddress) {

    let approvalCost_BN = BigNumber.from('0')

    const gasPrice = await this.L2Provider.getGasPrice()
    console.log("Classical exit gas price", gasPrice.toString())

    if( currencyAddress !== allAddresses.L2_ETH_Address ) {

      const ERC20Contract = new ethers.Contract(
        currencyAddress,
        L2ERC20Json.abi, //any old abi will do...
        this.provider.getSigner()
      )

      const tx = await ERC20Contract.populateTransaction.approve(
        allAddresses.DiscretionaryExitBurn,
        utils.parseEther('1.0')
      )

      const approvalGas_BN = await this.L2Provider.estimateGas(tx)
      approvalCost_BN = approvalGas_BN.mul(gasPrice)
      console.log("Approve cost in ETH:", utils.formatEther(approvalCost_BN))
    }

    const DiscretionaryExitBurnContract = new ethers.Contract(
      allAddresses.DiscretionaryExitBurn,
      DiscretionaryExitBurnJson.abi,
      this.provider.getSigner()
    )

    const tx2 = await DiscretionaryExitBurnContract.populateTransaction.burnAndWithdraw(
      allAddresses.L2_ETH_Address,
      utils.parseEther('0.00001'),
      this.L1GasLimit,
      ethers.utils.formatBytes32String(new Date().getTime().toString()),
      { value: utils.parseEther('0.00001') }
    )

    const gas_BN = await this.L2Provider.estimateGas(tx2)
    console.log("Classical exit gas", gas_BN.toString())

    const cost_BN = gas_BN.mul(gasPrice)
    console.log("Classical exit cost (ETH):", utils.formatEther(cost_BN))

    //returns total cost in ETH
    return utils.formatEther(cost_BN.add(approvalCost_BN))
  }

  /***********************************************/
  /*****                  Fee                *****/
  /***** Fees are reported as integers,      *****/
  /***** where every int represents 0.1%     *****/
  /***********************************************/

  async getL1TotalFeeRate() {

    try{
      const L1LPContract = new ethers.Contract(
        allAddresses.L1LPAddress,
        L1LPJson.abi,
        this.L1Provider
      )
      const [operatorFeeRate, userMinFeeRate, userMaxFeeRate] = await Promise.all([
        L1LPContract.ownerRewardFeeRate(),
        L1LPContract.userRewardMinFeeRate(),
        L1LPContract.userRewardMaxFeeRate()
      ])

      // console.log("L1 operatorFeeRate",Number(operatorFeeRate))
      // console.log("L1 userMinFeeRate",Number(userMinFeeRate))
      // console.log("L1 userMaxFeeRate",Number(userMaxFeeRate))

      const feeRateL = Number(userMinFeeRate) + Number(operatorFeeRate)
      const feeRateH = Number(userMaxFeeRate) + Number(operatorFeeRate)

      return {
        feeMin: (feeRateL / 10).toFixed(1),
        feeMax: (feeRateH / 10).toFixed(1)
      }
    } catch (error) {
      console.log("NS: getL1TotalFeeRate error:", error)
      return error
    }
  }

  async getL2TotalFeeRate() {

    try{
    
      const L2LPContract = new ethers.Contract(
        allAddresses.L2LPAddress,
        L2LPJson.abi,
        this.L2Provider
      )
      const [operatorFeeRate, userMinFeeRate, userMaxFeeRate] = await Promise.all([
        L2LPContract.ownerRewardFeeRate(),
        L2LPContract.userRewardMinFeeRate(),
        L2LPContract.userRewardMaxFeeRate()
      ])

    // console.log("L2 operatorFeeRate",Number(operatorFeeRate))
    // console.log("L2 userMinFeeRate",Number(userMinFeeRate))
    // console.log("L2 userMaxFeeRate",Number(userMaxFeeRate))

      const feeRateL = Number(userMinFeeRate) + Number(operatorFeeRate)
      const feeRateH = Number(userMaxFeeRate) + Number(operatorFeeRate)

      return {
        feeMin: (feeRateL / 10).toFixed(1),
        feeMax: (feeRateH / 10).toFixed(1)
      }
    } catch (error) {
      console.log("NS: getL2TotalFeeRate error:", error)
      return error
    }
  }

  async getL1UserRewardFeeRate(tokenAddress) {
    try{
        const L1LPContract = new ethers.Contract(
        allAddresses.L1LPAddress,
        L1LPJson.abi,
        this.L1Provider
      )
      const feeRate = await L1LPContract.getUserRewardFeeRate(tokenAddress)
      //console.log("NS: getL1UserRewardFeeRate:", feeRate)
      return (feeRate / 10).toFixed(1)
    } catch (error) {
      console.log("NS: getL1UserRewardFeeRate error:", error)
      return error
    }
  }

  async getL2UserRewardFeeRate(tokenAddress) {
    try {
        const L2LPContract = new ethers.Contract(
        allAddresses.L2LPAddress,
        L2LPJson.abi,
        this.L2Provider
      )
      const feeRate = await L2LPContract.getUserRewardFeeRate(tokenAddress)
      //console.log("NS: getL2UserRewardFeeRate:", feeRate)
      return (feeRate / 10).toFixed(1)
    } catch (error) {
      console.log("NS: getL2UserRewardFeeRate error:", error)
      return error
    }
  }

  /*****************************************************/
  /***** Pool, User Info, to populate the Farm tab *****/
  /*****************************************************/
  async getL1LPInfo() {

    const poolInfo = {}
    const userInfo = {}

    let tokenAddressList = Object.keys(allTokens).reduce((acc, cur) => {
      if(cur !== 'xBOBA') {
        acc.push(allTokens[cur].L1.toLowerCase())
      }
      return acc
    }, [allAddresses.L1_ETH_Address])

    const L1LPContract = new ethers.Contract(
      allAddresses.L1LPAddress,
      L1LPJson.abi,
      this.L1Provider
    )

    const L1LPInfoPromise = []

    const getL1LPInfoPromise = async(tokenAddress) => {

      let tokenBalance
      let tokenSymbol
      let tokenName
      let decimals

      if (tokenAddress === allAddresses.L1_ETH_Address) {
        //console.log("Getting eth balance:", tokenAddress)
        //getting eth balance
        tokenBalance = await this.L1Provider.getBalance(allAddresses.L1LPAddress)
        tokenSymbol = 'ETH'
        tokenName = 'Ethereum'
        decimals = 18
      } else {
        //getting eth balance
        //console.log("Getting balance for:", tokenAddress)
        tokenBalance = await this.L1_TEST_Contract.attach(tokenAddress).connect(this.L1Provider).balanceOf(allAddresses.L1LPAddress)
        tokenSymbol = await this.L1_TEST_Contract.attach(tokenAddress).connect(this.L1Provider).symbol()
        tokenName = await this.L1_TEST_Contract.attach(tokenAddress).connect(this.L1Provider).name()
        decimals = await this.L1_TEST_Contract.attach(tokenAddress).connect(this.L1Provider).decimals()
      }

      const poolTokenInfo = await L1LPContract.poolInfo(tokenAddress)
      const userTokenInfo = await L1LPContract.userInfo(tokenAddress, this.account)
      return { tokenAddress, tokenBalance, tokenSymbol, tokenName, poolTokenInfo, userTokenInfo, decimals }
    }

    tokenAddressList.forEach((tokenAddress) => L1LPInfoPromise.push(getL1LPInfoPromise(tokenAddress)))

    const L1LPInfo = await Promise.all(L1LPInfoPromise)

    sortRawTokens(L1LPInfo).forEach((token) => {
      poolInfo[token.tokenAddress.toLowerCase()] = {
        symbol: token.tokenSymbol,
        name: token.tokenName,
        decimals: token.decimals,
        l1TokenAddress: token.poolTokenInfo.l1TokenAddress.toLowerCase(),
        l2TokenAddress: token.poolTokenInfo.l2TokenAddress.toLowerCase(),
        accUserReward: token.poolTokenInfo.accUserReward.toString(),
        accUserRewardPerShare: token.poolTokenInfo.accUserRewardPerShare.toString(),
        userDepositAmount: token.poolTokenInfo.userDepositAmount.toString(),
        startTime: token.poolTokenInfo.startTime.toString(),
        APR:
          Number(token.poolTokenInfo.userDepositAmount.toString()) === 0
            ? 0
            : accMul(
                accDiv(
                  accDiv(
                    token.poolTokenInfo.accUserReward,
                    token.poolTokenInfo.userDepositAmount
                  ),
                  accDiv(
                    //compute a more accurate current APR by considering the last week only,
                    //rather than the full lifetime of the pools
                      7 * 24 * 60 * 60 * 1000,
                    //new Date().getTime() - Number(token.poolTokenInfo.startTime) * 1000,
                    365 * 24 * 60 * 60 * 1000
                  )
                ),
                100
              ), // ( accUserReward - userDepositAmount ) / timeDuration
        tokenBalance: token.tokenBalance.toString()
      }
      userInfo[token.tokenAddress] = {
        l1TokenAddress: token.tokenAddress.toLowerCase(),
        amount: token.userTokenInfo.amount.toString(),
        pendingReward: token.userTokenInfo.pendingReward.toString(),
        rewardDebt: token.userTokenInfo.rewardDebt.toString()
      }
    })
    return { poolInfo, userInfo }
  }

  async getL2LPInfo() {

    const tokenAddressList = Object.keys(allTokens).reduce((acc, cur) => {
      if(cur !== 'xBOBA') {
        acc.push({
          L1: allTokens[cur].L1.toLowerCase(),
          L2: allTokens[cur].L2.toLowerCase()
        })
      }
      return acc
    }, [{
      L1: allAddresses.L1_ETH_Address,
      L2: allAddresses.L2_ETH_Address
    }])

    //console.log("tokenAddressList:",tokenAddressList)

    const L2LPContract = new ethers.Contract(
      allAddresses.L2LPAddress,
      L2LPJson.abi,
      this.L2Provider
    )

    const poolInfo = {}
    const userInfo = {}

    const L2LPInfoPromise = [];

    const getL2LPInfoPromise = async( tokenAddress, tokenAddressL1 ) => {

      let tokenBalance
      let tokenSymbol
      let tokenName
      let decimals

      if (tokenAddress === allAddresses.L2_ETH_Address) {
        tokenBalance = await this.L2Provider.getBalance(allAddresses.L2LPAddress)
        tokenSymbol = 'ETH'
        tokenName = 'Ethereum'
        decimals = 18
      } else {
        tokenBalance = await this.L2_TEST_Contract.attach(tokenAddress).connect(this.L2Provider).balanceOf(allAddresses.L2LPAddress)
        tokenSymbol = await this.L2_TEST_Contract.attach(tokenAddress).connect(this.L2Provider).symbol()
        tokenName = await this.L2_TEST_Contract.attach(tokenAddress).connect(this.L2Provider).name()
        decimals = await this.L1_TEST_Contract.attach(tokenAddressL1).connect(this.L1Provider).decimals()
      }
      const poolTokenInfo = await L2LPContract.poolInfo(tokenAddress)
      const userTokenInfo = await L2LPContract.userInfo(tokenAddress, this.account)
      return { tokenAddress, tokenBalance, tokenSymbol, tokenName, poolTokenInfo, userTokenInfo, decimals }
    }

    tokenAddressList.forEach(({L1, L2}) => L2LPInfoPromise.push(getL2LPInfoPromise(L2, L1)))

    const L2LPInfo = await Promise.all(L2LPInfoPromise)

    sortRawTokens(L2LPInfo).forEach((token) => {
      poolInfo[token.tokenAddress.toLowerCase()] = {
        symbol: token.tokenSymbol,
        name: token.tokenName,
        decimals: token.decimals,
        l1TokenAddress: token.poolTokenInfo.l1TokenAddress.toLowerCase(),
        l2TokenAddress: token.poolTokenInfo.l2TokenAddress.toLowerCase(),
        accUserReward: token.poolTokenInfo.accUserReward.toString(),
        accUserRewardPerShare: token.poolTokenInfo.accUserRewardPerShare.toString(),
        userDepositAmount: token.poolTokenInfo.userDepositAmount.toString(),
        startTime: token.poolTokenInfo.startTime.toString(),
        APR:
          Number(token.poolTokenInfo.userDepositAmount.toString()) === 0
            ? 0
            : accMul(
                accDiv(
                  accDiv(
                    token.poolTokenInfo.accUserReward,
                    token.poolTokenInfo.userDepositAmount
                  ),
                  accDiv(
                    //compute a more accurate current APR by considering the last week only,
                    //rather than the full lifetime of the pools
                      7 * 24 * 60 * 60 * 1000,
                    //new Date().getTime() - Number(token.poolTokenInfo.startTime) * 1000,
                    365 * 24 * 60 * 60 * 1000
                  )
                ),
                100
              ), // ( accUserReward - userDepositAmount ) / timeDuration
        tokenBalance: token.tokenBalance.toString()
      }
      userInfo[token.tokenAddress.toLowerCase()] = {
        l2TokenAddress: token.tokenAddress.toLowerCase(),
        amount: token.userTokenInfo.amount.toString(),
        pendingReward: token.userTokenInfo.pendingReward.toString(),
        rewardDebt: token.userTokenInfo.rewardDebt.toString()
      }
    })

    return { poolInfo, userInfo }
  }

  /***********************************************/
  /*****            Add Liquidity            *****/
  /***********************************************/
  async addLiquidity(currency, value_Wei_String, L1orL2Pool) {

    //console.log("currency",currency)
    //console.log("value_Wei_String",value_Wei_String)
    //console.log("L1orL2Pool",L1orL2Pool)

    let otherField = {}

    if( currency === allAddresses.L1_ETH_Address || currency === allAddresses.L2_ETH_Address ) {
      //console.log("Yes we have ETH")
      otherField = { value: value_Wei_String }
    }

    try {
      // Deposit
      const addLiquidityTX = await (L1orL2Pool === 'L1LP'
        ? this.L1LPContract
        : this.L2LPContract
      ).addLiquidity(
        value_Wei_String,
        currency,
        otherField
      )
      await addLiquidityTX.wait()
      return true
    } catch (error) {
      console.log("NS: addLiquidity error:", error)
      return error
    }
  }

  /***********************************************/
  /*****           Get Reward                *****/
  /***********************************************/
  async getReward(currencyAddress, value_Wei_String, L1orL2Pool) {

    try {
      const TX = await (L1orL2Pool === 'L1LP'
        ? this.L1LPContract
        : this.L2LPContract
      ).withdrawReward(
        value_Wei_String,
        currencyAddress,
        this.account
      )
      await TX.wait()
      return TX
    } catch (error) {
      console.log("NS: getReward error:", error)
      return error
    }
  }

  /***********************************************/
  /*****          Withdraw Liquidity         *****/
  /***********************************************/
  async withdrawLiquidity(currency, value_Wei_String, L1orL2Pool) {

    try {
      const TX = await (L1orL2Pool === 'L1LP'
        ? this.L1LPContract
        : this.L2LPContract
      ).withdrawLiquidity(
        value_Wei_String,
        currency,
        this.account
      )
      await TX.wait()
      return TX
    } catch (error) {
      console.log("NS: withdrawLiquidity error:", error)
      return error
    }
  }

  /***********************************************************/
  /***** SWAP ON to BOBA by depositing funds to the L1LP *****/
  /***********************************************************/
  async depositL1LP(currency, value_Wei_String) {

    updateSignatureStatus_depositLP(false)

    console.log("depositL1LP:",currency)
    console.log("value_Wei_String",value_Wei_String)

    const time_start = new Date().getTime()
    console.log("TX start time:", time_start)

    const depositTX = await this.L1LPContract.clientDepositL1(
      value_Wei_String,
      currency,
      currency === allAddresses.L1_ETH_Address ? { value: value_Wei_String } : {}
    )

    console.log("depositTX",depositTX)

    //at this point the tx has been submitted, and we are waiting...
    await depositTX.wait()

    const block = await this.L1Provider.getTransaction(depositTX.hash)
    console.log(' block:', block)

    updateSignatureStatus_depositLP(true)

    // Waiting the response from L2
    const [msgHash] = await this.watcher.getMessageHashesFromL1Tx(
      depositTX.hash
    )
    console.log(' got L1->L2 message hash', msgHash)

    const receipt = await this.watcher.getL2TransactionReceipt(msgHash)
    console.log(' completed swap-on ! L2 tx hash:', receipt.transactionHash)

    const time_stop = new Date().getTime()
    console.log("TX finish time:", time_stop)

    const data = {
      "key": process.env.REACT_APP_SPEED_CHECK,
      "hash": depositTX.hash,
      "l1Tol2": true,
      "startTime": time_start,
      "endTime": time_stop,
      "block": block.blockNumber,
      "cdmHash": receipt.transactionHash,
      "cdmBlock": receipt.blockNumber
    }

    console.log("Speed checker data payload:", data)

    const speed = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('send.crossdomainmessage', data)

    console.log("Speed checker:", speed)

    return receipt
  }


  /***************************************/
  /************ L1LP Pool size ***********/
  /***************************************/
  async L1LPPending(tokenAddress) {

    const L1pending = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).get('get.l2.pendingexits', {})

    //console.log("tokenAddress",tokenAddress)
    //console.log("L1pending",L1pending)

    const pendingFast = L1pending.data.filter(i => {
       return (i.fastRelay === 1) && //fast exit
        i.exitToken.toLowerCase() === tokenAddress.toLowerCase() //and, this specific token
    })

    //console.log("L1pendingFast",pendingFast)

    let sum = pendingFast.reduce(function(prev, current) {
      let weiString = BigNumber.from(current.exitAmount)
      return prev.add(weiString)
    }, BigNumber.from('0'))

    //console.log("L1pendingFastSum:",sum.toString())

    return sum.toString()

  }

  /***************************************/
  /************ L1LP Pool size ***********/
  /***************************************/
  async L2LPPending(tokenAddress) {
    //Placeholder return
    const sum = BigNumber.from('0')
    return sum.toString()
  }

  /***************************************/
  /************ L1LP Pool size ***********/
  /***************************************/
  async L1LPBalance(tokenAddress) {

    //console.log("L1LPBalance(tokenAddress)")

    let balance
    let tokenAddressLC = tokenAddress.toLowerCase()

    if (
      tokenAddressLC === allAddresses.L2_ETH_Address ||
      tokenAddressLC === allAddresses.L1_ETH_Address
    ) {
      balance = await this.L1Provider.getBalance(allAddresses.L1LPAddress)
    } else {
      balance = await this.L1_TEST_Contract.attach(tokenAddress).connect(this.L1Provider).balanceOf(
        allAddresses.L1LPAddress
      )
    }

    //console.log("L1LPBalance(tokenAddress):",balance.toString())

    return balance.toString()

  }

  /***************************************/
  /************ L2LP Pool size ***********/
  /***************************************/
  async L2LPBalance(tokenAddress) {

    let balance
    let tokenAddressLC = tokenAddress.toLowerCase()

    if (
      tokenAddressLC === allAddresses.L2_ETH_Address ||
      tokenAddressLC === allAddresses.L1_ETH_Address
    ) {
      //We are dealing with ETH
      balance = await this.L2_ETH_Contract.connect(this.L2Provider).balanceOf(
        allAddresses.L2LPAddress
      )
    } else {
      balance = await this.L2_TEST_Contract.attach(tokenAddress).connect(this.L2Provider).balanceOf(
        allAddresses.L2LPAddress
      )
    }

    return balance.toString()
  }

  /***************************************/
  /*********** L1LP Liquidity ************/
  /***************************************/
  async L1LPLiquidity(tokenAddress) {

    const L1LPContractNS = new ethers.Contract(
      allAddresses.L1LPAddress,
      L1LPJson.abi,
      this.L1Provider
    )

    try {
      const poolTokenInfo = await L1LPContractNS.poolInfo(tokenAddress)
      return poolTokenInfo.userDepositAmount.toString()
    } catch (error) {
      console.log("NS: L1LPLiquidity error:", error)
      return error
    }

  }

  /***************************************/
  /*********** L2LP Liquidity ************/
  /***************************************/
  async L2LPLiquidity(tokenAddress) {

    const L2LPContractNS = new ethers.Contract(
      allAddresses.L2LPAddress,
      L2LPJson.abi,
      this.L2Provider
    )

    try {
      const poolTokenInfo = await L2LPContractNS.poolInfo(tokenAddress)
      return poolTokenInfo.userDepositAmount.toString()
    } catch (error) {
      console.log("NS: L2LPLiquidity error:", error)
      return error
    }

  }

  /* Estimate cost of Fast Exit to L1 */
  async getFastExitCost(currencyAddress) {

    let approvalCost_BN = BigNumber.from('0')

    const gasPrice = await this.L2Provider.getGasPrice()
    console.log("Fast exit gas price", gasPrice.toString())

    if( currencyAddress !== allAddresses.L2_ETH_Address ) {

      const ERC20Contract = new ethers.Contract(
        currencyAddress,
        L2ERC20Json.abi, //any old abi will do...
        this.provider.getSigner()
      )

      const tx = await ERC20Contract.populateTransaction.approve(
        allAddresses.L2LPAddress,
        utils.parseEther('1.0')
      )

      const approvalGas_BN = await this.L2Provider.estimateGas(tx)
      approvalCost_BN = approvalGas_BN.mul(gasPrice)
      console.log("Approve cost in ETH:", utils.formatEther(approvalCost_BN))
    }

    //in some cases zero not allowed
    const tx2 = await this.L2LPContract.populateTransaction.clientDepositL2(
      currencyAddress === allAddresses.L2_ETH_Address ? '1' : '0', //ETH does not allow zero
      currencyAddress,
      currencyAddress === allAddresses.L2_ETH_Address ? { value : '1'} : {}
    )

    const depositGas_BN = await this.L2Provider.estimateGas(tx2)
    console.log("Fast exit gas", depositGas_BN.toString())

    const depositCost_BN = depositGas_BN.mul(gasPrice)
    console.log("Fast exit cost (ETH):", utils.formatEther(depositCost_BN))

    //returns total cost in ETH
    return utils.formatEther(depositCost_BN.add(approvalCost_BN))
  }

  /* Estimate cost of Fast Deposit to L2 */
  async getFastDepositCost(currencyAddress) {

    let approvalCost_BN = BigNumber.from('0')

    const gasPrice = await this.L1Provider.getGasPrice()
    console.log("Fast deposit gas price", gasPrice.toString())

    if( currencyAddress !== allAddresses.L1_ETH_Address ) {

      const ERC20Contract = new ethers.Contract(
        currencyAddress,
        L2ERC20Json.abi, //any old abi will do...
        this.provider.getSigner()
      )

      const tx = await ERC20Contract.populateTransaction.approve(
        allAddresses.L1LPAddress,
        utils.parseEther('1.0')
      )

      const approvalGas_BN = await this.L1Provider.estimateGas(tx)
      approvalCost_BN = approvalGas_BN.mul(gasPrice)
      console.log("Approve cost in ETH:", utils.formatEther(approvalCost_BN))
    }

    //in some cases zero not allowed
    const tx2 = await this.L1LPContract.populateTransaction.clientDepositL1(
      currencyAddress === allAddresses.L1_ETH_Address ? '1' : '0', //ETH does not allow zero
      currencyAddress,
      currencyAddress === allAddresses.L1_ETH_Address ? { value : '1'} : {}
    )

    const depositGas_BN = await this.L1Provider.estimateGas(tx2)
    console.log("Fast deposit gas", depositGas_BN.toString())

    const depositCost_BN = depositGas_BN.mul(gasPrice)
    console.log("Fast deposit cost (ETH):", utils.formatEther(depositCost_BN))

    //returns total cost in ETH
    return utils.formatEther(depositCost_BN.add(approvalCost_BN))
  }

  /**************************************************************/
  /***** SWAP OFF from BOBA by depositing funds to the L2LP *****/
  /**************************************************************/
  async fastExitAll(currencyAddress) {

    updateSignatureStatus_exitLP(false)

    let approvalGas_BN = BigNumber.from('0')
    let approvalCost_BN = BigNumber.from('0')
    let balance_BN = BigNumber.from('0')

    let gasPrice = await this.L2Provider.getGasPrice()
    console.log("Fast exit gas price", gasPrice.toString())

    if( currencyAddress === allAddresses.L2_ETH_Address ) {
      balance_BN = await this.L2Provider.getBalance(this.account)
    }

    //console.log("Address:",currencyAddress)
    if( currencyAddress !== allAddresses.L2_ETH_Address ) {

      const L2ERC20Contract = new ethers.Contract(
        currencyAddress,
        L2ERC20Json.abi,
        this.provider.getSigner()
      )

      balance_BN = await L2ERC20Contract.balanceOf(
        this.account
      )
      console.log("Initial Balance:", utils.formatEther(balance_BN))

      let allowance_BN = await L2ERC20Contract.allowance(
        this.account,
        allAddresses.L2LPAddress
      )
      console.log("Allowance:",utils.formatEther(allowance_BN))

      if (balance_BN.gt(allowance_BN)) {

        //Estimate gas
        const tx = await L2ERC20Contract.populateTransaction.approve(
          allAddresses.L2LPAddress,
          balance_BN
        )

        approvalGas_BN = await this.L2Provider.estimateGas(tx)
        approvalCost_BN = approvalGas_BN.mul(gasPrice)
        console.log("Cost to Approve (ETH):", utils.formatEther(approvalCost_BN))

        const approveStatus = await L2ERC20Contract.approve(
          allAddresses.L2LPAddress,
          balance_BN
        )
        await approveStatus.wait()

        if (!approveStatus)
          return false

      } else {
        console.log("Allowance already suitable:", utils.formatEther(allowance_BN))
      }

    }

    const tx2 = await this.L2LPContract.populateTransaction.clientDepositL2(
      balance_BN,
      currencyAddress,
      currencyAddress === allAddresses.L2_ETH_Address ? { value : balance_BN } : {}
    )
    //console.log("tx2",tx2)

    let depositGas_BN = await this.L2Provider.estimateGas(tx2)

    //returns 94082, which is too low?
    //add 40...
    //BUG BUG BUG - this should not be needed
    depositGas_BN = depositGas_BN.add('40')

    console.log("Deposit gas", depositGas_BN.toString())
    let depositCost_BN = depositGas_BN.mul(gasPrice)
    console.log("Deposit gas cost (ETH)", utils.formatEther(depositCost_BN))

    if(currencyAddress === allAddresses.L2_ETH_Address) {
      //if fee token, need to consider cost to exit
      balance_BN = balance_BN.sub(depositCost_BN)
    }

    const ccBal = await this.L2Provider.getBalance(this.account)

    console.log("Balance:", utils.formatEther(ccBal))
    console.log("Cost to exit:", utils.formatEther(depositCost_BN))
    console.log("Amount to exit:", utils.formatEther(balance_BN))
    console.log("Should be zero (if exiting ETH):", ccBal.sub(balance_BN.add(depositCost_BN)).toString())

    const time_start = new Date().getTime()
    console.log("TX start time:", time_start)

    const depositTX = await this.L2LPContract.clientDepositL2(
      balance_BN,
      currencyAddress,
      currencyAddress === allAddresses.L2_ETH_Address ? { value : balance_BN } : {}
    )

    //at this point the tx has been submitted, and we are waiting...
    await depositTX.wait()

    const block = await this.L2Provider.getTransaction(depositTX.hash)
    console.log(' block:', block)

    //closes the modal
    updateSignatureStatus_exitLP(true)

    // Waiting for the response from L1
    const [msgHash] = await this.fastWatcher.getMessageHashesFromL2Tx(
      depositTX.hash
    )
    console.log(' got L2->L1 message hash', msgHash)

    const receipt = await this.fastWatcher.getL1TransactionReceipt(
      msgHash
    )
    console.log(' completed Deposit! L1 tx hash:', receipt.transactionHash)

    const time_stop = new Date().getTime()
    console.log("TX finish time:", time_stop)

    const data = {
      "key": process.env.REACT_APP_SPEED_CHECK,
      "hash": depositTX.hash,
      "l1Tol2": false, //since we are going L2->L1
      "startTime": time_start,
      "endTime": time_stop,
      "block": block.blockNumber,
      "cdmHash": receipt.transactionHash,
      "cdmBlock": receipt.blockNumber
    }

    console.log("Speed checker data payload:", data)

    const speed = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('send.crossdomainmessage', data)

    console.log("Speed checker:", speed)

    return receipt
  }

  /**************************************************************/
  /***** SWAP OFF from BOBA by depositing funds to the L2LP *****/
  /**************************************************************/
  async depositL2LP(currencyAddress, value_Wei_String) {

    updateSignatureStatus_exitLP(false)

    console.log("depositL2LP currencyAddress",currencyAddress)

    if( currencyAddress !== allAddresses.L2_ETH_Address ) {

      const L2ERC20Contract = new ethers.Contract(
        currencyAddress,
        L2ERC20Json.abi,
        this.provider.getSigner()
      )

      let allowance_BN = await L2ERC20Contract.allowance(
        this.account,
        allAddresses.L2LPAddress
      )

      let depositAmount_BN = BigNumber.from(value_Wei_String)

      if (depositAmount_BN.gt(allowance_BN)) {
        const approveStatus = await L2ERC20Contract.approve(
          allAddresses.L2LPAddress,
          value_Wei_String
        )
        await approveStatus.wait()
        if (!approveStatus) return false
      }
    }

    const time_start = new Date().getTime()
    console.log("TX start time:", time_start)

    const depositTX = await this.L2LPContract.clientDepositL2(
      value_Wei_String,
      currencyAddress,
      currencyAddress === allAddresses.L2_ETH_Address ? { value: value_Wei_String } : {}
    )

    //at this point the tx has been submitted, and we are waiting...
    await depositTX.wait()

    const block = await this.L2Provider.getTransaction(depositTX.hash)
    console.log(' block:', block)

    //closes the modal
    updateSignatureStatus_exitLP(true)

    // Waiting for the response from L1
    const [msgHash] = await this.fastWatcher.getMessageHashesFromL2Tx(
      depositTX.hash
    )
    console.log(' got L2->L1 message hash', msgHash)

    const receipt = await this.fastWatcher.getL1TransactionReceipt(
      msgHash
    )
    console.log(' completed Deposit! L1 tx hash:', receipt.transactionHash)

    const time_stop = new Date().getTime()
    console.log("TX finish time:", time_stop)

    const data = {
      "key": process.env.REACT_APP_SPEED_CHECK,
      "hash": depositTX.hash,
      "l1Tol2": false, //since we are going L2->L1
      "startTime": time_start,
      "endTime": time_stop,
      "block": block.blockNumber,
      "cdmHash": receipt.transactionHash,
      "cdmBlock": receipt.blockNumber
    }

    console.log("Speed checker data payload:", data)

    const speed = await omgxWatcherAxiosInstance(
      this.masterSystemConfig
    ).post('send.crossdomainmessage', data)

    console.log("Speed checker:", speed)

    return receipt
  }

  async fetchLookUpPrice(params) {
    try {
       // fetching only the prices compare to usd.
       const res = await coinGeckoAxiosInstance.get(
         `simple/price?ids=${params.join()}&vs_currencies=usd`
       )
       return res.data
    } catch(error) {
      return error
    }
  }

  /***********************************************/
  /*****         DAO Functions               *****/
  /***********************************************/

  // get DAO Balance
  async getDaoBalance() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return
    if( this.BobaContract === null ) return

    try {
      //console.log('Checking DAO balance')
      let balance = await this.BobaContract.balanceOf(this.account)
      //console.log('balance',balance)
      return { balance: formatEther(balance) }
    } catch (error) {
      console.log('Error: getDaoBalance', error)
      return error
    }
  }

  async getDaoBalanceX() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return
    if( this.xBobaContract === null ) return

    try {
      //console.log('Checking DAO balance')
      let balance = await this.xBobaContract.balanceOf(this.account)
      //console.log('balance',balance)
      return { balanceX: formatEther(balance) }
    } catch (error) {
      console.log('Error: getDaoBalanceX', error)
      return error
    }
  }

  // get DAO Votes
  async getDaoVotes() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return
    if( this.BobaContract === null ) return

    try {
      let votes = await this.BobaContract.getCurrentVotes(this.account)
      return { votes: formatEther(votes) }
    } catch (error) {
      console.log('NS: getDaoVotes error:', error)
      return error
    }
  }

    // get DAO Votes
  async getDaoVotesX() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return
    if( this.xBobaContract === null ) return

    try {
      let votes = await this.xBobaContract.getCurrentVotes(this.account)
      return { votesX: formatEther(votes) }
    } catch (error) {
      console.log('NS: getDaoVotesX error:', error)
      return error
    }
  }

  //Transfer DAO Funds
  async transferDao({ recipient, amount }) {

    if( this.L1orL2 !== 'L2' ) return
    if( this.BobaContract === null ) return

    try {
      const tx = await this.BobaContract.transfer(recipient, parseEther(amount.toString()))
      await tx.wait()
      return tx
    } catch (error) {
      console.log('NS: transferDao error:', error)
      return error
    }
  }

  //Delegate DAO Authority
  async delegateVotes({ recipient }) {

    if( this.L1orL2 !== 'L2' ) return
    if( this.BobaContract === null ) return

    try {
      const tx = await this.BobaContract.delegate(recipient)
      await tx.wait()
      return tx
    } catch (error) {
      console.log('NS: delegateVotes error:', error)
      return error
    }
  }

  //Delegate DAO Authority
  async delegateVotesX({ recipient }) {

    if( this.L1orL2 !== 'L2' ) return
    if( this.xBobaContract === null ) return

    try {
      const tx = await this.xBobaContract.delegate(recipient)
      await tx.wait()
      return tx
    } catch (error) {
      console.log('NS: delegateVotesX error:', error)
      return error
    }
  }

  // Proposal Create Threshold
  async getProposalThreshold() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return
    if( this.delegateContract === null ) return

    try {
      const delegateCheck = await this.delegateContract.attach(allAddresses.GovernorBravoDelegator)
      const rawThreshold = await delegateCheck.proposalThreshold()
      //console.log("rawThreshold:",rawThreshold)
      const res = { proposalThreshold: formatEther(rawThreshold) }
      return res
    } catch (error) {
      console.log('NS: getProposalThreshold error:', error)
      return error
    }
  }

  //Create Proposal
  async createProposal(payload) {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return
    if( this.delegateContract === null ) return

    //console.log("payload",payload)

    let signatures = [''] // the function that will carry out the proposal
    let value1 = 0
    let value2 = 0
    let value3 = 0
    let description = ''
    let address = ['']
    let callData = ['']

    const delegateCheck = await this.delegateContract.attach(allAddresses.GovernorBravoDelegator)

    if( payload.action === 'text-proposal' ) {
      address = [delegateCheck.address] // anything will do, as long at it's not blank
      description = payload.text.slice(0, 252) //100+150+2
      callData = [ethers.utils.defaultAbiCoder.encode( //placeholder value
        ['uint256'],
        [value1]
      )]
    } else if ( payload.action === 'change-lp1-fee' ) {
      signatures = ['configureFeeExits(uint256,uint256,uint256)']
      value1 = Number(payload.value[0])
      value2 = Number(payload.value[1])
      value3 = Number(payload.value[2])
      description = `Change L1 LP Bridge fee to ${value1}, ${value2}, and ${value3} integer percent`
      address = [allAddresses.L2LPAddress]
      callData = [ethers.utils.defaultAbiCoder.encode(
        ['uint256','uint256','uint256'],
        [value1, value2, value3]
      )]
    } else if ( payload.action === 'change-lp2-fee' ) {
      address = [delegateCheck.address]
      signatures = ['configureFee(uint256,uint256,uint256)']
      value1 = Number(payload.value[0])
      value2 = Number(payload.value[1])
      value3 = Number(payload.value[2])
      description = `Change L2 LP Bridge fee to ${value1}, ${value2}, and ${value3} integer percent`
      address = [allAddresses.L2LPAddress]
      callData = [ethers.utils.defaultAbiCoder.encode(
        ['uint256','uint256','uint256'],
        [value1, value2, value3]
      )]
    } else if ( payload.action === 'change-threshold' ) {
      address = [delegateCheck.address]
      signatures = ['_setProposalThreshold(uint256)']
      value1 = Number(payload.value[0])
      description = `Change Proposal Threshold to ${value1} BOBA`
      callData = [ethers.utils.defaultAbiCoder.encode(
        ['uint256'],
        [value1]
      )]
    }

    try {

      let values = [0] //amount of ETH to send, generally, zero

      // console.log("Submitting proposal:", {
      //   address, 
      //   values, 
      //   signatures, 
      //   callData, 
      //   description
      // })

      let res = await delegateCheck.propose(
        address,
        values,
        signatures,
        callData,
        description
      )
      return res

    } catch (error) {
      console.log("NS: getProposalThreshold error:",error)
      return error
    }
  }

  //Fetch DAO Proposals
  async fetchProposals() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return
    if( this.delegateContract === null ) return

    const delegateCheck = await this.delegateContract.attach(allAddresses.GovernorBravoDelegator)

    try {

      let proposalList = []

      const proposalCounts = await delegateCheck.proposalCount()
      //console.log('proposalCounts:',proposalCounts)

      const totalProposals = await proposalCounts.toNumber()
      console.log('totalProposals:',totalProposals)
      
      const filter = delegateCheck.filters.ProposalCreated(
        null, null, null, null, null,
        null, null, null, null
      )

      //console.log('filter:',filter)

      const descriptionList = await delegateCheck.queryFilter(filter)
      
      //console.log('descriptionList:',descriptionList)

      for (let i = 0; i < totalProposals; i++) {

        if(typeof(descriptionList[i]) === 'undefined') continue

        let proposalID = descriptionList[i].args[0]

        //this is a number such as 2
        let proposalData = await delegateCheck.proposals(proposalID)

        const proposalStates = [
          'Pending',
          'Active',
          'Canceled',
          'Defeated',
          'Succeeded',
          'Queued',
          'Expired',
          'Executed',
        ]

        let state = await delegateCheck.state(proposalID)

        let againstVotes = parseInt(formatEther(proposalData.againstVotes))
        let forVotes = parseInt(formatEther(proposalData.forVotes))
        let abstainVotes = parseInt(formatEther(proposalData.abstainVotes))

        let startBlock = proposalData.startBlock.toString()
        let startTimestamp = proposalData.startTimestamp.toString()
        let endTimestamp = proposalData.endTimestamp.toString()

        let proposal = await delegateCheck.getActions(i+2)

        const { hasVoted } = await delegateCheck.getReceipt(proposalID, this.account)

        let description = descriptionList[i].args[8].toString()

        proposalList.push({
           id: proposalID.toString(),
           proposal,
           description,
           totalVotes: forVotes + againstVotes,
           forVotes,
           againstVotes,
           abstainVotes,
           state: proposalStates[state],
           startBlock,
           startTimestamp,
           endTimestamp,
           hasVoted
        })

      }
      return { proposalList }
    } catch (error) {
      console.log("NS: fetchProposals error:",error)
      return error
    }
  }

  //Cast vote for proposal
  async castProposalVote({id, userVote}) {

    if( this.delegateContract === null ) return

    try {
      const delegateCheck = await this.delegateContract.attach(allAddresses.GovernorBravoDelegator)
      let res = delegateCheck.castVote(id, userVote)
      return res
    } catch(error) {
      console.log("NS: castProposalVote error:",error)
      return error
    }
  }

  async queueProposal(proposalID) {

    if( this.delegateContract === null ) return

    console.log("ProposalID:",Number(proposalID))

    try {
      const delegateCheck = await this.delegateContract.attach(allAddresses.GovernorBravoDelegator)
      let res = delegateCheck.queue(Number(proposalID))
      return res
    } catch(error) {
      console.log("NS: queueProposal error:",error)
      return error
    }

  }

  async executeProposal(proposalID) {

    if( this.delegateContract === null ) return

    console.log("ProposalID:",Number(proposalID))

    try {
      const delegateCheck = await this.delegateContract.attach(allAddresses.GovernorBravoDelegator)
      let res = delegateCheck.execute(Number(proposalID))
      return res
    } catch(error) {
      console.log("NS: executeProposal error:",error)
      return error
    }

  }


  /***********************************************/
  /*****       Fixed savings account         *****/
  /***********************************************/
  async addFS_Savings(value_Wei_String) {
    
    try {

      const FixedSavings = new ethers.Contract(
        allAddresses.BobaFixedSavings,
        L2SaveJson.abi,
        this.provider.getSigner()
      )

      // const account = await this.provider.getSigner().getAddress()
      // console.log('this.account', account)

      // console.log(this.L2Provider)

      let allowance_BN = await this.BobaContract.allowance(
        this.account,
        allAddresses.BobaFixedSavings
      )
      console.log("Allowance",allowance_BN.toString())

      let depositAmount_BN = BigNumber.from(value_Wei_String)

      console.log("Deposit:",depositAmount_BN)

      if (depositAmount_BN.gt(allowance_BN)) {
        console.log("Need to approve YES:",depositAmount_BN)
        const approveStatus = await this.BobaContract.approve(
          allAddresses.BobaFixedSavings,
          value_Wei_String
        )
        await approveStatus.wait()
        if (!approveStatus) return false
      } else {
        console.log("Allowance is sufficient:",allowance_BN.toString(), depositAmount_BN.toString())
      }

      const TX = await FixedSavings.stake(value_Wei_String)
      await TX.wait()
      return true
    } catch (error) {
      console.log("NS: addFS_Savings error:", error)
      return error
    }
  }

  /***********************************************/
  /*****       Fixed savings account         *****/
  /***********************************************/
  async withdrawFS_Savings(stakeID) {

    try {

      const FixedSavings = new ethers.Contract(
        allAddresses.BobaFixedSavings,
        L2SaveJson.abi,
        this.provider.getSigner()
      )

      const TX = await FixedSavings.unstake(stakeID)
      await TX.wait()
      return true
    } catch (error) {
      console.log("NS: withdrawFS_Savings error:", error)
      return error
    }
  }

  async getFS_Saves() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return

    try {
      const FixedSavings = new ethers.Contract(
        allAddresses.BobaFixedSavings,
        L2SaveJson.abi,
        this.L2Provider
      )

      //const l2ba = 
      await FixedSavings.l2Boba()
      //console.log('l2 boba:', l2ba)
      //console.log('l2 boba:', allTokens['BOBA'])

      let stakecount = await FixedSavings.personalStakeCount(this.account)
      return { stakecount: Number(stakecount) }
    } catch (error) {
      console.log('NS: getSaves error:', error)
      return error
    }
  }

  async getFS_Info() {

    //if( this.masterSystemConfig === 'mainnet' ) return
    //if( this.masterSystemConfig === 'rinkeby' ) return

    if( this.L1orL2 !== 'L2' ) return

    try {

      const FixedSavings = new ethers.Contract(
        allAddresses.BobaFixedSavings,
        L2SaveJson.abi,
        this.L2Provider
      )

      let stakeInfo = []

      const stakeCounts = await FixedSavings.personalStakeCount(this.account)
      //console.log('stakeCounts:',stakeCounts)

      for (let i = 0; i < stakeCounts; i++) {

        const stakeId = await FixedSavings.personalStakePos(this.account, i)
        const stakeData = await FixedSavings.stakeDataMap(stakeId)

        stakeInfo.push({
          stakeId: Number(stakeId.toString()),
          depositTimestamp: Number(stakeData.depositTimestamp.toString()),
          depositAmount: logAmount(stakeData.depositAmount.toString(), 18),
          isActive: stakeData.isActive
        })

      }
      //console.log("stakeInfo:",stakeInfo)
      return { stakeInfo }
    } catch (error) {
      console.log("NS: getFS_Info error:",error)
      return error
    }

  }

}

const networkService = new NetworkService()
export default networkService
