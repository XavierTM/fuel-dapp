// Help Truffle find `ZimFuelToken.sol` in the `/contracts` directory
const ZimFuelToken = artifacts.require("ZimFuelToken");

module.exports = function(deployer) {
  // Command Truffle to deploy the Smart Contract
  // deployer.deploy(ZimFuelToken, "ZIMFUELTOKEN", "ZFT", 0, 2000000);
  deployer.deploy(ZimFuelToken, "ANOTHERRANDOMFUELTOKEN", "XXX", 0, 2000000);
};