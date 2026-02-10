import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

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

  return (
    <header className="bg-terminal-surface border-b border-terminal-border">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-5 py-3 flex items-center gap-6 flex-wrap">
      <Link to="/dashboard" className="text-terminal-fg font-semibold text-base hover:text-groww no-underline hover:no-underline transition-colors">
        Algo Trading
      </Link>
      <nav className="flex items-center gap-1">
        {navLink("/dashboard", "Dashboard")}
        {navLink("/orders", "Orders")}
        {navLink("/screener", "Screener")}
        {navLink("/watchlists", "Watchlists")}
        {navLink("/strategies", "Strategies")}
        {navLink("/settings", "Settings")}
      </nav>
      </div>
    </header>
  );
}
