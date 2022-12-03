

const Tx = require('ethereumjs-tx');
const { TOKEN_CONTRACT_ABI } = require("./constants");


async function transferTokens({
                                 web3,
                                 tokens,
                                 account,
                                 privateKey,
                                 recipient
                              }) {


   // verify private key
   const mainAccountPrivateKey = process.env.MAIN_ACCOUNT_PRIVATE_KEY;

   if (mainAccountPrivateKey !== privateKey) {
      const derivedAccount = await privateKeyToAccount({ web3, privateKey });

      if (derivedAccount !== account)
         return false;
   }

   // get transaction count, later will used as nonce
   const mainAccount = process.env.MAIN_ACCOUNT;
   const count = await web3.eth.getTransactionCount(mainAccount);

   // set your private key here, we'll sign the transaction below
   const processedPrivateKey = Buffer.from(mainAccountPrivateKey, 'hex'); 
   
   const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
   const contract = new web3.eth.Contract(TOKEN_CONTRACT_ABI, tokenContractAddress);

   const amount = web3.utils.toHex(tokens);

   const gasPrice = web3.utils.toHex("100000");
   const gasLimit = web3.utils.toHex("300000");

   const rawTransaction = { 
      from: account, 
      gasPrice,
      gasLimit,
      to: contract._address, 
      value: "0x0",
      data: contract.methods.transferOnBehalf(account, recipient, amount).encodeABI(),
      nonce: web3.utils.toHex(count)
   }

   const transaction = new Tx.Transaction(rawTransaction)
   transaction.sign(processedPrivateKey);

   try {
      await _sendSignedTransaction(web3, transaction);
      return true;
   } catch (err) {
      console.log(err);
      process.exit();
   }

}


function _sendSignedTransaction(web3, signedTransaction) {
   return new Promise((resolve, reject) => {

      web3.eth.sendSignedTransaction('0x' + signedTransaction.serialize().toString('hex'), (err, hash) => {

         if (err)
            return reject(err);

         resolve(hash);
      });
   });
}


async function getBalance({ web3, account }) {
   const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
   const contract = new web3.eth.Contract(TOKEN_CONTRACT_ABI, tokenContractAddress);
   const balance = await contract.methods.balanceOf(account).call();

   return parseFloat(balance);
}

async function privateKeyToAccount({ web3, privateKey }) {
   const res = await web3.eth.accounts.privateKeyToAccount(privateKey);
   return res.address;
}

module.exports = {
   getBalance,
   privateKeyToAccount,
   transferTokens
}