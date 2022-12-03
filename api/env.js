

[
   'TOKEN_CONTRACT_ADDRESS',
   'MAIN_ACCOUNT',
   'MAIN_ACCOUNT_PRIVATE_KEY',
   'WEB3_URL',
   'PORT'
].forEach(key => {

   if (!process.env[key]) {
      throw new Error(`Environment variable '${key}' is essential`);
   }
});
