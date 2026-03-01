"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, BarChart2, Settings, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface GlassSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function GlassSidebar({ isOpen, onClose }: GlassSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Properties", href: "/dashboard/properties", icon: Home },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    x: typeof window !== 'undefined' && window.innerWidth < 768 ? (isOpen ? 0 : -300) : 0,
                    opacity: 1
                }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className={`fixed inset-y-0 left-0 z-50 md:sticky md:flex flex-col w-72 md:w-64 h-full p-6 glass-panel border-r border-white/10 rounded-r-3xl transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Top Section: App Logo + Name */}
                <div className="flex items-center gap-3 mb-8 pl-1">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/logo.svg"
                            alt="LuxeEstate Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        LuxeEstate
                    </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-8 w-full" />

                {/* Admin Section: Avatar + Label */}
                <div className="flex flex-col items-center justify-center mb-10 gap-3">
                    <div className="relative w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden bg-white/5 p-1 shadow-xl">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                            {/* Using a placeholder for the avatar as the provided image path needs verification */}
                            <Image
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica"
                                alt="Admin Avatar"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <span className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
                        Admin
                    </span>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 text-slate-400 hover:text-white glass-card rounded-xl absolute top-6 right-6"
                >
                    <X className="w-5 h-5" />
                </button>

                <nav className="flex-1 flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => {
                                    if (onClose) onClose();
                                }}
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
        </>
    );

    function handleLogout() {
        try {
            logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }
}
