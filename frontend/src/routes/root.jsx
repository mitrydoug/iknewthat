import { Outlet } from "react-router-dom";

export default function Root() {

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