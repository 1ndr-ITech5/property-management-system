"use client";

import { Search, Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function GlassHeader() {
    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="w-full flex items-center justify-between px-8 py-6 mb-8"
        >
            <div className="flex items-center gap-4">
                {/* Mobile menu button (hidden on desktop) */}
                <button className="md:hidden p-2 text-slate-400 hover:text-white glass-card rounded-xl">
                    <Menu className="w-5 h-5" />
                </button>

                <div className="hidden md:flex relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search properties, guests..."
                        className="pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all w-80 text-sm text-white placeholder-slate-400 shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-3 text-slate-400 hover:text-white glass-card rounded-xl group transition-all">
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                </button>

                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white">Jessica Doe</p>
                        <p className="text-xs text-slate-400">Admin</p>
                    </div>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/50 p-0.5">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica"
                            alt="User Avatar"
                            className="w-full h-full object-cover rounded-full bg-slate-800"
                        />
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
