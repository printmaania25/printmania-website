import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";

function UserPanel() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default UserPanel;