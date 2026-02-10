import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Screener from "./pages/Screener";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import Strategies from "./pages/Strategies";
import Watchlists from "./pages/Watchlists";

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="screener" element={<Screener />} />
        <Route path="watchlists" element={<Watchlists />} />
        <Route path="strategies" element={<Strategies />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
