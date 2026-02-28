"use client";

import { motion } from "framer-motion";

export default function SettingsPage() {
    return (
        <div className="pt-2 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Account Settings</h1>
                <p className="text-slate-400 text-sm">Manage preferences, billing, and security settings.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Profile Settings */}
                <div className="glass-panel rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white">Profile Information</h2>
                        <p className="text-sm text-slate-400 mt-1">Update your personal details and public profile.</p>
                    </div>
                    <div className="p-8 bg-black/20 text-center py-12">
                        <span className="text-4xl">⚙️</span>
                        <p className="text-slate-400 mt-4 font-medium">Profile configuration module coming soon.</p>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="glass-panel rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white">Notifications</h2>
                        <p className="text-sm text-slate-400 mt-1">Control email alerts and push notifications.</p>
                    </div>
                    <div className="p-8 bg-black/20 text-center py-12">
                        <span className="text-4xl">🔔</span>
                        <p className="text-slate-400 mt-4 font-medium">Notification preferences coming soon.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
