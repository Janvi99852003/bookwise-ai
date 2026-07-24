import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-ink flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;