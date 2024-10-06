import React from "react";
import { useContext, useState } from "react";
import { useNavigate, useOutletContext, useSubmit } from "react-router-dom";
import { SelectOutlined, CheckOutlined } from '@ant-design/icons';
import { Avatar, Button, Flex, Form, Image, Input, Modal, Space, Typography, Upload } from 'antd';
import { AppContext } from "../AppContext"
import { TarReader } from "@gera2ld/tarjs"
import { create } from '@web3-storage/w3up-client'
import { useLocalStorage } from "../localStorage";

import { ethers } from "ethers";

// ipfs
import { CarReader } from '@ipld/car'

const { Dragger } = Upload;
const { Title } = Typography;
const { confirm } = Modal;

/**
 *
 * @param {File} file
 * @returns {Promise<Uint8Array>}
 */
async function readFileAsUint8Array (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const arrayBuffer = reader.result
      if (arrayBuffer != null) {
        if (typeof arrayBuffer === 'string') {
          const uint8Array = new TextEncoder().encode(arrayBuffer)
          resolve(uint8Array)
        } else if (arrayBuffer instanceof ArrayBuffer) {
          const uint8Array = new Uint8Array(arrayBuffer)
          resolve(uint8Array)
        }
        return
      }
      reject(new Error('arrayBuffer is null'))
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (result != null) {
        resolve(result); 
        return;
      }
      reject(new Error('arrayBuffer is null'))
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsText(file)
  })
}

/**
 *
 * @param {AsyncIterable<Uint8Array>} carReaderIterable
 * @returns {Promise<Blob>}
 */
async function carWriterOutToBlob (carReaderIterable) {
  const parts = []
  for await (const part of carReaderIterable) {
    parts.push(part)
  }
  return new Blob(parts, { type: 'application/car' })
}

export const revealClaim = (iKnewThat, W3SClient, account, myClaims, setMyClaims) => async (values) => {

  console.log("Reveal Claim")
  console.log(values);

  const tarReader = await TarReader.load(values['claim-file'].file.originFileObj);

  console.log(tarReader.fileInfos);

  const carFileInfo = tarReader.fileInfos.filter((info) => info.name.endsWith(".car"))[0]
  const secretFileInfo = tarReader.fileInfos.filter((info) => info.name === "secret.txt")[0] 

  const carBlob = tarReader.getFileBlob(carFileInfo.name);
  const randomValue = BigInt(tarReader.getTextFile(secretFileInfo.name))

  ///

  const space = await W3SClient.createSpace('some-space-4', { account });
  await W3SClient.addSpace(await space.createAuthorization(W3SClient));
  await W3SClient.setCurrentSpace(space.did());
  await W3SClient.uploadCAR(carBlob);

  ///

  const carBytes = new Uint8Array(await carBlob.arrayBuffer());

  console.log(carBytes);

  const reader = await CarReader.fromBytes(carBytes);
  const CIDs = await reader.getRoots();
  
  const dataLoc = String(CIDs[0])
  console.log(dataLoc);

  const hash = ethers.utils.solidityKeccak256(["string", "uint"], [String(dataLoc), randomValue]);
  console.log(randomValue);
  await iKnewThat.reveal(hash, dataLoc, randomValue);

  const myClaim = myClaims[hash];
  if (myClaim) {
    myClaim["status"] = "revealed";
    console.log(hash);
    console.log(myClaims);
    setMyClaims(myClaims);
  }

  return hash;
}


export default function RevealClaim() {

  const [ w3sModalOpen, setW3sModalOpen ] = useState(false);
  const [ waitEmail, setWaitEmail] = useState(false);
  const { iKnewThat, helia } = useContext(AppContext);
  const [ W3SClient, setW3SClient ] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [myClaims, setMyClaims] = useLocalStorage("myClaims", {});

  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const submitForm = async (values) => {
    confirm({
      title: 'Are you sure?',
      content: 'Are you sure you want to reveal this claim?',
      onOk: (async () => {
        const k = Object.keys(W3SClient.accounts())[0];
        const account = W3SClient.accounts()[k]; 
        const hash = await revealClaim(iKnewThat, W3SClient, account, myClaims, setMyClaims)(values);
        navigate("/claim/" + hash);
      }),
    });
  }

  const showW3sModal = () => {
    setW3sModalOpen(true);
  };

  if (W3SClient === null) {
    create().then((client) => setW3SClient(client));
    console.log(W3SClient);
    console.log(W3SClient && W3SClient.accounts());
  }

  const connectW3S = async (email) => {
    console.log(email);
    setWaitEmail(true);
    const client = await create();
    console.log(client.accounts());
    const account = await client.login(email);
    console.log(account);
    while (true) {
      const res = await account.plan.get()
      if (res.ok) break
      console.log('Waiting for payment plan to be selected...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(space.did())
    //const what = await account.provision(space.did())
    //const g = await space.save()
    
    //const recovery = await space.createRecovery(account.did())
    //await client.capability.access.delegate({
    //  space: space.did(),
    //  delegations: [recovery],
    //});
    // const x = await client.setCurrentSpace('did:key:z6Mkgvmny7JqZmvaDuo7ZkzbT8vZDkS1Zq71yHEA7w7vqhQP');
    console.log(client.spaces());
    console.log(client.currentSpace());

    setWaitEmail(false);
    setW3sModalOpen(false);
  }
    
  return (
    <>
      <Space direction="vertical">
        <Title level={2}>Reveal Claim</ Title>
        <Flex gap="middle">
          <Avatar icon={<Image src="/web3storage_logo.png"/>}/>
          {W3SClient && Object.keys(W3SClient.accounts()).length > 0 ?
            <CheckOutlined style={{ color: "green" }}/> :
            <Button onClick={showW3sModal}>Connect Web3Storage</Button>}
        </Flex>
        <Form
          layout="horizontal"
          onSubmitCapture={(event) => { console.log("Hello?"); event.preventDefault(); }}
          onFinish={submitForm}
        >
          <Form.Item name="claim-file">
            <Upload
              accept=".claim"
              action={async (file) => { return null; }}
              customRequest={dummyRequest}
            >
              <Button icon={<SelectOutlined />}>Choose Claim</Button>
            </Upload>
          </Form.Item>
          <Button id="submit-claim-btn" type="primary" htmlType="submit">Reveal</Button>
        </Form>
      </Space>
      <Modal
        title="Connect to Web3Storage ..."
        open={w3sModalOpen}
        onOk={form.submit}
        confirmLoading={waitEmail}
        onCancel={() => { setW3sModalOpen(false); }}
      >
        <Form
          form={form}
          onSubmitCapture={(event) => { event.preventDefault(); }}
          onFinish={(values) => { connectW3S(values["email-address"]); }}
        >
          <Form.Item label="Email Address" name="email-address">
            <Input type="text" placeholder="jdoe@example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
