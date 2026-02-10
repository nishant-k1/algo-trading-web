import { Outlet, Navigate } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/signin" replace />;

  return (
    <div className="flex flex-col min-h-screen bg-terminal-bg">
      <Header />
      <main className="flex-1 p-4 md:p-5 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
