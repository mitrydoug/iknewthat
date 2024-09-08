import React from "react";
import { Form, redirect, useOutletContext } from "react-router-dom";
// import { getIPFS } from "../ipfs";

import { ethers } from "ethers";

// helia
import { unixfs } from '@helia/unixfs'
import { CarWriter } from '@ipld/car'
import { car } from '@helia/car'

import { createConfirmation } from 'react-confirm';
import CreateConfirmation from "../components/CreateConfirmation";

import { getLocalStorage, setLocalStorage } from "../localStorage";

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

export const createClaim = (iKnewThat, helia) => async ({ request }) => {

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
  const metadata = {
    title: formData["claim-title"],
    description: formData["claim-description"],
  }
  console.log(metadata);

  const heliaFs = unixfs(helia);
  const heliaCar = car(helia);

  let rootCID = await heliaFs.addDirectory()

  const encoder = new TextEncoder()
  const metadataBytes = encoder.encode(JSON.stringify(metadata, null, "    "))
  const fileCid = await heliaFs.addBytes(metadataBytes)
  rootCID = await heliaFs.cp(fileCid, rootCID, "metadata.json")

  let attchDirCid = await heliaFs.addDirectory();
  const files = (Array.isArray(formData.files) ? formData.files : [formData.files])
  for (const file of files) {
    const fileCid = await heliaFs.addBytes(await readFileAsUint8Array(file))
    attchDirCid = await heliaFs.cp(fileCid, attchDirCid, file.name)
  }
  rootCID = await heliaFs.cp(attchDirCid, rootCID, "attachments")

  const { writer, out } = await CarWriter.create(rootCID)

  const carBlobPromise = carWriterOutToBlob(out)
  await heliaCar.export(rootCID, writer)
  const carBlob = await carBlobPromise

  console.log(typeof carBlob)
  console.log(carBlob);

  const randomValueArr = new BigUint64Array(1);
  crypto.getRandomValues(randomValueArr);
  const randomValue = randomValueArr[0];

  var saveObj = {
    "secret": String(randomValue),
    "carBytes": await blobToBase64(carBlob)
  }

  const hash = ethers.utils.solidityKeccak256(["string", "uint"], [String(rootCID), randomValue]);

  if (await confirmRaw({message: "Are you sure?\n\nCommitment: " + hash})) {

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(saveObj)], {type : "application/json"}));
    a.download = metadata.title.trim().replaceAll(" ", "_") + '.claim';
    a.click();

    await iKnewThat.commit(hash);

    const myClaims = getLocalStorage("myClaims", []);
    myClaims.push(hash);
    setLocalStorage("myClaims", myClaims);
    
    return redirect("/claim/" + hash);
  }
  return redirect("/");
}


export default function CreateClaim() {
    
  return (
    <div id="claim">
      <h1>Make Claim</h1>
      <Form method="post" encType="multipart/form-data">
        <h3>Add a Title</h3>
        <input
          id="claim-title"
          placeholder="Title ..."
          aria-label="claim-title"
          type="text"
          name="claim-title"
        />
        <h3>Add a Description</h3>
        <textarea
          id="claim-description"
          placeholder="Description ..."
          aria-label="claim-description"
          type="text"
          name="claim-description"
        />
        <h3>Add Files</h3>
        <input type="file" id="files" name="files" multiple/><br/>
        <button id="submit-claim-btn" type="submit">Submit</button>
      </Form>
    </div>
  );
}
