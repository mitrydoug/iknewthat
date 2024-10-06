import { useParams } from "react-router-dom";
import { timeDeltaFormat } from "../utils";
import { Loading } from "../components/Loading";
import { AppContext } from "../AppContext"
import { useContext, useState } from "react";
import { Avatar, Card, Divider, Flex, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined, EyeInvisibleOutlined, FileImageOutlined, SyncOutlined } from '@ant-design/icons';
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "../localStorage";

import { unixfs } from '@helia/unixfs'
import Markdown from "react-markdown"; 
import remarkGfm from "remark-gfm";
import { poll } from "ethers/lib/utils";
import { CID } from 'multiformats/cid'

const { Paragraph, Title } = Typography;
const { Meta } = Card;


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


export default function Claim() {

  //const { commitHash, claim, metadata } = useLoaderData();

  const { iKnewThat, helia } = useContext(AppContext);
  const { p_claimId, p_commitHash } = useParams();


  return (
    <ClaimImpl
      iKnewThat={iKnewThat}
      helia={helia}
      p_claimId={p_claimId}
      p_commitHash={p_commitHash}
      key={[p_claimId, p_commitHash]} />
  );
}

const ClaimImpl = ({ iKnewThat, helia, p_claimId, p_commitHash }) => {

  const [commitHash, setCommitHash] = useState(p_commitHash ?? null);
  const [claim, setClaim] = useState(null);
  const [myClaims, _setMyClaims] = useLocalStorage("myClaims", {});
  console.log(myClaims);

  console.log(myClaims);
  console.log(claim);

  const {
    isPending,
    isError,
    data: metadata,
    error,
  } = useQuery({
    queryKey: [claim?.dataLoc],
    queryFn: async () => {
      const fs = unixfs(helia)
      // const res = await fs.ls(CID.parse(claim.dataLoc));

      var mdCid = null;
      for await (const entry of fs.ls(CID.parse(claim.dataLoc))) {
        console.info(entry);
        if(entry.name === "metadata.json") {
          mdCid = entry.cid;
        }
      }

      const decoder = new TextDecoder()
      var metadata = "";
      for await (const buf of fs.cat(mdCid)) {
        metadata += decoder.decode(buf);
      }
      console.log(metadata);
      metadata = JSON.parse(metadata);
      console.log(metadata);

      return metadata;
    },
    enabled: Boolean(claim && claim.revealTime.toNumber() > 0),
  });

  console.log(metadata, isPending, isError, error);

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
  var pending = null;
  var stateTag = null;

  const myClaim = myClaims[commitHash];
  console.log(myClaim);

  if(claim.publishTime.toNumber() > 0) {

    claimId = String(claim.id);
    claimant = String(claim.claimant)
    commitTime = new Date(claim.publishTime.toNumber()*1000);
    revealTime = (
      claim.revealTime.toNumber() > 0 ?
        new Date(claim.publishTime.toNumber()*1000) :
        null
    );
    revealed = revealTime !== null;
    if (!revealed && myClaim?.status === "revealed") {
      revealed = true;
      pending = true;
    }
    stateTag = (revealed ? 
      (pending ? (
          <Tooltip title="Awaiting confirmation on blockchain">
            <Tag color="green"><SyncOutlined spin /> Revealed</Tag>
          </Tooltip>
        ) : <Tag color="green"><EyeOutlined spin={pending} /> Revealed</Tag> 
      ) :
      <Tag color="grey"><EyeInvisibleOutlined/> Concealed</Tag>
    );
  } else if (commitHash in myClaims) {
    claimId = "?";
    claimant = "you";
    revealed = false;
    pending = true;
    stateTag = (
      <Tooltip title="Awaiting confirmation on blockchain">
        <Tag color="grey"><SyncOutlined spin /> Concealed</Tag>
      </Tooltip>
    );
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
  const description = metadata?.description;

  const attachment_links = []
  for (const fileName of (metadata?.attachments || [])) {
      const href = `https://${claim.dataLoc}.ipfs.w3s.link/${fileName}` 
      const elem = (
        <a href={href} target="_blank" rel="noopener noreferrer" key={fileName}>
          <Card
            className="claim-attachment"
            style={{ maxWidth: "300px" }}
            size="small"
          >
            <Meta
              avatar={<FileImageOutlined />}
              title={<Tooltip title={fileName} mouseEnterDelay={1}>{fileName}</Tooltip>}
              description="50KB"
            />
          </Card>
        </a>
      );
      attachment_links.push(elem);
  }

  console.log(attachment_links);
    
  return (
    <>
      <Title level={2}>{title} #{claimId}</Title>
      <Paragraph>
        {stateTag} <Tooltip title={claimant}>{claimantShort}</Tooltip>&nbsp;
        made claim <Tooltip title={commitHash}>{commitShort}</Tooltip>&nbsp;
        &nbsp;{ commitTime && <Tooltip title={localeStr}>{deltaText}</Tooltip>}
      </Paragraph>
      { description &&
        <Card size="small">
          <Markdown className="markdown" remarkPlugins={[remarkGfm]}>{description}</Markdown>
        </Card>
      }
      { attachment_links.length > 0 &&
        <>
          <Title level={4}>Attachments</Title>
          <Flex wrap gap="small">
            {attachment_links}
          </Flex>
        </>
      }
    </>
  );
}
