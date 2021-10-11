var Web3 = require('web3');

(async () => {
  try {
    var web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
    const toAddress = process.argv.slice(2)[0]; // Address of the recipient
    const amount = '2'; // Willing to send 2 ethers
    const amountToSend = web3.utils.toWei(amount, "ether"); // Convert to wei value
    //use an account from l1_chain PK 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
    console.log('Funding address with ETH');
    console.log(toAddress);
    console.log(await web3.eth.sendTransaction({ from:'0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc', to:toAddress, value:amountToSend }));
  } catch (e) {
      // Deal with the fact the chain failed
  }
})();