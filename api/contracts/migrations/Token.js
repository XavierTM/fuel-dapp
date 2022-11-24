// Help Truffle find `Token.sol` in the `/contracts` directory
const Token = artifacts.require("Token");

module.exports = function(deployer) {
  // Command Truffle to deploy the Smart Contract
  deployer.deploy(Token, "XAVITOKEN", "XVT", 0, 2000000);
};