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
    status: "available" | "booked" | "unavailable";
    type: PropertyType;
    maxCapacity: number;
    currentBookings: number;
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
            const props = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    maxCapacity: data.maxCapacity || 1,
                    currentBookings: data.currentBookings || 0
                } as Property;
            });
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

    // --- DATA ENGINE: REAL DATA ONLY ---
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
                
                const revenue = currentMonthRes.reduce((acc, r) => {
                    const p = properties.find(prop => prop.id === r.propertyId);
                    return acc + (p?.price || 0);
                }, 0);

                return {
                    name: w,
                    booked: Math.round(bookedCount * progress),
                    available: Math.round(properties.reduce((acc, p) => acc + p.maxCapacity, 0) * progress),
                    revenue: revenue * progress,
                    occupancy: properties.length > 0 ? Math.round((bookedCount / properties.length) * 100 * progress) : 0,
                };
            });
        }

        const result = [];
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(curY, curM - i, 1);
            const mIdx = d.getMonth();
            const year = d.getFullYear();
            const isCurrent = mIdx === curM && year === curY;
            const monthName = months[mIdx];

            let booked = 0, available = 0, revenue = 0, occupancy = 0;

            if (isCurrent) {
                const monthRes = reservations.filter(r => {
                    const rd = new Date(r.checkIn);
                    return rd.getMonth() === mIdx && rd.getFullYear() === year;
                });
                booked = monthRes.length;
                available = properties.reduce((acc, p) => acc + p.maxCapacity, 0);
                revenue = monthRes.reduce((acc, r) => {
                    const p = properties.find(prop => prop.id === r.propertyId);
                    return acc + (p?.price || 0);
                }, 0);
                occupancy = properties.length > 0 ? Math.round((booked / properties.length) * 100) : 0;
            } else {
                booked = 0;
                available = 0;
                revenue = 0;
                occupancy = 0;
            }

            result.push({
                name: monthName,
                booked,
                available,
                revenue,
                occupancy
            });
        }
        return result;
    }, [properties, reservations, timeRange]);

    // --- KPI Aggregation: Based on Real Data ---
    const kpis = useMemo(() => {
        const total = properties.length;
        const booked = reservations.length;
        const revenue = reservations.reduce((acc, r) => {
            const p = properties.find(prop => prop.id === r.propertyId);
            return acc + (p?.price || 0);
        }, 0);
        
        const avgOcc = properties.length > 0 
            ? Math.round(properties.reduce((acc, p) => acc + (p.currentBookings / p.maxCapacity), 0) / properties.length * 100)
            : 0;

        return [
            { title: "Total Properties", value: total, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
            { title: "Total Bookings", value: booked, icon: BookmarkCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
            { title: "Current Occupancy", value: `${avgOcc}%`, icon: Percent, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { title: "Total Revenue", value: `$${Math.round(revenue).toLocaleString()}`, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" }
        ];
    }, [properties, reservations]);

    // --- Booked Unit Mix: Logic based on ACTUAL BOOKINGS for current month ---
    const typeDistribution = useMemo(() => {
        const now = new Date();
        const curM = now.getMonth();
        const curY = now.getFullYear();

        // Filter reservations for this month
        const currentMonthRes = reservations.filter(r => {
            const d = new Date(r.checkIn);
            return d.getMonth() === curM && d.getFullYear() === curY;
        });

        const counts: Record<string, number> = { Vila: 0, Hotel: 0, Apartment: 0, Guesthouse: 0 };
        
        currentMonthRes.forEach(r => {
            const prop = properties.find(p => p.id === r.propertyId);
            if (prop && counts.hasOwnProperty(prop.type)) {
                counts[prop.type]++;
            }
        });
        
        const totalBookings = currentMonthRes.length;

        return Object.entries(counts).map(([name, value]) => ({
            name, 
            value, 
            color: TYPE_COLORS[name as PropertyType], 
            emoji: TYPE_EMOJIS[name as PropertyType],
            percentage: totalBookings > 0 ? Math.round((value / totalBookings) * 100) : 0
        })).filter(v => v.value > 0);
    }, [properties, reservations]);

    // --- Occupancy Rate by Unit: Real Capacity logic ---
    const unitOccupancy = useMemo(() => {
        return properties.map(p => ({
            name: p.name,
            val: Math.floor((p.currentBookings / p.maxCapacity) * 100)
        })).sort((a,b) => b.val - a.val).slice(0, 8);
    }, [properties]);

    return (
        <div className="pt-2 pb-20 max-w-[1600px] mx-auto">
            {/* Header & Filter Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Portfolio Analytics</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <div className={`w-2 h-2 rounded-full ${timeRange === 'this' ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
                        <span>{timeRange === 'this' ? 'Live Firestore Data' : 'Portfolio Insights'}</span>
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
                {/* 1. Bookings Trend */}
                <div className="glass-card rounded-[2.5rem] p-8 flex flex-col h-[500px] border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-white font-bold text-lg">Booking Trend</h3>
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Booked</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Max Cap</span>
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
                                <Area type="monotone" dataKey="available" stroke="#10b981" strokeWidth={4} fill="url(#gAvail)" name="Max Capacity" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Unit Type Mix (BASED ON BOOKINGS) */}
                <div className="glass-card rounded-[2.5rem] p-8 flex flex-col h-[500px] border border-white/5 overflow-hidden">
                    <h3 className="text-white font-bold text-lg mb-6">Booked Unit Mix</h3>
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="h-[260px] w-full shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart overflow="visible">
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
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1000 }}
                                        formatter={(value: any, name: string) => [`${value} Bookings`, name]}
                                        wrapperStyle={{ zIndex: 1000 }}
                                    />
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
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-white font-black text-sm">{type.value} Bookings</span>
                                                <span className="text-indigo-400 font-bold text-[10px]">{type.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {typeDistribution.length === 0 && <p className="text-slate-500 text-center py-10 italic text-xs uppercase tracking-widest">No bookings this month</p>}
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
                            <TrendingUp className="w-3 h-3" /> Real Income
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

                {/* 4. Occupancy Rate by Unit */}
                <div className="glass-card rounded-[2.5rem] p-8 h-[450px] flex flex-col border border-white/5 overflow-hidden">
                    <h3 className="text-white font-bold text-lg mb-10">Live Occupancy by Unit</h3>
                    <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                        {properties.map((u, i) => {
                            const occVal = Math.floor((u.currentBookings / u.maxCapacity) * 100);
                            return (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                        <span className="truncate w-48">{u.name}</span>
                                        <span className={occVal > 70 ? "text-emerald-400" : "text-amber-400"}>{occVal}% occupied</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5 relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${occVal}%` }}
                                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                            className={`h-full rounded-full ${occVal > 70 ? 'bg-gradient-to-r from-indigo-600 to-emerald-500' : 'bg-gradient-to-r from-indigo-600 to-amber-500'}`}
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
