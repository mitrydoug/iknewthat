import React from "react";
import { redirect, useOutletContext, useSubmit } from "react-router-dom";
import { SelectOutlined } from '@ant-design/icons';
import { Button, Form, Typography, Upload } from 'antd';

// import { getIPFS } from "../ipfs";
import { getIKnewThat } from "../iknewthat";

import { ethers } from "ethers";

// helia
import { createHelia } from 'helia'
import { car } from '@helia/car'
import { unixfs } from '@helia/unixfs'
import { CarReader } from '@ipld/car'

import { createConfirmation } from 'react-confirm';
import CreateConfirmation from "../components/CreateConfirmation";

const { Dragger } = Upload;
const { Title } = Typography;

// create confirm function
const confirmRaw = createConfirmation(CreateConfirmation);

// This is optional. But wrapping function makes it easy to use.
function confirm(confirmation, options = {}) {
  return confirmRaw({ confirmation, options });
}

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

export const revealClaim = (iKnewThat) => async ({ request }) => {

  console.log("Reveal Claim")

  // const ipfs = await getIPFS();
  const rawFormData = await request.formData();
  const formData = {};
  Array.from(rawFormData).forEach((elem) => {
    const k = elem[0]
    const v = elem[1]
    if(formData.hasOwnProperty(k)) {
      formData[k].push(v)
    } else {
      formData[k] = [v]
    }
  });
  Object.keys(formData).forEach(function(key, index) {
    if(formData[key].length === 1) {
      formData[key] = formData[key][0]
    }
  });
  console.log(formData);

  const saveObj = JSON.parse(await readFileAsText(formData.file));
  const randomValue = BigInt(saveObj["secret"]);

  function blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  const carBlob = await (await fetch(saveObj["carBytes"])).blob();
  const carBytes = new Uint8Array(await carBlob.arrayBuffer());

  console.log(carBytes);

  const reader = await CarReader.fromBytes(carBytes);
  const CIDs = await reader.getRoots();
  
  const dataLoc = String(CIDs[0])
  console.log(dataLoc);

  if (await confirmRaw({message: "Are you sure you want to reveal?"})) {

    const hash = ethers.utils.solidityKeccak256(["string", "uint"], [String(dataLoc), randomValue]);
    console.log(randomValue);
    await iKnewThat.reveal(hash, dataLoc, randomValue);
    
    return redirect("/claim/" + hash);
  }
  return redirect("/");
}


export default function RevealClaim() {

  const submit = useSubmit();

  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };
    
  return (
    <div id="claim">
      <Title level={2}>Reveal Claim</ Title>
      <Form
        layout="horizontal"
        onSubmitCapture={(event) => { console.log("Hello?"); event.preventDefault(); }}
        onFinish={(values) => {
          submit(values, { method: 'post' })
        }}
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
    </div>
  );
}
