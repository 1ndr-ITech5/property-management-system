"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { Bell, Mail, Smartphone, Shield, User, Save, CheckCircle2, Eye, EyeOff, Lock, UserCircle } from "lucide-react";
import Toast from "@/components/Toast";

export default function SettingsPage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Form States
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
    
    // Password States
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

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
                    const nameParts = (data.name || currentUser.displayName || "").split(" ");
                    setFirstName(nameParts[0] || "");
                    setLastName(nameParts.slice(1).join(" ") || "");
                    setGender(data.gender || "");
                    if (data.notifications) {
                        setNotifications(data.notifications);
                    }
                } else {
                    const nameParts = (currentUser.displayName || "").split(" ");
                    setFirstName(nameParts[0] || "");
                    setLastName(nameParts.slice(1).join(" ") || "");
                }
            } catch (e) {
                console.error("Error fetching settings:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [currentUser]);

    const handleSaveProfile = async () => {
        if (!currentUser || !auth.currentUser) return;
        
        const fullName = `${firstName} ${lastName}`.trim();
        if (!fullName) {
            setToast({ message: "Full name is required.", type: "error" });
            return;
        }

        setSaving(true);
        try {
            // 1. Update Auth
            await updateProfile(auth.currentUser, { displayName: fullName });

            // 2. Update Firestore
            await setDoc(doc(db, "users", currentUser.uid), {
                name: fullName,
                gender: gender,
                notifications: notifications,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setToast({ message: "Profile updated successfully!", type: "success" });
        } catch (e) {
            setToast({ message: "Failed to update profile.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentUser || !auth.currentUser || !currentUser.email) return;

        if (newPassword !== confirmPassword) {
            setToast({ message: "Passwords do not match.", type: "error" });
            return;
        }
        if (newPassword.length < 6) {
            setToast({ message: "New password too short.", type: "error" });
            return;
        }

        setSaving(true);
        try {
            // 1. Re-authenticate
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);

            // 2. Update Password
            await updatePassword(auth.currentUser, newPassword);
            
            setNewPassword("");
            setConfirmPassword("");
            setCurrentPassword("");
            setToast({ message: "Password updated successfully!", type: "success" });
        } catch (e: any) {
            console.error(e);
            if (e.code === 'auth/wrong-password') {
                setToast({ message: "Incorrect current password.", type: "error" });
            } else {
                setToast({ message: "Security update failed.", type: "error" });
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

    const sectionCardStyle = "glass-panel rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl transition-all hover:border-white/20 mb-8";

    return (
        <div className="pt-2 pb-20 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Account Settings</h1>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Personal Information & Security</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* 1. PERSONAL INFORMATION */}
                <div className={sectionCardStyle}>
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <UserCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Personal Information</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Details visible across the system</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                        >
                            Update Profile
                        </button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                            <div className="flex gap-3">
                                {["Male", "Female", "Other"].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g as any)}
                                        className={`flex-1 py-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${
                                            gender === g ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10" : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                                        }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PASSWORD SECURITY */}
                <div className={sectionCardStyle}>
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Security</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Secure password management</p>
                            </div>
                        </div>
                        <button
                            onClick={handleUpdatePassword}
                            disabled={saving || !currentPassword}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                        >
                            Change Password
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                            <input 
                                type={showPasswords ? "text" : "password"} 
                                value={currentPassword} 
                                onChange={e => setCurrentPassword(e.target.value)} 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-rose-500/50 transition-all shadow-inner"
                                placeholder="Enter current password to verify"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                <input type={showPasswords ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <input type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                            >
                                {showPasswords ? <><EyeOff className="w-3 h-3" /> Hide Passwords</> : <><Eye className="w-3 h-3" /> Show Passwords</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. NOTIFICATIONS TOGGLES */}
                <div className={sectionCardStyle}>
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Notifications</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">System & Alert Preferences</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveProfile} // Reuses general save logic
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                        >
                            Save Alerts
                        </button>
                    </div>
                    <div className="p-8 space-y-4">
                        {[
                            { key: 'emailAlerts', label: 'Email Notifications', icon: Mail },
                            { key: 'pushNotifications', label: 'Push Notifications', icon: Smartphone }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold text-white">{item.label}</span>
                                </div>
                                <button 
                                    onClick={() => toggleNotification(item.key as any)}
                                    className={`w-12 h-7 rounded-full p-1 transition-all ${notifications[item.key as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
