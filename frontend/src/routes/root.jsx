import { Form, Link, Outlet, redirect } from "react-router-dom";


export async function lookup({ request }) {
  console.log("hello?")
  const formData = Object.fromEntries(await request.formData());
  return redirect(`/claim/${formData.commitment}`);
}


export default function Root() {

  return (
    <>
      <div id="top-bar">
        <div id="search-bar">
          <Form method="post" id="search-form">
            <input
              id="search-text"
              placeholder="Claim commitment ..."
              aria-label="commitment"
              type="text"
              name="commitment"
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
      <div id="content" className="content">
        <Outlet />
      </div>
    </>
  );
}