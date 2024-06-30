import { Form, useLoaderData } from "react-router-dom";
import { getContact } from "../contacts";

export async function loader({ params }) {
    console.log(params)
    return { commitHash: params.commitHash };
}


export default function Contact() {
  const { commitHash } = useLoaderData();

  return (
    <div id="claim">
        <p>Details of claim {commitHash}</p>
    </div>
  );
}
