const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account: ", deployer.address
  );

  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const Force = await ethers.getContractFactory("Force");
  const force = await Force.deploy();
  console.log("Force address: ", await force.address);
  console.log("Account balance after Force deploy: ", (await deployer.getBalance()).toString());

  const ForceAttack = await ethers.getContractFactory("ForceAttack");
  const forceAttack = await ForceAttack.deploy();
  console.log("ForceAttack address: ", await forceAttack.address);
  console.log("Account balance after ForceAttack deploy: ", (await deployer.getBalance()).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
