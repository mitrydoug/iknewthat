import React from "react";
import { useContext } from "react";
import { useNavigate, useOutletContext, useSubmit } from "react-router-dom";
import { SelectOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Typography, Upload } from 'antd';
import { AppContext } from "../AppContext"
import { TarReader } from "@gera2ld/tarjs"

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

export const revealClaim = (iKnewThat) => async (values) => {

  console.log("Reveal Claim")
  console.log(values);

  const tarReader = await TarReader.load(values['claim-file'].file.originFileObj);

  console.log(tarReader.fileInfos);

  const carFileInfo = tarReader.fileInfos.filter((info) => info.name.endsWith(".car"))[0]
  const secretFileInfo = tarReader.fileInfos.filter((info) => info.name === "secret.txt")[0] 

  const carBlob = tarReader.getFileBlob(carFileInfo.name);
  const randomValue = BigInt(tarReader.getTextFile(secretFileInfo.name))

  const carBytes = new Uint8Array(await carBlob.arrayBuffer());

  console.log(carBytes);

  const reader = await CarReader.fromBytes(carBytes);
  const CIDs = await reader.getRoots();
  
  const dataLoc = String(CIDs[0])
  console.log(dataLoc);

  const hash = ethers.utils.solidityKeccak256(["string", "uint"], [String(dataLoc), randomValue]);
  console.log(randomValue);
  await iKnewThat.reveal(hash, dataLoc, randomValue);

  return hash;
    
  /*return redirect("/claim/" + hash);
  }
  return redirect("/");*/
}


export default function RevealClaim() {

  const { iKnewThat, helia } = useContext(AppContext);
  const navigate = useNavigate();

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
        const hash = await revealClaim(iKnewThat)(values);
        navigate("/claim/" + hash);
      }),
    });
  }
    
  return (
    <>
      <Title level={2}>Reveal Claim</ Title>
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
    </>
  );
}
