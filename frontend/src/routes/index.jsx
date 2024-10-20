import { Form, useLoaderData,  redirect} from "react-router-dom";

export async function lookup({ request }) {
    const formData = Object.fromEntries(await request.formData());
    return redirect(`/claim/${formData.commitment}`);
}

export default function Index({ iKnewThat }) {
  
  console.log(iKnewThat);

  return (
    <Form method="post" id="search-form">
        <input
          placeholder="Claim commitment ..."
          aria-label="commitment"
          type="text"
          name="commitment"
        />
        <button type="submit">Lookup</button>
    </Form>
  );
}