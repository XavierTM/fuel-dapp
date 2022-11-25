// Help Truffle find `Storage.sol` in the `/contracts` directory
const Storage = artifacts.require("Storage");

module.exports = async function(deployer) {
  // Command Truffle to deploy the Smart Contract
  const res = await deployer.deploy(Storage, "XAVITOKEN", "XVT", 0, 2000000);

  console.log(res);
  
};