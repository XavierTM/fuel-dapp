
const chai = require('chai');
const { assert } = chai;
const chaiHttp = require('chai-http');
const { app, init: initServer } = require('../main');
const Web3 = require("web3");
const { transferTokens, getBalance } = require('../utils');
const { TOKEN_CONTRACT_ABI } = require('../constants');
const casual = require('casual');


chai.use(chaiHttp);
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
});