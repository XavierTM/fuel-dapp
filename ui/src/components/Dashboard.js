
import Refresh from "@mui/icons-material/Refresh";
import { Button, Divider, Grid } from "@mui/material";
import Component from "@xavisoft/react-component";
import QRCode from "react-qr-code";
import DashboardCard from './DashboardCard';
import SetPriceIcon from '@mui/icons-material/PriceChange';
import TransferTokensIcon from '@mui/icons-material/Share';
import BuyTokensIcon from '@mui/icons-material/ShoppingCart';
import WithdrawIcon from '@mui/icons-material/AttachMoney';
import TransferTokens from "./TransferTokens";
import WithdrawMoney from "./WithdrawMoney";
import { formatPrice } from "../utils";
import UpdatePrice from "./UpdatePrice";
import BuyTokens from "./BuyTokens";
import CopyIcon from '@mui/icons-material/ContentCopy';
import { successToast } from "../toast";


export default class Dashboard extends Component {


   state = {
      transferTokensModalOpen: false,
      withdrawalModalOpen: false,
      updatePriceModalOpen: false,
      buyTokensModalOpen: false,
   }

   openBuyTokensModal = () => {
      return this.updateState({ buyTokensModalOpen: true });
   }

   closeBuyTokensModal = () => {
      return this.updateState({ buyTokensModalOpen: false });
   }

   openUpdatePriceModal = () => {
      return this.updateState({ updatePriceModalOpen: true });
   }

   closeUpdatePriceModal = async (fuel_price) => {

      if (fuel_price) {
         await this.props.updateParentState({ fuel_price });
      }

      await this.updateState({ updatePriceModalOpen: false });
   }

   openTransferTokensModal = () => {
      return this.updateState({ transferTokensModalOpen: true });
   }

   closeTransferTokenModal = async (transferedTokens) => {

      if (transferedTokens) {
         const balance = this.props.data.balance - transferedTokens;
         await this.props.updateParentState({ balance });
      }

      await this.updateState({ transferTokensModalOpen: false });
   }

   openWithdrawalModal = () => {
      return this.updateState({ withdrawalModalOpen: true });
   }

   closeWithdrawalModal = async (widthrawnTokens) => {

      if (widthrawnTokens) {
         const balance = this.props.data.balance - widthrawnTokens;
         await this.props.updateParentState({ balance });
      }

      await this.updateState({ withdrawalModalOpen: false });
   }

   copyAccountNumber = async () => {
      await navigator.clipboard.writeText(this.props.data.account);
      successToast('Copied to clipboard')
   }

   render() {

      let jsx;

      if (this.props.data.accountFetched) {

         const units = this.props.data.account_type === 'company' ? 'TOKENS' : 'LITRES';

         // select cards to show based on account ttype
         let dashboardCards = [];

         const setPriceCard = { caption: 'SET PRICE', icon: SetPriceIcon, action: this.openUpdatePriceModal };
         const transferTokensCard = { caption: 'TRANSFER TOKENS', icon: TransferTokensIcon, action: this.openTransferTokensModal };
         const buyTokensCard = { caption: 'BUY TOKENS', icon: BuyTokensIcon, action: this.openBuyTokensModal };
         const withdrawCard = { caption: 'WITHDRAW', icon: WithdrawIcon, action: this.openWithdrawalModal  }

         if (this.props.data.account_type === 'admin')
            dashboardCards = [ setPriceCard, transferTokensCard ];
         else if (this.props.data.account_type === 'company')
            dashboardCards = [ transferTokensCard, buyTokensCard, withdrawCard ];
         else
            dashboardCards = [ transferTokensCard, buyTokensCard ];

         let dividerJSX;

         if (dashboardCards.length % 2 === 1) {
            dividerJSX = <Grid item xs={12} style={{ margin: -2 }}>
               <Divider />
            </Grid>
         }
         

         jsx = <>

            <Grid container>
               <Grid item xs={12}>
                  <div>
                     <div className="center-align" style={{ padding: 20, paddingBottom: 10 }}>

                        <div style={{ fontWeight: 'bold', fontSize: 30 }}>
                           {this.props.data.balance}
                        </div>
                        <div style={{ fontSize: 14, color: 'grey' }}>
                           {units} AVAILABLE
                        </div>

                        <Button onClick={this.props.refresh} size="large">
                           <Refresh fontSize="large" />
                        </Button>
                     </div>
                  </div>
               </Grid>

               {
                  dashboardCards.map(card => <DashboardCard {...card} />)
               }

               {dividerJSX}

               <Grid item xs={12}>
                  <div>
                     <div className="center-align" style={{ padding: 20, paddingBottom: 10 }}>

                        <div style={{ fontWeight: 'bold', fontSize: 30 }}>
                           ${formatPrice(this.props.data.fuel_price)}
                        </div>
                        <div style={{ fontSize: 14, color: 'grey' }}>
                           FUEL PRICE
                        </div>

                        <Button onClick={this.props.refresh} size="large">
                           <Refresh fontSize="large" />
                        </Button>
                     </div>
                  </div>
               </Grid>

            </Grid>

            <TransferTokens
               open={this.state.transferTokensModalOpen}
               close={this.closeTransferTokenModal}
               account={this.props.data.account}
            />

            <WithdrawMoney
               open={this.state.withdrawalModalOpen}
               close={this.closeWithdrawalModal}
               account={this.props.data.account}
            />

            <UpdatePrice
               open={this.state.updatePriceModalOpen}
               close={this.closeUpdatePriceModal}
               fuel_price={this.props.data.fuel_price}
            />

            <BuyTokens
               open={this.state.buyTokensModalOpen}
               close={this.closeBuyTokensModal}
            />



           
            <div className="vh-align" style={{ backgroundColor: '#eee' }}>
               <div style={{ maxWidth: 250 }} className="center-align">

                  <h2 style={{ color: 'gray' }}>Your Account Number</h2>

                  
                  <QRCode 
                     value={this.props.data.account || ''}
                     size={150}
                  />

                  <h5 style={{ color: 'grey', fontSize: 10, margin: '10px 40px' }}>
                     <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: 'monospace' }}>
                        {this.props.data.account}
                     </div>
                     <Button onClick={this.copyAccountNumber}>
                        <CopyIcon />
                     </Button>
                  </h5>
                  
               </div>
            </div>
         </>
      } else {
         jsx = <div className="fill-container vh-align">
            <div className="info">
               <span>Something went wrong</span>
               <br />
               
               <Button onClick={this.props.refresh}>
                  RETRY
               </Button>
            </div>
         </div>
      }

      return jsx;
   }
}