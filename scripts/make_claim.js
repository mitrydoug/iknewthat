// task action function receives the Hardhat Runtime Environment as second argument
(async() => {
    const contractAddress = require("../frontend/src/contracts/contract-address.json");
    const IKnewThatArtifact = require("../frontend/src/contracts/IKnewThat.json");
    const _iKnewThat = await ethers.getContractFactory("IKnewThat");
    const iKnewThat = _iKnewThat.attach(contractAddress["IKnewThat"])
    console.log(iKnewThat)
    //    contractAddress.IKnewThat,
    //    IKnewThatArtifact.abi,
    //  ethers.provider,
    // );
    const hash = ethers.constants.HashZero;
    const result = await iKnewThat.commit(hash);
    console.log(result);
    const claim = await iKnewThat.getClaim(hash);
    console.log(claim);
})().then(() => { console.log("done"); } );
