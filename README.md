# Force Attack

Smart Contract Security Practice | Lv7 Force Attack

```
!!! DON'T TRY ON MAINNET !!!
```

## Summary
The goal of this level is to make the balance of the contract greater than zero.

#### This might help:
- Fallback methods - we saw on these levels: [Fallback Attack](https://github.com/felix0888/fallback-attack), [Delegation Attack](https://github.com/fexli0888/delegation-attack)
- How can a contract receive ether?
- Sometimes the best way to attack a contract is with another contract.

#### What you will learn:
- Self-destruct
- Ways to send ethers to a contract

## Smart Contract Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Force {/*

                   MEOW ?
         /\_/\   /
    ____/ o o \
  /~____  =ø= /
 (______)__m_m)

*/}
```

## Solidity Concepts
- Ways to receive ether in the smart contract
We already know that `receive` and `fallback` function can be used to receive ether in the smart contract.
It is impossible to forcibly send Ether to a contract without its fallback function. This is an important consideration when placing important logic in the fallback function or making calculation based on a contract's balance.

- The other ways to receive ether is using `selfdestruct` of the other contract and the contract being a recipient of a coinbase transaction(AKA miner block reward).

- `selfdestruct(address payable recipent)`
Contracts can be deleted from the blockchain by calling `selfdestruct`. It destroies the current contract, sending its funds to the given Address and end execution.

## Security Risk
The `Force` contract doesn't have any fallback function(`receive` or `fallback`), but we can create and deploy another contract and then destruct it with `Force` contract address as receipent parameter.
By selfdestructing a contract, it is possible to send ether(on the contract) to another contract even if it don't have any payable function.

### Dangerous Voids
`selfdestruct` leaves voids where contracts used to be. It’s not unreasonable to imagine that users may proceed on the assumption that a contract exists at an address that was known to be valid in the past, naively thinking it is immutable. Think _bookmarks_. Think about UIs that lead users down well-marked trails that worked, at one time. Surprise is an anti-feature, more so if it is costly.
After `selfdestruct()`, there is no code there. There is no accounting, and there are no functions to retrieve any ETH or tokens that arrive. With no possibility of retrieval, any funds sent to voided contracts are marooned — approximately the same as destroyed. Funds and assets go in but they don’t come out.
Finally user might lose their funds.

### Pausable over destruct
`selfdestruct` usually involves some sort of privileged authority to sign a transaction that causes the destruction of the contract. In practice, something like:
```solidity
function kill() public onlyOwner {
  selfdestruct(msg.sender);
}
```

The need for access control is self-evident, but access control doesn’t alter the implications of using it.

> A privileged user can irreversibly stop everything, destroy the contract and seize the funds.

That statement contains anti-features:
- irreversibly — There is no way to reverse course and resume normal processing. It’s so drastic, one might hesitate to use it even in an emergency.
- destroy the contract — A destroyed contract lacks the logic that would reject unwanted incoming funds or enable retrieval of funds. These voids can have unexpected effects on other contracts that call non-existent functions.
- seize ETH — The privileged user reserves for themselves the privilege of seizing funds. That is extraordinary decision-making power.

**Favor Pausable over selfdestruct**

The Pausable pattern enables more precision:
- stop everything that should be stopped.
- allow everything that should be allowed during a maintenance/emergency outage.

Following situation assessment, the privileged user can:
- renounce the possibility of restarting the contract.
- resume normal processing.

**?!** And what if the contract contains tokens? At the very least, it will be necessary to rescue those before destroying the bytecode because once the bytecode is destroyed there is probably no possibility of recovering them.

Please refer [Pausable from Openzeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol).

**How to implement Pausable**

For each state-changing function, assign one of two modifiers:
```solidity
function doSomething() public whenNotPaused { ... // normal mode
function doSomethingOdd() public whenPaused { // emergency measures
```

Doing so should prompt some thought about the desired emergency management regime. If one wanted to, one could approximate selfdestruct style seizure of funds and clearly spell out the extent of the privilege:
```solidity
function exitScam(address payable beneficiary) public whenPaused onlyOwner {
  beneficiary.transfer(address(this).balance);
}
```
That translates to, roughly — “In an emergency stop situation, the owner is allowed to seize all funds.” It’s similar to selfdestruct, with fewer anti-features. It’s also explicit about the special privilege.

### What we can say?
Most emergency management regimes should not include seizing the funds because incentives to abuse authority are an anti-feature. When you see selfdestruct() in a production contract, it’s a strong signal of extraordinary decision-making power that calls for extraordinary justification.

## Deploy & Test
### Installation
```console
npm install
npx hardhat node
```

### Deployment
```console
npx hardhat run --network [NETWORK-NAME] scripts/deploy.js
```

### Test
You should see Ether balance of the `Force` contract is increased.
```console
dev@ubuntu:~/Documents/practice/force-attack$ npx hardhat test
Compiling 1 file with 0.8.4
Solidity compilation finished successfully


  ForceAttack
    deployment
      ✓ should set the attacker
    #attack
      ✓ should be reverted if non-attacker tries (41ms)
      ✓ should transfer ETH to Force contract (53ms)


  3 passing (962ms)
```

If you're familiar with hardhat console, you can test the `Force` on your local node by using `npx hardhat node` and `npx hardhat console`.
