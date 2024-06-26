const { expect } = require("chai");

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("IKnewThat contract", function () {

    async function deployFixture() {
        // Get the ContractFactory and Signers here.
        const _iKnewThat = await ethers.getContractFactory("IKnewThat");
        const [owner, addr1, addr2] = await ethers.getSigners();
    
        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens onces its transaction has been
        // mined.
        const iKnewThat = await _iKnewThat.deploy();
    
        await iKnewThat.deployed();
    
        // Fixtures can return anything you consider useful for your tests
        return { iKnewThat, owner, addr1, addr2 };
    }

    it("Should allow commitments", async function () {
        const { iKnewThat, owner } = await loadFixture(deployFixture);

        const hash = ethers.constants.HashZero;
        await iKnewThat.commit(hash);

        let claim = await iKnewThat.getClaim(hash) 
        expect(claim.claimant).to.equal(owner.address);
    });

    it("Should disallow overwriting commitments", async function() {
        const { iKnewThat, _, other } = await loadFixture(deployFixture);

        const hash = ethers.constants.HashZero;
        await iKnewThat.commit(hash);

        // repeated claims don't work
        expect(iKnewThat.commit(hash)).to.be.revertedWith("Claim already exists");
        expect(iKnewThat.connect(other).commit(hash)).to.be.revertedWith("Claim already exists");
    });

    it("Should allow valid reveal", async function() {
        const { iKnewThat, owner } = await loadFixture(deployFixture);

        const dataLoc = "/path/to/data";
        const nonce = 42;

        const hash = ethers.utils.solidityKeccak256(["string", "uint"], [dataLoc, nonce]);
        await iKnewThat.commit(hash);
        await iKnewThat.reveal(hash, dataLoc, nonce);

        let claim = await iKnewThat.getClaim(hash);
        expect(claim.claimant).to.equal(owner.address);
        expect(claim.dataLoc).to.equal(dataLoc);
        expect(claim.nonce).to.equal(nonce);
    });

    it("Should disallow reveal invalid hash", async function() {
        const { iKnewThat } = await loadFixture(deployFixture);

        const dataLoc = "/path/to/data";
        const nonce = 42;

        const hash = ethers.utils.solidityKeccak256(["string", "uint"], [dataLoc, nonce]);
        await iKnewThat.commit(hash);
        expect(iKnewThat.reveal(hash, dataLoc, 0)).to.be.revertedWith("Hash does not match commitment");
        expect(iKnewThat.reveal(hash, "/path/to/other/data", nonce)).to.be.revertedWith("Hash does not match commitment");
    });

    it("Should disallow reveal by non-claimant", async function() {
        const { iKnewThat, _, other } = await loadFixture(deployFixture);

        const dataLoc = "/path/to/data";
        const nonce = 42;

        const hash = ethers.utils.solidityKeccak256(["string", "uint"], [dataLoc, nonce]);
        await iKnewThat.commit(hash);
        expect(iKnewThat.connect(other).reveal(hash, dataLoc, nonce)).to.be.revertedWith("Caller is not claimant");
    });

});