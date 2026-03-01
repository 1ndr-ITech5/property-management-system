"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Menu, Home, User, ArrowRight, X, Clock, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Activity, markActivityAsRead } from "@/lib/activity";

// --- SUB-COMPONENT: Live Clock ---
function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 glass-card rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none mb-1">System Time</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white leading-none">{formatTime(time)}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[11px] font-bold text-slate-400 leading-none">{formatDate(time)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GlassHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const [searchTerm, setSearchQuery] = useState("");
    const [results, setResults] = useState<{ properties: any[], reservations: any[] }>({ properties: [], reservations: [] });
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const { currentUser } = useAuth();
    const router = useRouter();
    const searchDropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const [allData, setAllData] = useState<{ properties: any[], reservations: any[] }>({ properties: [], reservations: [] });

    useEffect(() => {
        if (!currentUser) return;

        // Fetch properties & reservations for search
        const qProps = query(collection(db, "properties"), where("ownerId", "==", currentUser.uid));
        const unsubProps = onSnapshot(qProps, (snap) => {
            const p = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllData(prev => ({ ...prev, properties: p }));
        });

        const qRes = query(collection(db, "reservations"), where("ownerId", "==", currentUser.uid));
        const unsubRes = onSnapshot(qRes, (snap) => {
            const r = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllData(prev => ({ ...prev, reservations: r }));
        });

        // Fetch Notifications
        const qAct = query(
            collection(db, "activities"), 
            where("ownerId", "==", currentUser.uid),
            orderBy("createdAt", "desc"),
            limit(10)
        );
        const unsubAct = onSnapshot(qAct, (snap) => {
            const actData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
            setActivities(actData);
            setUnreadCount(actData.filter(a => !a.isRead).length);
        });

        return () => { unsubProps(); unsubRes(); unsubAct(); };
    }, [currentUser]);

    useEffect(() => {
        if (searchTerm.trim().length > 1) {
            const query = searchTerm.toLowerCase();
            const filteredProps = allData.properties.filter(p => 
                p.name?.toLowerCase().includes(query) || 
                p.location?.toLowerCase().includes(query) ||
                p.type?.toLowerCase().includes(query)
            ).slice(0, 5);

            const filteredRes = allData.reservations.filter(r => 
                r.guestName?.toLowerCase().includes(query)
            ).slice(0, 5);

            setResults({ properties: filteredProps, reservations: filteredRes });
            setIsSearchDropdownOpen(true);
        } else {
            setIsSearchDropdownOpen(false);
        }
    }, [searchTerm, allData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setIsSearchDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigate = (path: string) => {
        router.push(path);
        setIsSearchDropdownOpen(false);
        setIsNotificationOpen(false);
        setSearchQuery("");
    };

    const handleMarkAsRead = async (id: string) => {
        if (id) await markActivityAsRead(id);
    };

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="w-full flex items-center justify-between px-4 md:px-8 py-6 mb-8 relative z-[100]"
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-400 hover:text-white glass-card rounded-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block relative" ref={searchDropdownRef}>
                        <div className={`relative group transition-all duration-300 ${isSearchDropdownOpen ? 'w-96' : 'w-80'}`}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchTerm.length > 1 && setIsSearchDropdownOpen(true)}
                                placeholder="Search properties, guests..."
                                className="pl-11 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all w-full text-sm text-white placeholder-slate-500 shadow-inner"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {isSearchDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-3 w-full glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl"
                                >
                                    <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {results.properties.length === 0 && results.reservations.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-slate-500 font-medium">No matches found for "{searchTerm}"</p>
                                            </div>
                                        ) : (
                                            <>
                                                {results.properties.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/70">Properties</p>
                                                        {results.properties.map(p => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => handleNavigate('/dashboard/properties')}
                                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group text-left"
                                                            >
                                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                                                                    <Home className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                                                                    <p className="text-[10px] text-slate-500 font-medium truncate">{p.location || p.type}</p>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {results.reservations.length > 0 && (
                                                    <div>
                                                        <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/70">Reservations (Guests)</p>
                                                        {results.reservations.map(r => (
                                                            <button
                                                                key={r.id}
                                                                onClick={() => handleNavigate('/dashboard/calendar')}
                                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group text-left"
                                                            >
                                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                                                                    <User className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-white truncate">{r.guestName}</p>
                                                                    <p className="text-[10px] text-slate-500 font-medium truncate">Starts: {r.checkIn}</p>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <LiveClock />
                </div>
            </div>

            <div className="flex items-center gap-6 relative" ref={notificationRef}>
                <button 
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className={`relative p-3 glass-card rounded-xl group transition-all ${isNotificationOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] font-black text-white items-center justify-center shadow-lg">
                                {unreadCount}
                            </span>
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {isNotificationOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-3 w-80 sm:w-96 glass-panel rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl z-[110]"
                        >
                            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                <h3 className="text-lg font-black text-white">Recent Activity</h3>
                                <button 
                                    className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                                    onClick={() => activities.forEach(a => a.id && markActivityAsRead(a.id))}
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {activities.length === 0 ? (
                                    <div className="p-12 text-center opacity-40">
                                        <Bell className="w-10 h-10 mx-auto mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No activities yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {activities.map((activity) => (
                                            <div 
                                                key={activity.id} 
                                                onClick={() => activity.id && handleMarkAsRead(activity.id)}
                                                className={`p-5 hover:bg-white/[0.03] transition-all cursor-pointer group ${!activity.isRead ? 'bg-indigo-500/[0.02]' : ''}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                        activity.type === 'booking' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        activity.type === 'property' ? 'bg-indigo-500/20 text-indigo-400' :
                                                        'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                        {activity.type === 'booking' ? <CheckCircle2 className="w-5 h-5" /> :
                                                         activity.type === 'property' ? <Home className="w-5 h-5" /> :
                                                         <Trash2 className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className={`text-sm font-bold truncate transition-colors ${!activity.isRead ? 'text-white' : 'text-slate-400'}`}>
                                                                {activity.title}
                                                            </p>
                                                            {!activity.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2 font-medium">
                                                            {activity.message}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                            <Clock className="w-3 h-3" />
                                                            {activity.createdAt?.toDate ? activity.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                                <button className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">View All Analytics</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
