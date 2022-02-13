var Web3 = require('web3')
var web3 = new Web3('http://localhost:8545')
var web3Ver = new Web3('http://localhost:8547')
var web3Rep = new Web3('http://localhost:8549')

//0x24e24da4742191d061ed4fe007a6c185791f3956e550bc012767edab5ee4f43a

var block = 206

web3.eth.getBlock(block).then(result => {
  console.log("Block from L2Geth:", result.timestamp)
})

web3Ver.eth.getBlock(block).then(result => {
  console.log("Block from L2Geth Verifier:", result.timestamp)
})

web3Rep.eth.getBlock(block).then(result => {
  console.log("Block from L2Geth Replica:", result)
})

/*
  console.log("Block from L2Geth:", result)

Block from L2Geth: {
  difficulty: '2',
  extraData: '0xd98301090a846765746889676f312e31352e3133856c696e757800000000000042d2266c5fce099b0baa53cf51bcca4a87d0c70d2d40be0676fa81ba4b7b9c1665e83cf1d3f48fb8e18dbb53e2a2111378333b6f81f11eef54407056c39f35af00',
  gasLimit: 11000000,
  gasUsed: 2501443,
  hash: '0xaef33ec7fc96871efc18d892834126efe8fcde70e08a738ed6ae3c8b107e20ef',
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  miner: '0x0000000000000000000000000000000000000000',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  number: 96,
  parentHash: '0xcdba28a4bb95b20ac33a06c6bdc2cd118422055b63308161f76f482cc39e880d',
  receiptsRoot: '0x4c8e10eabe1ef6c18a345e320d48b598aeed20440becb9aed6f135bc2e2e7f09',
  sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  size: 12002,
  stateRoot: '0xef01b0c85b114163a112d35c38656d4ba35cba635a98f0083775938950dba0c4',
  timestamp: 1644695765,
  totalDifficulty: '193',
  transactions: [
    '0xf1db47cbcae917b0f32056f808c779e06d38bff595636ff57def231b2faa5be1'
  ],
  transactionsRoot: '0x7ff13c0f0947b90b75ce91c86a1a460bfd102d2a4ff34fc3e84773ed8b6dbc38',
  uncles: []
}
*/









// web3.eth.getTransaction('0x4734683a1ba9ed37fc020b149350a7e3efc105b3eda0dd03a590bbe3a2e8667a').then(result => {
//   console.log("Breaking TX:", result)
// })

// web3.eth.getStorageAt('0x4200000000000000000000000000000000000020', 0).then(result => {
//   console.log("Owner address:", result)
// });

// newKey = web3.utils.soliditySha3("0x0000000000000000000000004200000000000000000000000000000000000022", 1);
// web3.eth.getStorageAt('0x4200000000000000000000000000000000000020', newKey).then(function(res){
//     console.log("0x22 balance:", parseInt(res, 16))
// })

// web3.eth.getStorageAt('0x4200000000000000000000000000000000000020', 2).then(result => {
//   console.log("Fee token address:", result)
// })

// web3.eth.getStorageAt('0x4200000000000000000000000000000000000020', 3).then(result => {
//   console.log("Price:", web3.utils.toBN(result).toString())
// })

// web3.eth.getStorageAt('0x4200000000000000000000000000000000000020', 4).then(result => {
//   console.log("Owner balance:",web3.utils.toBN(result).toString())
// })

/*
              {
                "astId": 393,
                "contract": "contracts/L2/predeploys/BobaTuringCredit.sol:BobaTuringCredit",
                "label": "_owner",
                "offset": 0,
                "slot": "0",
                "type": "t_address"
              },
              {
                "astId": 6119,
                "contract": "contracts/L2/predeploys/BobaTuringCredit.sol:BobaTuringCredit",
                "label": "prepaidBalance",
                "offset": 0,
                "slot": "1",
                "type": "t_mapping(t_address,t_uint256)"
              },
              {
                "astId": 6121,
                "contract": "contracts/L2/predeploys/BobaTuringCredit.sol:BobaTuringCredit",
                "label": "turingToken",
                "offset": 0,
                "slot": "2",
                "type": "t_address"
              },
              {
                "astId": 6123,
                "contract": "contracts/L2/predeploys/BobaTuringCredit.sol:BobaTuringCredit",
                "label": "turingPrice",
                "offset": 0,
                "slot": "3",
                "type": "t_uint256"
              },
              {
                "astId": 6125,
                "contract": "contracts/L2/predeploys/BobaTuringCredit.sol:BobaTuringCredit",
                "label": "ownerRevenue",
                "offset": 0,
                "slot": "4",
                "type": "t_uint256"
              }
              */