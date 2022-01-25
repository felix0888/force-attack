const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ForceAttack", function () {
  let owner, attacker, alice, signers;
  let Force, force, ForceAttack, forceAttack;

  beforeEach(async function() {
    [owner, attacker, alice, signers] = await ethers.getSigners();
    Force = await ethers.getContractFactory("Force");
    force = await Force.deploy();
    ForceAttack = await ethers.getContractFactory("ForceAttack");
    forceAttack = await ForceAttack.connect(attacker).deploy();
  });

  describe("deployment", function() {
    it("should set the attacker", async function() {
      expect(await forceAttack.attacker()).to.equal(attacker.address);
    });
  });

  describe("#attack", function() {
    it("should be reverted if non-attacker tries", async function() {
      await expect(
        forceAttack.connect(alice).attack(force.address)
      ).to.be.revertedWith(
        "ForceAttack: NOT_OWNER"
      );
    });

    it("should transfer ETH to Force contract", async function() {
      await alice.sendTransaction({to: forceAttack.address, value: ethers.utils.parseEther("1")});
      expect(await ethers.provider.getBalance(force.address)).to.equal(0);
      expect(await ethers.provider.getBalance(forceAttack.address)).to.equal(ethers.utils.parseEther("1"));

      await forceAttack.connect(attacker).attack(force.address);
      expect(await ethers.provider.getBalance(force.address)).to.equal(ethers.utils.parseEther("1"));
      expect(await ethers.provider.getBalance(forceAttack.address)).to.equal(0);
    });
  });
});
