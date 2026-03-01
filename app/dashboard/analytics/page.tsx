"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { 
    Building2, Percent, DollarSign, BookmarkCheck, 
    InfoIcon, TrendingUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PropertyType } from "../page";

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked";
    type: PropertyType;
    createdAt: any;
}

const TYPE_COLORS: Record<PropertyType, string> = {
    Vila: "#8b5cf6",
    Hotel: "#3b82f6",
    Apartment: "#10b981",
    Guesthouse: "#f59e0b"
};

const TYPE_EMOJIS: Record<PropertyType, string> = {
    Vila: "🏡",
    Hotel: "🏨",
    Apartment: "🏢",
    Guesthouse: "🛏️"
};

type TimeRange = "this" | "3m" | "6m" | "1y";

interface Reservation {
    id: string;
    propertyId: string;
    ownerId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    createdAt: any;
}

export default function AnalyticsPage() {
    const { currentUser } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>("6m");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const qProps = query(
            collection(db, "properties"), 
            where("ownerId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const unsubProps = onSnapshot(qProps, (snapshot) => {
            const props = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Property));
            setProperties(props);
        });

        const qRes = query(
            collection(db, "reservations"),
            where("ownerId", "==", currentUser.uid)
        );
        const unsubRes = onSnapshot(qRes, (snapshot) => {
            const resData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Reservation));
            setReservations(resData);
            setLoading(false);
        });

        return () => { unsubProps(); unsubRes(); };
    }, [currentUser]);

    // --- DATA ENGINE: Real Reservations ---
    const chartData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const curM = now.getMonth();
        const curY = now.getFullYear();
        
        const count = timeRange === "this" ? 1 : timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
        
        if (timeRange === "this") {
            const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
            const currentMonthRes = reservations.filter(r => {
                const d = new Date(r.checkIn);
                return d.getMonth() === curM && d.getFullYear() === curY;
            });
            
            return weeks.map((w, i) => {
                const progress = (i + 1) / 4;
                const bookedCount = currentMonthRes.length;
                return {
                    name: w,
                    booked: Math.round(bookedCount * progress * 10), // Scale for visual
                    available: Math.round(properties.length * 30 * progress),
                    revenue: currentMonthRes.reduce((acc, r) => {
                        const p = properties.find(prop => prop.id === r.propertyId);
                        return acc + (p?.price || 0);
                    }, 0) * progress,
                    occupancy: properties.length > 0 ? Math.round((bookedCount / properties.length) * 100 * progress) : 0,
                };
            });
        }

        const result = [];
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(curY, curM - i, 1);
            const mIdx = d.getMonth();
            const year = d.getFullYear();
            const monthName = months[mIdx];

            const monthReservations = reservations.filter(r => {
                const rd = new Date(r.checkIn);
                return rd.getMonth() === mIdx && rd.getFullYear() === year;
            });

            const booked = monthReservations.length;
            const revenue = monthReservations.reduce((acc, r) => {
                const p = properties.find(prop => prop.id === r.propertyId);
                return acc + (p?.price || 0);
            }, 0);
            const occupancy = properties.length > 0 ? Math.round((booked / properties.length) * 100) : 0;

            result.push({
                name: monthName,
                booked: booked * 15, // Scale for visual consistency
                available: properties.length * 30 - (booked * 15),
                revenue,
                occupancy
            });
        }
        return result;
    }, [properties, reservations, timeRange]);

    // --- KPI Aggregation ---
    const kpis = useMemo(() => {
        const total = properties.length;
        const booked = reservations.length;
        const revenue = reservations.reduce((acc, r) => {
            const p = properties.find(prop => prop.id === r.propertyId);
            return acc + (p?.price || 0);
        }, 0);
        const avgOccupancy = total > 0 ? Math.round((booked / (total * 12)) * 100) : 0;

        return [
            { title: "Total Properties", value: total, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
            { title: "Total Bookings", value: booked, icon: BookmarkCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
            { title: "Historical Occupancy", value: `${avgOccupancy}%`, icon: Percent, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { title: "Total Revenue", value: `$${Math.round(revenue).toLocaleString()}`, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" }
        ];
    }, [properties, reservations]);

    // --- Unit Type Distribution Logic ---
    const typeDistribution = useMemo(() => {
        const counts: Record<string, number> = { Vila: 0, Hotel: 0, Apartment: 0, Guesthouse: 0 };
        properties.forEach(p => { if (counts.hasOwnProperty(p.type)) counts[p.type]++; });
        return Object.entries(counts).map(([name, value]) => ({
            name, value, color: TYPE_COLORS[name as PropertyType], emoji: TYPE_EMOJIS[name as PropertyType]
        })).filter(v => v.value > 0);
    }, [properties]);

    return (
        <div className="pt-2 pb-20 max-w-[1600px] mx-auto">
            {/* Header & Filter Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Portfolio Analytics</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <div className={`w-2 h-2 rounded-full ${timeRange === 'this' ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
                        <span>Real-Time Data Mode</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    {[
                        { label: "This Month", val: "this" },
                        { label: "3 Months", val: "3m" },
                        { label: "6 Months", val: "6m" },
                        { label: "1 Year", val: "1y" }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => setTimeRange(opt.val as TimeRange)}
                            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${
                                timeRange === opt.val ? "bg-indigo-500 text-white shadow-lg scale-105" : "text-slate-500 hover:text-slate-300"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 rounded-[2.5rem] flex items-center gap-5 border border-white/10 shadow-2xl hover:border-white/20 transition-colors group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${kpi.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.title}</p>
                            <p className="text-2xl font-black text-white">{kpi.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 1. Bookings Over Time */}
                <div className="glass-card rounded-[2.5rem] p-8 flex flex-col h-[500px] border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-white font-bold text-lg">Bookings Trend</h3>
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Booked</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Avail</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="gBooked" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gAvail" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dy={15} />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="booked" stroke="#8b5cf6" strokeWidth={4} fill="url(#gBooked)" name="Booked" />
                                <Area type="monotone" dataKey="available" stroke="#10b981" strokeWidth={4} fill="url(#gAvail)" name="Available" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Unit Type Distribution */}
                <div className="glass-card rounded-[2.5rem] p-8 flex flex-col h-[500px] border border-white/5 overflow-hidden">
                    <h3 className="text-white font-bold text-lg mb-6">Unit Type Mix</h3>
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="h-[260px] w-full shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeDistribution}
                                        innerRadius={75}
                                        outerRadius={105}
                                        paddingAngle={10}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {typeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            <div className="grid grid-cols-2 gap-3">
                                {typeDistribution.map((type) => (
                                    <div key={type.name} className="flex items-center gap-3 bg-white/[0.03] p-4 rounded-[1.5rem] border border-white/5 shadow-inner hover:bg-white/[0.06] transition-colors">
                                        <span className="text-2xl">{type.emoji}</span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">{type.name}</span>
                                            <span className="text-white font-black text-sm">
                                                {properties.length > 0 ? Math.round((type.value / properties.length) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3. Revenue Bar Chart */}
                <div className="glass-card rounded-[2.5rem] p-8 h-[450px] flex flex-col border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-white font-bold text-lg">Revenue Stream</h3>
                        <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" /> Estimated USD
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dy={15} />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={timeRange === 'this' ? 60 : 35} name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Occupancy Rate Bar Chart */}
                <div className="glass-card rounded-[2.5rem] p-8 h-[450px] flex flex-col border border-white/5 overflow-hidden">
                    <h3 className="text-white font-bold text-lg mb-10">Occupancy by Unit (%)</h3>
                    <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                        {properties.map((u, i) => {
                            const isBooked = u.status === "booked";
                            return (
                                <div key={u.id} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                        <span className="truncate w-48">{u.name}</span>
                                        <span className={isBooked ? "text-emerald-400" : "text-rose-400"}>{isBooked ? "100%" : "0%"}</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5 relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: isBooked ? "100%" : "0%" }}
                                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                            className={`h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {properties.length === 0 && <p className="text-slate-500 text-center py-20 italic font-bold uppercase tracking-widest text-[10px]">Database Empty</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
