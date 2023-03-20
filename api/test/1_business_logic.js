
const chai = require('chai');
const { assert, expect } = chai;
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const { app, init: initServer } = require('../main');
const Web3 = require("web3");
const { transferTokens, getBalance, createPaynowInstance } = require('../utils');
const { TOKEN_CONTRACT_ABI } = require('../constants');
const casual = require('casual');
const System = require('../db/System');
const Payment = require('../db/Payment');


chai.use(chaiHttp);
chai.use(chaiSpies);

const requester = chai.request(app).keepOpen();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_URL));


suite("Business logic", function () {


    this.beforeAll(async () => {
        await initServer();
    });

    let account;
    let privateKey

    test("Create account", async () => {

        const payload = {
            account_type: 'customer',
        }

        const res = await requester.post('/api/accounts').send(payload);

        assert.equal(res.status, 200);
        assert.property(res.body, 'account');
        assert.property(res.body, 'private_key');
        
        account = res.body.account;
        privateKey = res.body.private_key;
        
    });


    test('Login', async () => {

        const payload = { private_key: privateKey };
        const res = await requester.post('/api/login').send(payload);

        assert.equal(res.status, 200);
        assert.isNumber(res.body.balance);
        assert.isString(res.body.account);
        assert.isString(res.body.account_type);
        
    })

    test('Retrieve account info', async () => {

        const res = await requester.get(`/api/accounts/${account}`).send();

        assert.equal(res.status, 200);
        assert.property(res.body, 'balance');
        assert.property(res.body, 'account_type');
        assert.isNumber(res.body.balance);
        assert.isString(res.body.account_type);

    });


    test('Transfer tokens', async () => {

        // create account
        const web3Account = await web3.eth.accounts.create();

        const payload = {
            recipient: web3Account.address,
            tokens: 1
        }

        // load tokens to the previously created account
        await transferTokens({ 
            web3,
            tokens: 2,
            account: process.env.MAIN_ACCOUNT,
            privateKey: process.env.MAIN_ACCOUNT_PRIVATE_KEY,
            recipient: account
        });


        const res = await requester
                            .post(`/api/accounts/${account}/transfer`)
                            .set('x-private-key', privateKey)
                            .send(payload);

        assert.equal(res.status, 200);

        // check recipient account balance
        const balance = await getBalance({ web3, account: web3Account.address });
        assert.equal(balance, 1);

    });


    test('Withdraw accounts', async () => {

        // create company account
        let res = await requester.post('/api/accounts').send({
            account_type: 'company'
        });

        assert.equal(res.status, 200);

        // load money into it
        const account = res.body.account;
        const privateKey = res.body.private_key;
        const balance = 2;

        await transferTokens({
            web3,
            tokens: balance,
            account: process.env.MAIN_ACCOUNT,
            privateKey: process.env.MAIN_ACCOUNT_PRIVATE_KEY,
            recipient: account
        });

        res = await requester
                .post(`/api/accounts/${account}/withdrawal`)
                .set('x-private-key', privateKey)
                .send({ tokens: balance });


        assert.equal(res.status, 200);

        // test remaining balance
        const newBalance = await getBalance({ web3, account });
        assert.equal(newBalance, 0);

    });

    test('Set current price', async () => {

        const fuel_price = 10 + 10 * casual.random;

        // create company account
        let res = await requester
            .put('/api/system/fuel-price')
            .set('x-private-key', process.env.MAIN_ACCOUNT_PRIVATE_KEY)
            .send({ fuel_price });

        assert.equal(res.status, 200);

        // check db
        const system = await System.findByPk(1);
        assert.equal(system.fuel_price, fuel_price);

    });

    test('Retrieve current price', async () => {

        // create company account
        let res = await requester
            .get('/api/system/fuel-price')
            .send();

        assert.equal(res.status, 200);
        assert.isNumber(res.body.fuel_price);

    });

    test('Initiate payment', async () => {

        const tokens = casual.integer(10, 20);

        // send spy undercover
        const paynow = createPaynowInstance();
        chai.spy.on(paynow, 'sendMobile', () => {});

        // create company account
        let res = await requester
            .post('/api/payments')
            .set('x-private-key', privateKey)
            .send({
                tokens,
                phone: casual.phone
            });

        assert.equal(res.status, 200);

        // check spies
        expect(paynow.sendMobile).to.have.been.called(1);
        chai.spy.restore(paynow, 'sendMobile');

        // check db
        const payment = await Payment.findOne({
            order: [
                [ 'id', 'DESC' ]
            ]
        }); // last inserted payment

        assert.isObject(payment);
        assert.equal(payment.tokens, tokens);

    });

    test('Payment webhook', async () => {

        let payment = await Payment.findOne({
            order: [
                [ 'id', 'DESC' ]
            ]
        }); // last inserted payment

        const paynow = createPaynowInstance();

        const payload = {
            status: 'paid',
        };

        payload.hash = paynow.generateHash(payload, process.env.PAYNOW_SECRET);

        // create company account
        let res = await requester
            .post(`/api/payments/${payment.id}/webhooks/paynow`)
            .set('x-private-key', privateKey)
            .send(payload);

        assert.equal(res.status, 200);

        // check db
        payment = await Payment.findByPk(payment.id);
        assert.isNull(payment);

    });
});