import { useLoaderData } from "react-router-dom";
import { timeDeltaFormat } from "../utils";


export const loader = (iKnewThat) => async ({ params }) => {
  console.log(params.commitHash);
  const claim = await iKnewThat.getClaim(params.commitHash);
  // const something = await iKnewThat.something();
  console.log(claim);
  return { commitHash: params.commitHash, claim };
}


export default function Claim() {
  const { commitHash, claim } = useLoaderData();

  if(claim.publishTime.toNumber() === 0) {
    return (
      <div id="claim">
        <h3>Claim not found</h3>
      </div>
    );
  }

  const claimant = String(claim.claimant)
  const commitTime = new Date(claim.publishTime.toNumber()*1000);
  const revealTime = (
    claim.revealTime.toNumber() > 0 ?
      new Date(claim.publishTime.toNumber()*1000) :
      null
  );
  const revealed = revealTime !== null;
  const stateTag = (revealed ? 
    <span className="state-revealed">Revealed</span> :
    <span className="state-concealed">Concealed</span>
  );

  const deltaText = timeDeltaFormat(commitTime);
  const options = {
    dateStyle: "long",
      timeStyle: "long",
  }
  const localeStr = commitTime.toLocaleString(undefined, options);

  const claimantShort = claimant.substring(0, 9);
  const commitShort = commitHash.substring(0, 9);
    
  return (
    <div id="claim">
        <h1 id="h1-claim-details">Claim <span className="claim-id">#{String(claim.id)}</span></h1>
          {stateTag} <span className="mytooltip">{claimantShort}<span className="mytooltiptext">{claimant}</span></span>&nbsp;
          made claim <span className="mytooltip">{commitShort}<span className="mytooltiptext">{commitHash}</span></span>&nbsp;
          <span className="mytooltip">{deltaText}<span className="mytooltiptext">{localeStr}</span></span>
    </div>
  );
}
