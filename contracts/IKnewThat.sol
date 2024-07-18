//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract IKnewThat {

    struct Claim {
        uint id;
        address claimant;
        uint publishTime;
        uint revealTime;
        string dataLoc;
    }

    mapping(bytes32 => Claim) public claims;
    uint claimCounter;

    constructor() {

    }

    function commit(bytes32 commitment)
        external
    {
        Claim storage claim = claims[commitment];
        // check this commitment does not exist
        require(claim.claimant == address(0), "Claim already exists");
        claim.id = claimCounter++;
        claim.claimant = msg.sender;
        claim.publishTime = block.timestamp;
    }

    function reveal(bytes32 commitment, string memory dataLoc)
        external
    {
        Claim storage claim = claims[commitment];
        // check this commitment exists
        require(claim.claimant != address(0), "Caller is not claimant");
        require(commitment == keccak256(abi.encodePacked(dataLoc)), "Hash does not match commitment");
        claim.revealTime = block.timestamp;
        claim.dataLoc = dataLoc;
    }

    function getClaim(bytes32 commitment) external view returns (Claim memory) {
        return claims[commitment];
    }
}