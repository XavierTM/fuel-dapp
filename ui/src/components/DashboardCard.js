import { Grid } from "@mui/material";


export default function DashboardCard(props) {

   return <Grid item xs={6}>
      
         <div style={{ margin: 2, background: '#efefef', padding: 20, height: 'calc(100% - 4px)', boxSizing: 'border-box' }} onMouseUp={props.action} className="center-align">
            <props.icon style={{ fontSize: 50, color: 'grey' }} />

            <div>
               <h4>{props.caption}</h4>
            </div>
         </div>
   </Grid>
}