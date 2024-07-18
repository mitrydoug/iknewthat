import React from "react";
import { Form, redirect, useOutletContext } from "react-router-dom";
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

  const carBytes = await readFileAsUint8Array(formData.file)
  const reader = await CarReader.fromBytes(carBytes);
  const CIDs = await reader.getRoots();
  
  const dataLoc = String(CIDs[0])
  console.log(dataLoc);

  if (await confirmRaw({message: "Are you sure you want to reveal?"})) {

    const hash = ethers.utils.solidityKeccak256(["string"], [String(dataLoc)]);
    await iKnewThat.reveal(hash, dataLoc);
    
    return redirect("/claim/" + hash);
  }
  return redirect("/");

  return redirect("/");
}


export default function RevealClaim() {
    
  return (
    <div id="claim">
      <h1>Reveal Claim</h1>
      <Form method="post" encType="multipart/form-data">
        <h3>Car File</h3>
        <input type="file" id="files" name="file"/><br/>
        <button id="submit-reveal-btn" type="submit">Submit</button>
      </Form>
    </div>
  );
}
