import React from "react";
import { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form, Modal, Typography, Upload } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import { AppContext } from "../AppContext";
import { TarWriter } from '@gera2ld/tarjs';
import { useLocalStorage } from "../localStorage";

// import { getIPFS } from "../ipfs";

import { ethers } from "ethers";

// helia
import { unixfs } from '@helia/unixfs'
import { CarWriter } from '@ipld/car'
import { car } from '@helia/car'

const { Dragger } = Upload;
const { TextArea } = Input;
const { confirm } = Modal;
const { Title, Paragraph } = Typography;

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

function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
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

export const createClaim = (iKnewThat, helia, myClaims, setMyClaims) => async (values) => {

  console.log("I'm here!")
  console.log(values);

  const metadata = {
    title: values["claim-title"],
    description: values["claim-description"],
    attachments: [],
  }
  console.log(metadata);

  const files = (values.files?.fileList || []).map((fileObj) => fileObj.originFileObj)

  const heliaFs = unixfs(helia);
  const heliaCar = car(helia);

  let rootCID = await heliaFs.addDirectory()

  let attchDirCid = await heliaFs.addDirectory();
  for (const file of files) {
    console.log(file);
    const fileCid = await heliaFs.addBytes(await readFileAsUint8Array(file))
    attchDirCid = await heliaFs.cp(fileCid, attchDirCid, file.name)
    metadata.attachments.push(`attachments/${file.name}`);
  }
  rootCID = await heliaFs.cp(attchDirCid, rootCID, "attachments")

  const encoder = new TextEncoder()
  const metadataBytes = encoder.encode(JSON.stringify(metadata, null, "    "))
  const fileCid = await heliaFs.addBytes(metadataBytes)
  rootCID = await heliaFs.cp(fileCid, rootCID, "metadata.json")

  const { writer, out } = await CarWriter.create(rootCID)

  const carBlobPromise = carWriterOutToBlob(out)
  await heliaCar.export(rootCID, writer)
  const carBlob = await carBlobPromise

  console.log(typeof carBlob)
  console.log(carBlob);

  const randomValueArr = new BigUint64Array(1);
  crypto.getRandomValues(randomValueArr);
  const randomValue = randomValueArr[0];

  const title_path = metadata.title.trim().replaceAll(" ", "_");

  const tarWriter = new TarWriter();
  tarWriter.addFile(title_path + ".car", carBlob);
  tarWriter.addFile("secret.txt", String(randomValue));

  const hash = ethers.solidityPackedKeccak256(["string", "uint"], [String(rootCID), randomValue]);

  const a = document.createElement('a');
  a.href = URL.createObjectURL(await tarWriter.write());
  a.download = title_path + '.claim';
  a.click();

  console.log("here");
  console.log(iKnewThat);

  await iKnewThat.commit(hash);

  console.log("hereeee");

  console.log(myClaims);
  const newMyClaims = {...myClaims};
  newMyClaims[hash] = {
    metadata,
    state: "created",
  };
  setMyClaims(newMyClaims);

  return hash;
}


export default function CreateClaim() {

  const { iKnewThat, helia } = useContext(AppContext);
  const [myClaims, setMyClaims] = useLocalStorage("myClaims", {});

  const navigate = useNavigate();

  const dummyRequest = useCallback((x) => {
    setTimeout(() => {
      x.onSuccess("ok");
    }, 0);
  }, []);

  const submitForm = async (values) => {
    confirm({
      title: 'Create claim?',
      content: 'Are you sure you want to create this claim?',
      onOk: (async () => {
        const hash = await createClaim(iKnewThat, helia, myClaims, setMyClaims)(values);
        navigate("/claim/" + hash);
      }),
    });
  }

  return (
    <>
      <Title level={2}>Make Claim</ Title>
      <Form
        layout="vertical"
        onSubmitCapture={(event) => { event.preventDefault(); }}
        onFinish={submitForm}
      >
        <Form.Item label="Add a Title" name="claim-title">
          <Input type="text" placeholder="Title ..." />
        </Form.Item>
        
        <Form.Item label="Add a Description" name="claim-description">
          <TextArea placeholder="Description ..."/>
        </ Form.Item>
        <Form.Item label="Add Files" name="files">
          <Dragger file multiple
            style={{ display: 'block' }}
            customRequest={dummyRequest}
          >
            <PaperClipOutlined style={{fontSize: 36, color: '#aaaaaa'}}/>
            <p className="ant-upload-text" style={{color: '#aaaaaa'}}>Attach files to this claim</p>
          </Dragger>
        </Form.Item>
        <Button id="submit-claim-btn" type="primary" htmlType="submit">Submit</Button>
      </Form>
    </>
  );
}
