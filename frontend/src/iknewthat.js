import { ethers } from "ethers";

import contractAddress from "./contracts/contract-address.json";
import IKnewThatArtifact from "./contracts/IKnewThat.json";

var iKnewThat = null

export async function getIKnewThat() {
    if(iKnewThat) {
        return iKnewThat
    }
    const provider = new ethers.getDefaultProvider("http://127.0.0.1:8545");
    iKnewThat = new ethers.Contract(
      contractAddress.IKnewThat,
      IKnewThatArtifact.abi,
      provider,
    );
    return iKnewThat;
}