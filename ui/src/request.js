
import axios from 'axios';
import { getAccountDetails } from './utils';


if (process.env.NODE_ENV === 'production') {
   axios.interceptors.request.use(config => {
      config.url = 'https://fuel-dapp.xavisoft.co.zw' + config.url;
      return config;
   });
}

axios.interceptors.request.use(config => {
   
   const details = getAccountDetails();

   if (details)
      config.headers['x-private-key'] = details.private_key;

   return config;
});

const request = axios;

export default request;