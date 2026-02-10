import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const navLink = (to: string, label: string) => {
    const isActive = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={
          "no-underline hover:no-underline px-2 py-1.5 rounded text-sm font-medium transition-colors " +
          (isActive
            ? "bg-terminal-panel text-groww"
            : "text-terminal-fg/90 hover:text-groww hover:bg-terminal-panel/50")
        }
      >
        {label}
      </Link>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    navigate("/signin", { replace: true });
  };

  return (
    <header className="bg-terminal-surface border-b border-terminal-border">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-5 py-3 flex items-center gap-4 min-w-0">
        <Link
          to="/dashboard"
          className="shrink-0 text-terminal-fg font-semibold text-base hover:text-groww no-underline hover:no-underline transition-colors"
        >
          Algo Trading
        </Link>
        <nav className="flex items-center gap-1 min-w-0 flex-1 overflow-x-auto">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/orders", "Orders")}
          {navLink("/screener", "Screener")}
          {navLink("/watchlists", "Watchlists")}
          {navLink("/strategies", "Strategies")}
          {navLink("/settings", "Settings")}
          {navLink("/profile", "Profile")}
          <span className="ml-auto shrink-0" />
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 px-2 py-1.5 rounded text-sm font-medium text-terminal-fg/90 hover:text-groww hover:bg-terminal-panel/50 border border-terminal-border/50 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
