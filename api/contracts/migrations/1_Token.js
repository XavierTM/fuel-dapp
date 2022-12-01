// Help Truffle find `Token.sol` in the `/contracts` directory
const Token = artifacts.require("Token");

module.exports = async function(deployer) {
  // Command Truffle to deploy the Smart Contract
  const res = await deployer.deploy(Token, "XAVITOKEN", "XVT", 0, 2000000);

  console.log(res);
  
};