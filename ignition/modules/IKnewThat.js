const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const IKnewThatModule = buildModule("IKnewThatModule", (m) => {
  const iKnewThat = m.contract("IKnewThat");

  console.log(iKnewThat.address);

  return { iKnewThat };
});

module.exports = IKnewThatModule;