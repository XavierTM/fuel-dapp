
import axios from 'axios';
import { getAccountDetails } from './utils';


class AxiosError extends Error {

   toString() {
      return this.message;
   }

   constructor(msg, status) {
      super(msg);
      this.status = status;
   }
}


const backend_url = process.env.NODE_ENV === 'production' ? 'https://fuel-dapp.xavisoft.co.zw' : 'http://localhost:8080';

axios.interceptors.request.use(config => {
   config.url = backend_url + config.url;
   return config;
});


axios.interceptors.request.use(config => {
   
   const details = getAccountDetails();

   if (details)
      config.headers['x-private-key'] = details.private_key;

   return config;
});

axios.interceptors.response.use(null, err => {


   if (err && err.response) {
      const status = err.response.status
      const msg = typeof err.response.data === 'string' ? err.response.data : err.response.statusText;
      err = new AxiosError(msg, status);

   }

   throw err
});

const request = axios;

export default request;