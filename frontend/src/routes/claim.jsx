import { useParams } from "react-router-dom";
import { timeDeltaFormat } from "../utils";
import { Loading } from "../components/Loading";
import { useState } from "react";
import { Card, Flex, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

import { unixfs } from '@helia/unixfs'
import { getLocalStorage } from "../localStorage";
import Markdown from "react-markdown"; 
import { poll } from "ethers/lib/utils";

const { Paragraph, Title } = Typography;


const loadData = async (cidStr, helia, fetch) => {
  const resp = await fetch("ipfs://" + cidStr);

  const heliaFs = unixfs(helia);

  var mdCid = null;
  var attachmentsCid = null;
  for await (const entry of heliaFs.ls(cidStr)) {
    console.info(entry)
    if(entry.name === "metadata.json") {
      mdCid = entry.cid;
    } else if (entry.name == "attachments") {
      attachmentsCid = entry.cid;
    }
  }

  const decoder = new TextDecoder()
  var metadata = "";
  for await (const buf of heliaFs.cat(mdCid)) {
    metadata += decoder.decode(buf);
  }
  console.log(metadata);
  metadata = JSON.parse(metadata);
  console.log(metadata);

  const attachments = {}
  for await (const entry of heliaFs.ls(attachmentsCid)) {
    attachments[entry.name] = [];
    for await (const buf of heliaFs.cat(entry.cid)) {
      attachments[entry.name].push(buf);
    }
  }
  console.log(attachments);

  return [metadata, attachments];
};


export default function Claim({ iKnewThat, helia, fetch }) {

  //const { commitHash, claim, metadata } = useLoaderData();

  const { p_claimId, p_commitHash } = useParams();


  return (
    <ClaimImpl
      iKnewThat={iKnewThat}
      helia={helia}
      fetch={fetch}
      p_claimId={p_claimId}
      p_commitHash={p_commitHash}
      key={[p_claimId, p_commitHash]} />
  );
}

const ClaimImpl = ({ iKnewThat, helia, fetch, p_claimId, p_commitHash }) => {

  const [commitHash, setCommitHash] = useState(p_commitHash ?? null);
  const [claim, setClaim] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [attachments, setAttachments] = useState(null);
  const myClaims = getLocalStorage("myClaims", []);

  console.log(myClaims);
  console.log(claim);

  if (!claim) {
    if (commitHash) {
      console.log(commitHash);
      iKnewThat.getClaim(commitHash).then((claim) => {
        setClaim(claim);
      });
    } else {
      console.log(p_claimId);
      iKnewThat.getClaimCommitmentFromId(p_claimId).then((commitHash) => {
        setCommitHash(commitHash);
      });
    }
    return <Loading />;
  }

  var claimId = null;
  var claimant = null;
  var commitTime = null;
  var revealTime = null;
  var revealed = null;
  var stateTag = null;

  if(claim.publishTime.toNumber() > 0) {

    if (!metadata && claim.revealTime.toNumber() > 0) {
      //console.log(claim.dataLoc);
      loadData(claim.dataLoc, helia, fetch).then(([metadata, attachments]) => {
        setMetadata(metadata);
        setAttachments(attachments);
      });
    }

    claimId = String(claim.id);
    claimant = String(claim.claimant)
    commitTime = new Date(claim.publishTime.toNumber()*1000);
    revealTime = (
      claim.revealTime.toNumber() > 0 ?
        new Date(claim.publishTime.toNumber()*1000) :
        null
    );
    revealed = revealTime !== null;
    stateTag = (revealed ? 
      <Tag color="green"><EyeOutlined /> Revealed</Tag> :
      <Tag color="grey"><EyeInvisibleOutlined /> Concealed</Tag>
    );
  } else if (myClaims.includes(commitHash)) {
    claimId = "?";
    claimant = "you";
    revealed = false;
    stateTag = <span className="state-pending">Pending</span>;
    setTimeout(() => {
      iKnewThat.getClaim(commitHash).then((claim) => {
        setClaim(claim);
      });
    }, 2000);
  } else {
    return <div>Claim not found</div>;
  }

  const deltaText = commitTime ? timeDeltaFormat(commitTime): null;
  const options = {
    dateStyle: "long",
    timeStyle: "long",
  }
  const localeStr = commitTime ? commitTime.toLocaleString(undefined, options): null;

  const claimantShort = claimant.substring(0, 9);
  const commitShort = commitHash.substring(0, 9);

  const title = metadata ? metadata.title : "Claim";
  const description = metadata ? metadata.description : "## Summary\nHello there";

  const attachment_links = []
  for (const [key, value] of Object.entries(attachments || {})) {
      const fileName = key.trim().replaceAll(" ", "_");
      const href = URL.createObjectURL(new Blob(value));
      const elem = <a href={href} download={fileName}><div>{fileName}</div></a>;
      attachment_links.push(elem);
  }

  console.log(attachment_links);
    
  return (
    <Flex vertical style={{ width: '100%'}}>
      <Title level={2}>{title} # {claimId}</Title>
      <Paragraph>
        {stateTag} <Tooltip title={claimant}>{claimantShort}</Tooltip>&nbsp;
        made claim <Tooltip title={commitHash}>{commitShort}</Tooltip>&nbsp;
        &nbsp;{ commitTime && <Tooltip title={localeStr}>{deltaText}</Tooltip>}
      </Paragraph>
      { description &&
        <Card size="small">
          <Markdown>{description}</Markdown>
        </Card>
      }
      { attachment_links.length > 0 &&
        <div>
          <h3>Attachments</h3>
          <div id="attachments-div">{attachment_links}</div>
        </div>
      }
    </Flex>
  );
}
