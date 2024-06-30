import { Outlet, Link, useLoaderData, Form } from "react-router-dom";
import { getContacts, createContact } from "../contacts";

export async function loader() {
    const contacts = await getContacts();
    return { contacts };
}

export async function action() {
    console.log('here')
    const contact = await createContact();
    return { contact };
  }

export default function Root() {
    const { contacts } = useLoaderData();
    return (
      <>
        <div id="sidebar">
        </div>
        <div id="detail">
          <Outlet />
        </div>
      </>
    );
  }