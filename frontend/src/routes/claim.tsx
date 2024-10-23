import React, { FC } from "react";
import { useParams } from "react-router-dom";
import { timeDeltaFormat } from "../utils";
import { Loading } from "../components/Loading";
import { AppContext, AppState } from "../AppContext"
import { useContext, useState } from "react";
import { Card, Flex, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined, EyeInvisibleOutlined, FileImageOutlined, SyncOutlined } from '@ant-design/icons';
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "../localStorage";

import { unixfs } from '@helia/unixfs'
import Markdown from "react-markdown"; 
import remarkGfm from "remark-gfm";
import { CID } from 'multiformats/cid'
import { ethers } from "ethers";
import { Helia } from "@helia/http";

const { Paragraph, Title } = Typography;
const { Meta } = Card;

interface ClaimImplProps {
  iKnewThat: ethers.Contract;
  helia: Helia;
  p_claimId?: string;
  p_commitHash?: string;
}

interface Claim {
  id: number;
  claimant: string;
  publishTime: bigint;
  revealTime: bigint;
  dataLoc: string;
  nonce: bigint;
}

export default function Claim() {

  //const { commitHash, claim, metadata } = useLoaderData();

  const { iKnewThat, helia } = useContext(AppContext) as AppState;
  const { p_claimId, p_commitHash } = useParams();

  return (
    <ClaimImpl
      iKnewThat={iKnewThat}
      helia={helia}
      p_claimId={p_claimId}
      p_commitHash={p_commitHash} />
  );
}

const ClaimImpl: FC<ClaimImplProps> = ({ iKnewThat, helia, p_claimId, p_commitHash }) => {

  const [commitHash, setCommitHash] = useState(p_commitHash ?? null);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [myClaims, _setMyClaims] = useLocalStorage("myClaims", {});
  console.log(myClaims);

  console.log(myClaims);
  console.log(claim);
  console.log(claim && claim.revealTime);

  const {
    isPending,
    isError,
    data: metadata,
    error,
  } = useQuery({
    queryKey: [claim?.dataLoc],
    queryFn: async () => {

      if (claim === null) {
        return;
      }

      const fs = unixfs(helia)

      let mdCid: CID | null = null;
      for await (const entry of fs.ls(CID.parse(claim.dataLoc))) {
        console.info(entry);
        if(entry.name === "metadata.json") {
          mdCid = entry.cid;
        }
      }

      if (mdCid === null) {
        return null;
      }

      const decoder = new TextDecoder()
      let metadata = "";
      for await (const buf of fs.cat(mdCid)) {
        metadata += decoder.decode(buf);
      }
      console.log(metadata);
      metadata = JSON.parse(metadata);
      console.log(metadata);

      return metadata;
    },
    enabled: Boolean(claim && claim.revealTime > 0n),
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

  const commitHashStr = (commitHash as string);

  let claimId: string | null = null;
  let claimant: string | null = null;
  let commitTime: Date | null = null;
  let revealTime: Date | null = null;
  let revealed: boolean | null = null;
  let pending = false;
  let stateTag: JSX.Element | null = null;

  const myClaim = myClaims[commitHashStr];
  console.log(myClaim);

  if(claim.publishTime > 0n) {

    claimId = String(claim.id);
    claimant = String(claim.claimant)
    commitTime = new Date(Number(claim.publishTime) * 1000);
    revealTime = (
      claim.revealTime > 0n ?
        new Date(Number(claim.revealTime) * 1000) :
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
  } else if (commitHashStr in myClaims) {
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
      iKnewThat.getClaim(commitHashStr).then((claim) => {
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
  const commitShort = commitHashStr.substring(0, 9);

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
