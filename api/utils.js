const { TRANSFER_ABI } = require("./constants");


async function transferTokens({
                                 web3,
                                 tokens,
                                 account,
                                 privateKey,
                                 recepient
                              }) {


   // set token source, destination and amount
   const amount = web3.utils.toHex(tokens);

   // get transaction count, later will used as nonce
   const count = await web3.eth.getTransactionCount(account)  

   // set your private key here, we'll sign the transaction below
   const processedPrivateKey = new Buffer(privateKey, 'hex'); 
   
   const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
   const contract = new web3.eth.Contract(TRANSFER_ABI, tokenContractAddress, { from: account });

   const rawTransaction = { from:account, 
      gasPrice: web3.utils.toHex(2 * 1e9),
      gasLimit: web3.utils.toHex(210000), 
      to: tokenContractAddress, 
      value: "0x0",
      data: contract.methods.transfer(recepient, amount).encodeABI(),
      nonce: web3.utils.toHex(count)
   }

   const transaction = new Tx(rawTransaction)
   transaction.sign(processedPrivateKey);

   await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));  

}


module.exports = {
   transferTokens
}