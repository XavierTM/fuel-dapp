import { Component } from "react";
import AppBar from '@mui/material/AppBar';


class Navbar extends Component {

   setNavbarDimensions = () => {
      const navbar = document.getElementById('navbar');
      const height = navbar.offsetHeight + 'px';
      const width = navbar.offsetWidth + 'px';

      document.documentElement.style.setProperty('--navbar-height', height);
      document.documentElement.style.setProperty('--navbar-width', width);
   }

   componentWillUnmount() {
      this._resizeObserver.disconnect();
   }

   componentDidMount() {
      const resizeObserver = new window.ResizeObserver(this.setNavbarDimensions);
      resizeObserver.observe(document.getElementById('navbar'));
      this._resizeObserver = resizeObserver;

      this.setNavbarDimensions();
   }


   render() {
      return <AppBar id="navbar">
         <h3 style={{ color: 'white', paddingLeft: 20 }}>FUEL-DAPPP</h3>
      </AppBar>
   }
}

export default Navbar;