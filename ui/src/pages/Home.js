import { css } from "@emotion/css";
import { Component } from "react";
import QRCode from 'react-qr-code';
import TextField from '@mui/material/TextField';
import { Button, Fab } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import { deleteAccountDetails, getAccountDetails, storeAccountDetails } from "../utils";
import SelectAccountType from "../components/SelectAccountType";
import { hideLoading, showLoading } from '../loading';
import { errorToast, successToast } from '../toast';
import request from '../request';
import swal from 'sweetalert';



const pageCss = css({
   '& > div': {
      borderBottom: '1px #ccc solid',
      // height: 'calc((var(--window-height) - var(--navbar-height)) / 3)',
      padding: '100px 0'
   },
})

class Home extends Component {


   constructor(...args) {

      super(...args);

      this.defaultState = {
         hasAccount: false,
         account: null,
         showSelectAccountType: false,
         balance: 0,
         accountFetched: false,
      }

      this.state = this.defaultState;
   }

   resetState() {
      return this.updateState(this.defaultState);
   }

   getAccountType = () => {

      const self = this;

      const showSelectAccountType = true;

      return new Promise((resolve, reject) => {

         const closeModal = () => {
            self.updateState({
               showSelectAccountType: false,
            });
         }

         const closeAccountTypeSelection = (cancelled=true) => {
            reject(new Error('Cancelled'));
            closeModal();
         }

         const onSelect = (account_type) => {
            resolve(account_type);
            closeModal();
         }

         const stateUpdate = {
            showSelectAccountType,
            onSelect,
            closeAccountTypeSelection,
         }

         self.updateState(stateUpdate);

      });
   }


   scanAccount = async () => {

      const codescanner = window.codescanner;
      
      if (!codescanner)
         return errorToast('Scanning feature not yet available');

      try {

         await codescanner.start();
         const code = await codescanner.scan();
         document.getElementById('txt-recipient').value = code;
         
      } catch(err) {
         errorToast(err.message);
      } finally {
         await codescanner.stop();
      }
   }

   transfer = async () => {

      const txtRecipient = document.getElementById('txt-recipient');
      const txtTokens = document.getElementById('txt-transfer-tokens');

      const recipient = txtRecipient.value;
      const tokens = txtTokens.value;

      if (!recipient) {
         errorToast('Provide the recipient account');
         return txtRecipient.focus();
      }

      if (!tokens) {
         errorToast('Provide the transfer amount');
         return txtRecipient.focus();
      }

      try {

         showLoading();
         const account = this.state.account;

         await request.post(`/api/accounts/${account}/transfer`, { recipient, tokens });
         successToast('Successfully transferred tokens');

         const balance = this.state.balance - tokens;
         await this.updateState({ balance });

      } catch (err) {
         alert(String(err));
         console.log(err, { tokens,recipient });
      } finally {
         hideLoading();
      }
   }

   withdraw = async () => {

      const txtTokens = document.getElementById('txt-withdraw-tokens');

      const tokens = txtTokens.value;

      if (!tokens) {
         errorToast('Provide the withdrawal amount');
         return txtTokens.focus();
      }

      try {

         showLoading();
         const account = this.state.account;

         await request.post(`/api/accounts/${account}/withdrawal`, { tokens });
         successToast('Withdrawal successful');

         const balance = this.state.balance - tokens;
         await this.updateState({ balance });

      } catch (err) {
         alert(String(err));
      } finally {
         hideLoading();
      }
   }


   logout = () => {
      deleteAccountDetails();
      return this.resetState();
   }

   login = async () => {

      const txtPrivateKey = document.getElementById('txt-private-key');
      const private_key = txtPrivateKey.value;

      if (!private_key) {
         errorToast('Enter private key');
         return txtPrivateKey.focus();
      }

      try {
         
         showLoading();

         const res = await request.post('/api/login', { private_key });
         const { balance, account_type, account } = res.data;

         storeAccountDetails({
            account,
            private_key
         });

         await this.setState({
            balance,
            account_type,
            account,
            accountFetched: true,
            hasAccount: true,
         })
      } catch (err) {
         alert(String(err));
      } finally {
         hideLoading();
      }
   }

   createAccount = async () => {

      let account_type;

      try {
         account_type = await this.getAccountType();
      } catch {}


      try {

         showLoading();

         const res = await request.post('/api/accounts', { account_type });
         const data = res.data;
         storeAccountDetails(data);

         await this.updateState({
            hasAccount: true,
            account: data.account,
            balance: 0,
            account_type,
            accountFetched: true
         });

         swal('Keep Your Private Key', `Keep the private key below in a secure place. That's your password to your account. You can't recover it if you lose it: \n\n ${data.private_key}`)

      } catch (err) {
         alert(String(err));
      } finally {
         hideLoading();
      }

      
      
   }


