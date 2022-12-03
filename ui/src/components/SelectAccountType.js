import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { Component } from "react";



class SelectAccountType extends Component {


	select = () => {
		const accountType = this.state.value;
		console.log(`Sending back '${accountType}'`)
		this.props.onSelect(accountType);
	}

	onChange = (_, value) => {
		this.setState({ value })
	}


	state = {
		value: 'customer'
	}


	componentDidUpdate(prevProps) {
		
		if (this.props.open && !prevProps.open) {
			this.setState({ value: 'customer' })
		}

	}

	render() {

		return <Dialog open={this.props.open}>

			<DialogTitle>Select account type</DialogTitle>

			<DialogContent>
				<RadioGroup id="sel-account-type"  value={this.state.value} onChange={this.onChange}>

					<FormControlLabel
						control={<Radio />}
						label="Company"
						value="company"
					/>

					<FormControlLabel
						control={<Radio />}
						label="Customer"
						value="customer"
					/>
					
				</RadioGroup>
			</DialogContent>

			<DialogActions>
				<Button variant="contained" onClick={this.select}>
					Select
				</Button>
				<Button onClick={this.props.close}>
					CANCEL
				</Button>
			</DialogActions>
		</Dialog>
	}
}

export default SelectAccountType;