"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword } from "firebase/auth";
import { Bell, Mail, Smartphone, Shield, User, Save, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Toast from "@/components/Toast";

export default function SettingsPage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Form States
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        newBookings: true,
        cancellations: true,
        statusChanges: false,
        pushNotifications: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({ 
                        name: data.name || currentUser.displayName || "", 
                        email: data.email || currentUser.email || "" 
                    });
                    if (data.notifications) {
                        setNotifications(data.notifications);
                    }
                } else {
                    setProfile({ name: currentUser.displayName || "", email: currentUser.email || "" });
                }
            } catch (e) {
                console.error("Error fetching settings:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser || !auth.currentUser) return;
        setSaving(true);
        try {
            // 1. Update Auth Profile (Name)
            if (profile.name !== currentUser.displayName) {
                await updateProfile(auth.currentUser, { displayName: profile.name });
            }

            // 2. Update Password if provided
            if (password.trim().length > 0) {
                if (password.length < 6) {
                    setToast({ message: "Password must be at least 6 characters.", type: "error" });
                    setSaving(false);
                    return;
                }
                await updatePassword(auth.currentUser, password);
                setPassword("");
            }

            // 3. Update Firestore
            await setDoc(doc(db, "users", currentUser.uid), {
                name: profile.name,
                email: profile.email,
                notifications: notifications,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setToast({ message: "Settings and security updated!", type: "success" });
        } catch (e: any) {
            console.error("Save error:", e);
            if (e.code === 'auth/requires-recent-login') {
                setToast({ message: "Please log out and back in to change password.", type: "error" });
            } else {
                setToast({ message: "Failed to save settings.", type: "error" });
            }
        } finally {
            setSaving(false);
        }
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const sectionCardStyle = "glass-panel rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl transition-all hover:border-white/20";

    return (
        <div className="pt-2 pb-20 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Account Settings</h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Personalize your PMS experience</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Profile & Security Section */}
                <div className={sectionCardStyle}>
                    <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Profile & Security</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage your identity and credentials</p>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                type="text" 
                                value={profile.name}
                                onChange={e => setProfile({...profile, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password (Optional)</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address (Read Only)</label>
                            <input 
                                type="email" 
                                value={profile.email}
                                readOnly
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-500 font-bold outline-none cursor-not-allowed opacity-60"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className={sectionCardStyle}>
                    <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Notifications</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure your alert preferences</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">Email Notifications</p>
                                    <p className="text-xs text-slate-500 mt-1">Receive core updates via your registered email.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleNotification('emailAlerts')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${notifications.emailAlerts ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800'}`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${notifications.emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">Push Notifications</p>
                                    <p className="text-xs text-slate-500 mt-1">Instant browser alerts for high-priority actions.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleNotification('pushNotifications')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${notifications.pushNotifications ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800'}`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${notifications.pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="h-px bg-white/5 my-8" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'newBookings', label: 'New Reservations', sub: 'Instant alerts for every new booking' },
                                { key: 'cancellations', label: 'Cancellations', sub: 'Be notified when a guest cancels' },
                                { key: 'statusChanges', label: 'Property Updates', sub: 'Status and maintenance changes' }
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => toggleNotification(item.key as any)}
                                    className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all text-left group ${
                                        notifications[item.key as keyof typeof notifications] 
                                        ? 'bg-indigo-500/10 border-indigo-500/30' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        notifications[item.key as keyof typeof notifications] ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500'
                                    }`}>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-sm truncate">{item.label}</p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate">{item.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Security Section Placeholder */}
                <div className="glass-panel rounded-[2.5rem] p-8 border border-white/10 opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Advanced Security</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Coming soon in PMS Premium</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
