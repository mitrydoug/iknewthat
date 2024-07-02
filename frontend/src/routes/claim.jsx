import { Form, useLoaderData } from "react-router-dom";
import { getIKnewThat } from "../iknewthat";

export async function loader({ params }) {
    const iKnewThat = await getIKnewThat()
    console.log(params.commitHash);
    const claim = await iKnewThat.getClaim(params.commitHash);
    // const something = await iKnewThat.something();
    console.log(claim);
    return { commitHash: params.commitHash, claim };
}


export default function Claim() {
  const { commitHash, claim } = useLoaderData();
  const commitTime = new Date(claim.publishTime.toNumber()*1000);

  return (
    <div id="claim">
        <h3>Details of claim {commitHash} is </h3>
        <ul>
          <li><b>Claimant:</b> {claim.claimant}</li>
          <li><b>Commit Time:</b> {commitTime.toString()}</li>
        </ul>
    </div>
  );
}
