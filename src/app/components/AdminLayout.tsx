import React from "react";
import { useNavigate, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Zap, 
  LogOut, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import { toast } from "sonner";
import { motion } from "motion/react";

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Leads", path: "/admin/leads" },
    { icon: Zap, label: "Automatisation", path: "/admin/automation" },
    { icon: Settings, label: "Paramètres", path: "/admin/settings" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/signin");
    if (onLogout) onLogout();
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <img
          src="https://ucarecdn.com/8796d3aa-4089-4859-87df-1772ce670f61/-/format/auto/"
          alt="Premunia Logo"
          className="h-10 w-auto mb-8"
        />
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-red-50 text-[#EE3B33] font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? "text-[#EE3B33]" : "text-slate-400"} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all mb-2"
        >
          <ExternalLink size={20} className="text-slate-400" />
          <span>Voir le site</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-[#EE3B33] rounded-xl transition-all"
        >
          <LogOut size={20} className="text-slate-400" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
