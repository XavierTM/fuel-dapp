
import { Button, TextField } from '@mui/material';
import Component from '@xavisoft/react-component';
import SelectAccountType from './SelectAccountType';
import { showLoading, hideLoading } from '../loading';
import { errorToast } from '../toast';
import request from '../request';
import { storeAccountDetails } from '../utils';


export default class Login extends Component {

   state = {
      showSelectAccountType: false,
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
         const { account } = res.data;

         storeAccountDetails({
            account,
            private_key
         });


         await this.props.updateParentState({ hasAccount: true });
         this.props.refresh();

      } catch (err) {
         alert(String(err));
      } finally {
         hideLoading();
      }
   }

   getAccountType = () => {

      const self = this;

      return new Promise((resolve, reject) => {

         const closeModal = () => {
            self.updateState({
               showSelectAccountType: false,
            });
         }

         const closeAccountTypeSelection = () => {
            reject(new Error('Cancelled'));
            closeModal();
         }

         const onSelect = (account_type) => {
            resolve(account_type);
            closeModal();
         }

         const showSelectAccountType = true;

         const stateUpdate = {
            showSelectAccountType,
            onSelect,
            closeAccountTypeSelection,
         }

         self.updateState(stateUpdate);

      });
   }

   createAccount = async () => {

      let account_type;

      try {
         account_type = await this.getAccountType();
      } catch {
         return;
      }


      try {

         showLoading();

         const res = await request.post('/api/accounts', { account_type });
         const data = res.data;
         storeAccountDetails(data);

         await this.props.updateParentState({ hasAccount: true, privateKey: res.data.private_key });
         this.props.refresh();

      } catch (err) {
         alert(String(err));
      } finally {
         hideLoading();
      }
      
   }

   render() {
      return <div className="fill-container vh-align">
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
   }
} 