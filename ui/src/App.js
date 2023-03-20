
import './App.css';
import { Component } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';


class App extends Component {

  setWindowDimensions = () => {
    
    const height = window.innerHeight + 'px';
    const width = window.innerWidth + 'px';

    document.documentElement.style.setProperty('--window-height', height);
    document.documentElement.style.setProperty('--window-width', width);

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setWindowDimensions);
  }

  componentDidMount() {
    window.addEventListener('resize', this.setWindowDimensions)
    this.setWindowDimensions();
  }

  render() {
    return (
      <>
        <Navbar />

        <Home />
      </>
    );
  }

}

export default App;
