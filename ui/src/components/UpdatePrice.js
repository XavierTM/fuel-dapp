import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Component from "@xavisoft/react-component";
import swal from "sweetalert";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import { errorToast, successToast } from "../toast";
import { delay } from "../utils";


export default class UpdatePrice extends Component {

   close = () => {
      this.props.close();
   }

   updatePrice = async () => {

      const txtFuelPrice = document.getElementById('txt-fuel-price');
      const fuel_price = txtFuelPrice.value;

      if (!fuel_price) {
         errorToast('Provide fuel price');
         return txtFuelPrice.focus();
      }

      try {
         showLoading();

         await request.put('/api/system/fuel-price', { fuel_price });
         this.props.close(fuel_price);

         successToast('Price updated');

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }

   }

   async componentDidUpdate(prevProps) {

      if (this.props.open && !prevProps.open) {
        await delay(100);
        document.getElementById('txt-fuel-price').value = this.props.fuel_price 
      }
   }

   render() {
      return <Dialog open={this.props.open}>

         <DialogTitle>UPDATE FUEL PRICE</DialogTitle>

         <DialogContent>
            <TextField
               id="txt-fuel-price"
               label="Fuel Price"
               type="number"
               fullWidth
               variant="standard"
               size="small"
               InputLabelProps={{
                  shrink: true
               }}
            />
         </DialogContent>

         <DialogActions>
            <Button variant="contained" onClick={this.updatePrice}>
               UPDATE
            </Button>
            <Button onClick={this.close}>
               CANCEL
            </Button>
         </DialogActions>
      </Dialog>
   }
}