   fetchAccountDetails = async () => {
      
      try {

         showLoading();

         const res = await request.get(`/api/accounts/${this.state.account}`);
         const { account_type, balance } = res.data;

         await this.updateState({ account_type, balance, accountFetched: true });

      } catch (err) {
         alert(String(err));

         if (err.status === 404) {
            return this.logout();
         }

         await this.updateState({ accountFetched: false });
      } finally {
         hideLoading();
      }
   }

   async updateState(updates) {
      const newState = { ...this.state, ...updates };
      await this.setState(newState);
   }

   async componentDidMount() {

      // check if account exists
      const accountDetails = getAccountDetails();
      const hasAccount = !!accountDetails;
      const account = hasAccount ? accountDetails.account : null;
      await this.updateState({ hasAccount, account });

      if (hasAccount) {
         this.fetchAccountDetails();
      }

   }

   render() {

      let jsx;

      if (!this.state.hasAccount) {
         jsx = <div className="fill-container vh-align">
            <div style={{ width: 200, border: 'solid 1px #ccc', padding: 20 }}>

               <span style={{ display: 'block', color: 'gray', fontSize: 30, padding: 10 }}>
                  LOGIN
               </span>


               <TextField
                  fullWidth
                  id="txt-private-key"
                  variant="standard"
                  label="Private key"
                  style={{ marginBottom: 20 }}
               />
               
               <Button fullWidth variant="contained" onClick={this.login}>
                  LOGIN
               </Button>

               <Button fullWidth variant="text" onClick={this.createAccount}>
                  CREATE ACCOUNT
               </Button>

               <SelectAccountType
                  open={this.state.showSelectAccountType}
                  close={this.state.closeAccountTypeSelection}
                  onSelect={this.state.onSelect}
               />

            </div>
         </div>
      } else {

         if (this.state.accountFetched) {

            let withdrawJSX;

            if (this.state.account_type === 'company') {
               withdrawJSX = <div className="vh-align">

                  <div className="center-align" style={{ width: 200 }}>


                     <h2 className="grey-text">Withdraw your money</h2>

                     <TextField
                        variant="standard"
                        placeholder="Tokens"
                        id="txt-withdraw-tokens"
                        size="small"
                        fullWidth
                     />

                     <Button
                        fullWidth
                        variant="contained"
                        style={{
                           marginTop: 10
                        }}
                        onClick={this.withdraw}
                     >
                        WITHDRAW
                     </Button>

                  </div>
               </div>
            }

            jsx = <div className={pageCss}>
               <div className="vh-align" style={{ fontFamily: 'sans-serif' }}>
                  <div className="center-align">

                     <h2 className="grey-text">Your Balance</h2>

                     <div style={{ fontWeight: 'bold', fontSize: 24 }}>
                        {this.state.balance}
                     </div>
                     <div style={{ fontSize: 14, color: 'grey' }}>
                        TOKENS
                     </div>

                     <Button onClick={this.fetchAccountDetails} size="large">
                        <RefreshIcon fontSize="large" />
                     </Button>
                  </div>
               </div>

               <div className="vh-align">
                  <div style={{ maxWidth: 250 }} className="center-align">

                     <h2 style={{ color: 'gray' }}>Your Account Number</h2>

                     
                     <QRCode 
                        value={this.state.account || ''}
                        size={150}
                     />

                     <h5 style={{ color: 'grey', fontSize: 10 }}>
                        <code>
                           {this.state.account}
                        </code>
                     </h5>
                     
                  </div>
               </div>

               <div className="vh-align">

                  <div style={{ width: 200 }}>

                     <h2 className="center-align grey-text">Transfer Tokens</h2>

                     <TextField
                        placeholder="RECIPIENT ACCOUNT"
                        id="txt-recipient"
                        fullWidth
                        variant="standard"
                        size="small"
                     />

                     <TextField
                        placeholder="TOKENS"
                        id="txt-transfer-tokens"
                        fullWidth
                        variant="standard"
                        type="number"
                        size="small"
                        style={{
                           marginTop: 20
                        }}
                     />

                     <Button variant="text" fullWidth style={{ fontSize: 13 }} onClick={this.scanAccount}>
                        SCAN INSTEAD
                     </Button>

                     <Button variant="contained" fullWidth style={{ marginTop: 10 }} onClick={this.transfer}>
                        TRANSFER TOKENS
                     </Button>

                  </div>
               </div>

               {withdrawJSX}

               <Fab
                  color="secondary"
                  style={{
                     position: 'fixed',
                     bottom: 30,
                     right: 30
                  }}
                  onClick={this.logout}
               >
                  <LockIcon />
               </Fab>
            </div>
         } else {
            jsx = <div className="fill-container vh-align">
               <div className="info">
                  <span>Something went wrong</span>
                  <br />
                  
                  <Button onClick={this.fetchAccountDetails}>
                     RETRY
                  </Button>
               </div>
            </div>
         }
      }

      return <div className="page">
         {jsx}
      </div>;
   }
}


export default Home;