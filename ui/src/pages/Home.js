
import Component from "@xavisoft/react-component";
import { deleteAccountDetails, getAccountDetails } from "../utils";
import { hideLoading, showLoading } from '../loading';
import request from '../request';
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import { Fab } from "@mui/material";
import Lock from '@mui/icons-material/Lock'
import ShowPrivateKey from "../components/ShowPrivateKey";



class Home extends Component {


   constructor(...args) {

      super(...args);

      this.defaultState = {
         hasAccount: false,
         account: null,
         balance: 0,
         accountFetched: false,
         privateKey: null,
      }

      this.state = this.defaultState;
   }

   resetState() {
      return this.updateState(this.defaultState);
   }


   logout = () => {
      deleteAccountDetails();
      return this.resetState();
   }

   fetchAccountDetails = async () => {

      
      try {

         showLoading();

         let account = this.state.account;

         if (!account) {
            const details = getAccountDetails();
            account = details.account
         }

         const res = await request.get(`/api/accounts/${account}`);
         const { account_type, balance, id, fuel_price } = res.data;
         await this.updateState({ account_type, balance, accountFetched: true, id, fuel_price, account });

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

   updateState = (updates) => {
      return super.updateState(updates);
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
         jsx = <Login 
            updateParentState={this.updateState} 
            refresh={this.fetchAccountDetails} 
         />
      } else {

         jsx = <>
            <Dashboard
               data={this.state}
               refresh={this.fetchAccountDetails}
               updateParentState={this.updateState}
            />

            <ShowPrivateKey
               privateKey={this.state.privateKey}
               updateParentState={this.updateState}
            />

            <Fab
               color="secondary"
               style={{
                  position: 'fixed',
                  bottom: 15,
                  right: 15
               }}
               onClick={this.logout}
            >
               <Lock />
            </Fab>
         </>
      }

      return <div className="page">
         {jsx}
      </div>;
   }
}


export default Home;