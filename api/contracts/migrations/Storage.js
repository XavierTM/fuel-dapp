// Help Truffle find `Storage.sol` in the `/contracts` directory
const Storage = artifacts.require("Storage");

module.exports = async function(deployer) {
  // Command Truffle to deploy the Smart Contract
  const res = await deployer.deploy(Storage);

  console.log({ res });
  
};