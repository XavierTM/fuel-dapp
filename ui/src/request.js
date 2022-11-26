
import axios from 'axios';
import { getAccountDetails } from './utils';

axios.interceptors.request.use(config => {
   
   const details = getAccountDetails();
   config.headers['x-private-key'] = details.private_key;

   return config;
});

const request = axios;

export default request;