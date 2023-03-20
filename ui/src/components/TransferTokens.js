import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Component from "@xavisoft/react-component";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import { errorToast, successToast } from "../toast";


export default class TransferTokens extends Component {

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
         const account = this.props.account;

         await request.post(`/api/accounts/${account}/transfer`, { recipient, tokens });
         successToast('Successfully transferred tokens');

         txtRecipient.value = '';
         txtTokens.value = '';

         await this.props.close(tokens);

      } catch (err) {
         alert(String(err));
         console.log(err, { tokens,recipient });
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

         </DialogContent>

         <DialogActions>
            <Button variant="contained" onClick={this.transfer} >
               TRANSFER
            </Button>

            <Button onClick={this.close}>
               CANCEL
            </Button>
         </DialogActions>
      </Dialog>
   }
}