console.clear();


require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const status_500 = require('./status_500');
const Joi = require('@xavisoft/joi');
const Web3 = require("web3");
const { init: initDB } = require('./db');
const Account = require('./db/Account');
const { BALANCE_OF_ABI, TRANSFER_ABI } = require('./constants');
const Tx = require('ethereumjs-tx');
const { transferTokens } = require('./utils');


const app = express();
let web3;

// middlewares
app.use(morgan('combined'));
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
         address,
         private_key,
      });


   } catch (err) {
      status_500(err, res);
   }
});

app.get('/api/accounts/:account/balance', async (req, res) => {

   try {
      
      const { account } = req.params;

      const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
      const contract = new web3.eth.Contract(BALANCE_OF_ABI, tokenContractAddress);
      const balance = await contract.methods.balanceOf(account).call();

      res.send({
         balance
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
         recepient: Joi.string().required()
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);
      
      // transfer 
      const { recepient, tokens } = req.body;
      const { account } = req.params;
      await transferTokens({ web3, tokens, account, privateKey, recepient });

      res.send();

   } catch (err) {
      status_500(err, res);
   }
});

app.post('/api/accounts/:account/widthdraw', async (req, res) => {

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
      const recepient = process.env.MAIN_ACCOUNT;
      await transferTokens({ web3, tokens, account, privateKey, recepient });

      res.send();

   } catch (err) {
      status_500(err, res);
   }
});


// initialization
const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {

   console.log("Server started at PORT", PORT);

   await initDB();
   console.log('DB initialized');

   web3 = new Web3(process.env.WEB3_URL);
   console.log('Blockchain initialized');
   
})