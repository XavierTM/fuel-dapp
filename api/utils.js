

const Tx = require('ethereumjs-tx');
const { TOKEN_CONTRACT_ABI } = require("./constants");
const Lock = require('./Lock');

const transferLock = new Lock();


async function transferTokens({
                                 web3,
                                 tokens,
                                 account,
                                 privateKey,
                                 recipient
                              }) {


   // acquire lock
   const releaseLock = await transferLock.acquire();

   try {

      // verify private key
      const mainAccountPrivateKey = process.env.MAIN_ACCOUNT_PRIVATE_KEY;

      if (mainAccountPrivateKey !== privateKey) {
         const derivedAccount = await privateKeyToAccount({ web3, privateKey });

         if (derivedAccount !== account)
            throw new TransferError('Not authorized', TransferError.AUTH_ERROR);
      }

      // verify balance
      const balance = await getBalance({ web3, account })
      if (balance < parseFloat(tokens))
         throw new TransferError('Insufficient funds', TransferError.INSUFFICIENT_FUNDS_ERROR);

      // get transaction count, later will used as nonce
      const mainAccount = process.env.MAIN_ACCOUNT;
      const count = await web3.eth.getTransactionCount(mainAccount);

      // set your private key here, we'll sign the transaction below
      const processedPrivateKey = Buffer.from(mainAccountPrivateKey, 'hex'); 
      
      const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
      const contract = new web3.eth.Contract(TOKEN_CONTRACT_ABI, tokenContractAddress);

      const amount = web3.utils.toHex(tokens);
      const gasLimit = web3.utils.toHex("3000000");

      const gasPriceNumber = await getGasPrice(web3);
      const gasPrice = web3.utils.toHex(gasPriceNumber);

      const rawTransaction = { 
         from: mainAccount,
         gasLimit,
         gasPrice,
         to: tokenContractAddress,
         value: "0x0",
         data: contract.methods.transferOnBehalf(account, recipient, amount).encodeABI(),
         nonce: web3.utils.toHex(count),
      }

      const transaction = new Tx.Transaction(rawTransaction, { chain: 'goerli' })
      transaction.sign(processedPrivateKey);

      return await _sendSignedTransaction(web3, transaction);
      
   } finally {
      releaseLock();
   }
   

}


function _sendSignedTransaction(web3, signedTransaction) {
   return new Promise((resolve, reject) => {

      web3.eth.sendSignedTransaction('0x' + signedTransaction.serialize().toString('hex'), (err, hash) => {

         if (err)
            return reject(err);

         require('fs/promises').appendFile(`${__dirname}/.transactions`, hash + '\n')
            .then(() => {})
            .catch(() => {})

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


async function getGasPrice(web3) {

   let price = await web3.eth.getGasPrice()
   price = parseInt(parseFloat(price) * 2)

   return price
}

async function privateKeyToAccount({ web3, privateKey }) {
   const res = await web3.eth.accounts.privateKeyToAccount(privateKey);
   return res.address;
}


class TransferError extends Error {

   static AUTH_ERROR = 'auth';
   static INSUFFICIENT_FUNDS_ERROR = 'insufficient_funds';

   constructor(msg, code) {
      super(msg)
      this.code = code;
   }

}

module.exports = {
   getBalance,
   getGasPrice,
   privateKeyToAccount,
   transferTokens,
   TransferError,
}
