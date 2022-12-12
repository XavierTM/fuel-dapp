console.clear();


require('dotenv').config();
require('./env');

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const status_500 = require('./status_500');
const Joi = require('@xavisoft/joi');
const Web3 = require("web3");
const { init: initDB } = require('./db');
const Account = require('./db/Account');
const { TOKEN_CONTRACT_ABI } = require('./constants');
const { transferTokens, getBalance, privateKeyToAccount, getGasPrice, TransferError } = require('./utils');


const app = express();
let web3;

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// routes
app.post('/api/accounts', async (req, res) => {

   try {

      // validate
      const schema = {
         account_type: Joi.valid('customer', 'company').required(),
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // create account
      /// on the block
      const account = web3.eth.accounts.create();
      
      const { address, privateKey: private_key } = account;

      // on database
      await Account.create({
         account: address,
         type: req.body.account_type
      });

      res.send({
         account: address,
         private_key,
      });


   } catch (err) {
      status_500(err, res);
   }
});

app.get('/api/accounts/:account', async (req, res) => {

   try {
      
      const { account } = req.params;

      // get account type
      let dbAccount = await Account.findOne({ where: { account }});

      if (!dbAccount)
         dbAccount = await Account.create({ account });

      // get balance
      let balance = await getBalance({ web3, account });
      balance = parseFloat(balance);

      const account_type = dbAccount.type;

      res.send({
         balance,
         account_type,
      });

   } catch (err) {
      status_500(err, res);
   }
});

app.post('/api/accounts/:account/transfer', async (req, res) => {

   try {


      // validation
      /// authish
      let privateKey = req.headers['x-private-key'];

      if (!privateKey)
         return res.sendStatus(401);
      
      /// body
      const schema = {
         tokens: Joi.number().min(0).required(),
         recipient: Joi.string().required()
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);
      
      // transfer 
      const { recipient, tokens } = req.body;
      const { account } = req.params;

      let transactionId;

      try {
         transactionId = await transferTokens({ web3, tokens, account, privateKey, recipient });
      } catch (err) {

         switch (err.code) {
            case TransferError.AUTH_ERROR:
               return res.sendStatus(401);
            case TransferError.INSUFFICIENT_FUNDS_ERROR:
               return res.status(402).send('Insufficient tokens');
            default:
               throw err;
         }
      }

      res.send({ transactionId });

   } catch (err) {
      status_500(err, res);
   }
});

app.post('/api/accounts/:account/withdrawal', async (req, res) => {

   try {

      // validation
      /// authish
      let privateKey = req.headers['x-private-key'];

      if (!privateKey)
         return res.sendStatus(401);
      
      /// body
      const schema = {
         tokens: Joi.number().min(0).required()
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // is account company
      const { account } = req.params;

      const dbAccount = await Account.findOne({
         where: { account }
      });

      if (!dbAccount)
         return res.sendStatus(404);
      
      if (dbAccount.type !== 'company')
         return res.sendStatus(403);

      // transfer 
      const { tokens } = req.body;
      const recipient = process.env.MAIN_ACCOUNT;
      
      let transactionId;

      try {
         transactionId = await transferTokens({ web3, tokens, account, privateKey, recipient });
      } catch (err) {

         switch (err.code) {
            case TransferError.AUTH_ERROR:
               return res.sendStatus(401);
            case TransferError.INSUFFICIENT_FUNDS_ERROR:
               return res.sendStatus(402);
            default:
               throw err;
         }
      }

      res.send({ transactionId });

   } catch (err) {
      status_500(err, res);
   }
});

app.post('/api/login', async (req, res) => {

   try {

      // validation
      const schema = {
         private_key: Joi.string().required(),
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // get account 
      const privateKey = req.body.private_key;
      const account = await privateKeyToAccount({ web3, privateKey });

      if (!account)
         return res.status(400).send('Invalid credentials');
     

      // get account details
      let dbAccount = await Account.findOne({ where: { account }});

      if (!dbAccount)
         dbAccount = await Account.create({ account });

      const { type: account_type } = dbAccount;

      // get account balance
      const balance = await getBalance({ web3, account });


      // respond
      res.send({
         account,
         account_type,
         balance
      });


      

   } catch (err) {
      status_500(err, res);
   }
});

app.get('/test', async (req, res) => {

   try {

      const price = await web3.eth.getGasPrice();

      const mainAccount = process.env.MAIN_ACCOUNT;
      const countDefault = await web3.eth.getTransactionCount(mainAccount);
      const defaultBlock = web3.eth.defaultBlock
      const countPending = await web3.eth.getTransactionCount(mainAccount, 'pending')
      const countEarliest = await web3.eth.getTransactionCount(mainAccount, 'earliest')
      const countLatest = await web3.eth.getTransactionCount(mainAccount, 'latest');



      const body = {
         price,
         defaultBlock,
         countDefault,
         countEarliest,
         countLatest,
         countPending
      }

      console.log(body)

      res.send(body)

      const transaction = await web3.eth.getPendingTransactions();

      console.log(transaction)

   } catch (err) {
      status_500(err, res);
   }
})


// initialization
const PORT = process.env.PORT || 8080;

function init() {

   return new Promise((resolve, reject) => {
      app.listen(PORT, async () => {

         try {
            console.log("Server started at PORT", PORT);
         
            await initDB();
            console.log('DB initialized');
         
            web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_URL));
            console.log('Blockchain initialized');

            resolve();

         } catch (err) {
            reject(err);
         }
         
      });

   });
}


if (process.env.NODE_ENV !== 'test')
   init();

module.exports = {
   app,
   init
};