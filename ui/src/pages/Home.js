import { css } from "@emotion/css";
import { Component } from "react";
import QRCode from 'react-qr-code';
import TextField from '@mui/material/TextField';
import { Button } from "@mui/material";



const pageCss = css({
   '& > div': {
      borderBottom: '1px #ccc solid',
      height: 'calc((var(--window-height) - var(--navbar-height)) / 3)',
   },
})

class Home extends Component {

   render() {
      return <div className="page">
         <div className={pageCss}>
            <div className="vh-align" style={{ fontFamily: 'sans-serif' }}>
               <div className="center-align">

                  <h2>Your Balance</h2>

                  <div style={{ fontWeight: 'bold', fontSize: 24 }}>
                     200
                  </div>
                  <div style={{ fontSize: 14, color: 'grey' }}>
                     TOKENS
                  </div>
               </div>
            </div>

            <div className="vh-align">
               <div style={{ width: '60%'}} className="center-align">

                  <h2 style={{ color: 'gray' }}>Your Account Number</h2>

                  
                  <QRCode 
                     value="xavier"
                     size={150}
                  />

                  <h5 style={{ color: 'grey' }}>
                     <code>
                        0x123456789098765432112345
                     </code>
                  </h5>
                  
               </div>
            </div>

            <div className="vh-align">

               <div style={{ width: 300 }} className>

                  <h2 className="center-align">Transfer Tokens</h2>

                  <TextField
                     placeholder="TOKENS"
                     id="txt-transfer-tokens"
                     fullWidth
                     variant="standard"
                     size="small"
                  />

                  <TextField
                     placeholder="ACCOUNT NUMBER"
                     id="txt-transfer-tokens"
                     fullWidth
                     variant="standard"
                     size="small"
                     style={{
                        marginTop: 20
                     }}
                  />

                  <Button variant="text" fullWidth style={{ fontSize: 13 }}>
                     SCAN INSTEAD
                  </Button>

                  <Button variant="contained" fullWidth style={{ marginTop: 10 }}>
                     TRANSFER TOKENS
                  </Button>

               </div>
            </div>

            <div className="vh-align">

               <div className="center-align" style={{ width: 300 }}>


                  <h2>Withdraw your money</h2>

                  <TextField
                     variant="standard"
                     placeholder="Tokens"
                     id="txt-withdraw-icons"
                     size="small"
                     fullWidth
                  />

                  <Button
                     fullWidth
                     variant="contained"
                     style={{
                        marginTop: 10
                     }}
                  >
                     WITHDRAW
                  </Button>

               </div>
            </div>
         </div>
      </div>
   }
}


export default Home;