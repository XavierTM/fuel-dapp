

const ACCOUNT_DETAILS_STORAGE_KEY = '5b04cc7d-4349-409e-a551-d4a4e177d576';

function getAccountDetails() {
   const json = window.localStorage.getItem(ACCOUNT_DETAILS_STORAGE_KEY);
   const details = JSON.parse(json);
   return details;
}

function storeAccountDetails(details) {
   const json = JSON.stringify(details);
   window.localStorage.setItem(ACCOUNT_DETAILS_STORAGE_KEY, json);
}

function deleteAccountDetails() {
   window.localStorage.removeItem(ACCOUNT_DETAILS_STORAGE_KEY);
}

function formatPrice(price) {
   return (parseFloat(price) || 0).toFixed(2)
}

function delay(millis) {
   return new Promise(resolve => {
      setTimeout(resolve, millis);
   });
}

export {
   delay,
   deleteAccountDetails,
   formatPrice,
   getAccountDetails,
   storeAccountDetails,
}