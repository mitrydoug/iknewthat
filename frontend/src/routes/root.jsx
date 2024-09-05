import { Form, Link, Outlet, redirect } from "react-router-dom";
import { ethers } from "ethers";


export const lookup = async ({ request }) => {
  const formData = Object.fromEntries(await request.formData());
  const isBytes32 = (str => /^0x[A-F0-9]{64}$/i.test(str));
  if (!isNaN(formData.commitOrId) && String(parseInt(formData.commitOrId)) === formData.commitOrId) {
    return redirect(`/claim/id/${formData.commitOrId}`);
  } else if (isBytes32(formData.commitOrId)){
    return redirect(`/claim/${formData.commitOrId}`);
  } else {
    alert("Invalid Input");
    return redirect('/');
  }
}


export default function Root() {

  return (
    <>
      <div id="top-bar">
        <div id="search-bar">
          <div id="logo-div"><a href="/"><img id="logo" src="/logo.png"/></a></div>
          <div id="search-form-div">
            <Form method="post" id="search-form">
              <input
                id="search-text"
                placeholder="Claim id or commitment ..."
                aria-label="commitOrId"
                type="text"
                name="commitOrId"
                autoComplete="on"
              />
              <button type="submit">Search</button>
            </Form>
            <Link to="/claim/create">
              <button>Make Claim</button>
            </Link>
            <Link to="/claim/reveal">
              <button>Reveal Claim</button>
            </Link>
          </div>
        </div>
      </div>
      <div id="content" className="content">
        <Outlet />
      </div>
    </>
  );
}