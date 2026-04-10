import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Droplets, LayoutGrid, Settings, LogOut, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/journal-liquidity", icon: Droplets, label: "Liquidity" },
    { path: "/journal-retail", icon: LayoutGrid, label: "Retail" },
    { path: "/history", icon: BookOpen, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 px-6 py-3 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="hidden md:flex items-center gap-2 font-bold text-blue-500 text-xl">
          <TrendingUp className="w-6 h-6" />
          <span>FX JOURNAL</span>
        </Link>
        
        <div className="flex items-center justify-around w-full md:w-auto md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 text-[10px] md:text-sm font-medium transition-colors",
                location.pathname === item.path ? "text-blue-500" : "text-slate-400 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-[10px] md:text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};