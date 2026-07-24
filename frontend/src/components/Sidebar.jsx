import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/services", label: "Services" },
  { to: "/dashboard/availability", label: "Availability" },
  { to: "/dashboard/bookings", label: "Bookings" },
];

const Sidebar = () => {
  const { provider, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-ink-light min-h-screen flex flex-col shrink-0 border-r border-cream/10">
      <div className="p-6 border-b border-cream/10">
        <h1 className="font-display text-2xl text-cream">BookWise AI</h1>
        {provider && (
          <p className="text-cream/40 text-xs font-mono mt-1 truncate">/{provider.slug}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-md font-body text-sm transition-colors ${
                isActive
                  ? "bg-brass text-ink font-semibold"
                  : "text-cream/70 hover:bg-cream/5 hover:text-cream"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-cream/10">
        {provider && (
          <div className="mb-3 px-1">
            <p className="text-cream text-sm font-medium truncate">{provider.name}</p>
            <p className="text-cream/40 text-xs">
              {provider.plan === "pro" ? "Pro plan" : "Free plan"}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-md text-sm text-cream/60 hover:bg-clay/10 hover:text-clay transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;