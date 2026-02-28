"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, BarChart2, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function GlassSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Properties", href: "/dashboard/properties", icon: Home },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden md:flex flex-col w-64 h-full p-6 glass-panel border-r border-white/10 rounded-r-3xl z-20 sticky top-0"
        >
            <div className="flex items-center gap-3 mb-10 pl-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Z</span>
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Zia Admin
                </span>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive ? "text-white" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl shadow-inner"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon
                                className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-indigo-400" : "group-hover:text-white"
                                    }`}
                            />
                            <span className="font-medium relative z-10">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all mt-auto"
            >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
            </button>
        </motion.aside>
    );

    function handleLogout() {
        try {
            logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }
}
