import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import Component from "@xavisoft/react-component";
import CopyIcon from '@mui/icons-material/ContentCopy';
import { successToast } from "../toast";
import { copyToClipboard } from "../utils";


export default class ShowPrivateKey extends Component {

   copyPrivateKey = async () => {
      await copyToClipboard(this.props.privateKey);
      successToast('Copied to clipboard');
   }

   close = () => {
      this.props.updateParentState({ privateKey: null })
   }

   render() {
      return <Dialog open={!!this.props.privateKey}>
         <DialogTitle>Your Private Key</DialogTitle>
         
         <DialogContent>
   
            <p>
               Keep the private key below in a secure place. That's your password to your account. You can't recover it if you lose it
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'calc(100% - 30px) 30px', width: '100%' }}>
               <div className="fill-container vh-align">
                  <div 
                     style={{
                        fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
                        fontSize: 11,
                        overflow: 'hidden',
                        textAlign: 'center',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                     }}
                  >
                     {this.props.privateKey}
                  </div>
               </div>

               <div>
                  <IconButton onClick={this.copyPrivateKey} color="primary">
                     <CopyIcon />
                  </IconButton>
               </div>
            </div>

         </DialogContent>

         <DialogActions>
            <Button onClick={this.close}>
               CLOSE
            </Button>
         </DialogActions>
      </Dialog>
   }
}