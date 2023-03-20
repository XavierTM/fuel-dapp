import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Component from "@xavisoft/react-component";
import swal from "sweetalert";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import { errorToast, successToast } from "../toast";


export default class BuyTokens extends Component {

   initiatePaymnt = async () => {
      const txtTokens = document.getElementById('txt-tokens');
      const txtPhone = document.getElementById('txt-phone');

      const tokens = txtTokens.value;
      const phone = txtPhone.value;

      if (!tokens) {
         errorToast('Provide the number of tokens you want to buy');
         return txtTokens.focus();
      }

      if (!phone) {
         errorToast('Provide the Ecocash number you want to pay with');
         return txtPhone.focus();
      }

      try {

         showLoading();

         await request.post('/api/payments', { tokens, phone });
         successToast('Check your phone for a PIN prompt');

         this.props.close();

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }

   }

   render() {

      return <Dialog open={this.props.open}>

         <DialogTitle>UPDATE FUEL PRICE</DialogTitle>

         <DialogContent>
            <TextField
               id="txt-tokens"
               label="Tokens"
               type="number"
               fullWidth
               variant="standard"
               size="small"
            />
            <TextField
               id="txt-phone"
               label="Ecocash phone number"
               type="number"
               fullWidth
               variant="standard"
               size="small"
               style={{
                  marginTop: 20,
               }}
            />
         </DialogContent>

         <DialogActions>
            <Button variant="contained" onClick={this.initiatePaymnt}>
               INITIATE PAYMENT
            </Button>
            <Button onClick={this.props.close}>
               CANCEL
            </Button>
         </DialogActions>
      </Dialog>
   }
}