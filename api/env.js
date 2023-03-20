


function presenceChecker(keys=[]) {
   keys.forEach(key => {

      if (!process.env[key]) {
         throw new Error(`Environment variable '${key}' is essential`);
      }
   });
}

const BASE_KEYS = [
   'TOKEN_CONTRACT_ADDRESS',
   'MAIN_ACCOUNT',
   'MAIN_ACCOUNT_PRIVATE_KEY',
   'WEB3_URL',
   'PORT',
   'NODE_ENV',
   'PAYNOW_ID',
   'PAYNOW_SECRET',
   'SYSTEM_URL',
];


presenceChecker(BASE_KEYS);

const CONDITIONAL_KEYS = [];

if (process.env.production === 'development') {
   CONDITIONAL_KEYS.push('GANACHE_HOST', 'GANACHE_PORT');
}

presenceChecker(CONDITIONAL_KEYS);
