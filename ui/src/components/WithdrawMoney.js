import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Component from "@xavisoft/react-component";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import { errorToast, successToast } from "../toast";


export default class WithdrawMoney extends Component {

   withdraw = async () => {

      const txtTokens = document.getElementById('txt-withdraw-tokens');

      const tokens = txtTokens.value;

      if (!tokens) {
         errorToast('Provide the withdrawal amount');
         return txtTokens.focus();
      }

      try {

         showLoading();
         const account = this.props.account;

         await request.post(`/api/accounts/${account}/withdrawal`, { tokens });
         successToast('Withdrawal successful');

         await this.props.close(tokens);

      } catch (err) {
         alert(String(err));
      } finally {
         hideLoading();
      }
   }

   close = () => {
      this.props.close();
   }

   render() {
      return <Dialog open={this.props.open}>
         <DialogTitle>TRANSFER TOKENS</DialogTitle>

         <DialogContent>
         
            <TextField
               variant="standard"
               placeholder="Tokens"
               id="txt-withdraw-tokens"
               size="small"
               fullWidth
            />

         </DialogContent>

         <DialogActions>
            <Button variant="contained" onClick={this.withdraw} >
               WITHDRAW
            </Button>

            <Button onClick={this.close}>
               CANCEL
            </Button>
         </DialogActions>
      </Dialog>
   }
}