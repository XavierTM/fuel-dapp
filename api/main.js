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
const { transferTokens, getBalance, privateKeyToAccount, getGasPrice, TransferError, createPaynowInstance, processPhoneNo } = require('./utils');
const System = require('./db/System');
const Payment = require('./db/Payment');


const app = express();
let web3;

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

      const account_type = dbAccount.type;

      // get balance
      let balance = await getBalance({ web3, account });
      balance = parseFloat(balance);


      // get fuel price
      const { fuel_price }  = await System.findByPk(1);

      res.send({
         balance,
         account_type,
         id: dbAccount.id,
         fuel_price,
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

app.put('/api/system/fuel-price', async (req, res) => {

   try {

      // authentication
      let privateKey = req.headers['x-private-key'];
      
      if (!privateKey)
         return res.sendStatus(401);

      if (privateKey.indexOf('0x') === 0)
         privateKey = privateKey.substring(2);

      if (privateKey !== process.env.MAIN_ACCOUNT_PRIVATE_KEY)
         return res.sendStatus(403);

      // validation
      const schema = {
         fuel_price: Joi.number().min(0.01).required(),
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // update system
      await System.update({ fuel_price: req.body.fuel_price }, {
         where: { id: 1 }
      });

      res.send();

   } catch (err) {
      status_500(err, res);
   }
});

app.get('/api/system/fuel-price', async (req, res) => {

   try {
      const { fuel_price }  = await System.findByPk(1);
      res.send({ fuel_price });
   } catch (err) {
      status_500(err, res);
   }
});

app.post('/api/payments', async (req, res) => {

   try {

      // authentication
      const privateKey = req.headers['x-private-key'];
      
      if (!privateKey)
         return res.sendStatus(401);

      // validation
      const schema = {
         tokens: Joi.number().integer().min(1).required(),
         phone: Joi.string().required(),
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // create payments
      let account = await privateKeyToAccount({ web3, privateKey });
      account = await Account.findOne({ where: { account }});

      if (!account)
         return res.status(401).send('Account not found in the system');

      account = account.id;

      const { tokens } = req.body;
      const payment = await Payment.create({ account, tokens });

      // initiate payment
      const { fuel_price } = await System.findByPk(1);
      const total = tokens * fuel_price;

      const paynow = createPaynowInstance();
      paynow.resultUrl = `${process.env.SYSTEM_URL}/api/payments/${payment.id}/webhooks/paynow`;
      const paynowPayment = paynow.createPayment(payment.id, 'xaviermukodi@gmail.com');
      paynowPayment.add('FUEL_TOKENS', total);

      const { mm, phone } = processPhoneNo(req.body.phone); 
      await paynow.sendMobile(paynowPayment, phone, mm);

      res.send();

   } catch (err) {
      status_500(err, res);
   }
});

app.post('/api/payments/:id/webhooks/paynow', async (req, res) => {

   try {

     
      // validation
      let { hash, status } = req.body; 

      if (!(hash && status))
         return res.sendStatus(400);

      const paynow = createPaynowInstance(); 
      const isHashValid = paynow.verifyHash(req.body);

      if (!isHashValid)
         return res.sendStatus(401);

      // check status
      if (process.env.NODE_ENV !== 'production')
         status = 'paid';

      if (status.toLowerCase() !== 'paid')
         return res.send();

      // send tokens
      const payment = await Payment.findByPk(req.params.id, {
         include: Account,
      });

      const tokens = payment.tokens;
      const recipient = payment.Account.account;
      const account = process.env.MAIN_ACCOUNT;
      const privateKey = process.env.MAIN_ACCOUNT_PRIVATE_KEY;

      await transferTokens({ web3, tokens, account, recipient, privateKey });

      // delete payment
      await payment.destroy();

   
      res.send();

   } catch (err) {
      status_500(err, res);
   }
});

app.get('/test', async (req, res) => {

   try {

      // const privateKey = process.env.MAIN_ACCOUNT_PRIVATE_KEY;
      const account = process.env.MAIN_ACCOUNT;
      const tokens = await getBalance({ web3, account });

      res.send({ tokens })
   
   } catch (err) {
      status_500(err, res);
   }
});



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