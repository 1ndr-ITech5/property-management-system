"use client";

import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-4 rounded-xl border border-white/20 shadow-2xl">
                <p className="text-white font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 text-sm mb-1 last:mb-0">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-300 capitalize">{entry.name}:</span>
                        <span className="text-white font-bold ml-auto">
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Static random data for both categories to ensure the chart is never empty
const STATIC_BASE_BOOKED: { [key: string]: number } = {
    "Jan": 45, "Feb": 52, "Mar": 48, "Apr": 61, "May": 55, "Jun": 67,
    "Jul": 72, "Aug": 65, "Sep": 78, "Oct": 82, "Nov": 75, "Dec": 90
};

const STATIC_BASE_AVAILABLE: { [key: string]: number } = {
    "Jan": 30, "Feb": 25, "Mar": 35, "Apr": 20, "May": 28, "Jun": 15,
    "Jul": 12, "Aug": 22, "Sep": 10, "Oct": 8, "Nov": 18, "Dec": 5
};

export default function BookingsChart() {
    const [properties, setProperties] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState("6m");

    useEffect(() => {
        const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const props = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProperties(props);
        });
        return () => unsubscribe();
    }, []);

    const chartData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const dataMap: { [key: string]: { booked: number, available: number } } = {};

        // Initialize with static random base data for the selected range
        const count = timeRange === "6m" ? 6 : 12;
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[d.getMonth()];
            dataMap[monthName] = {
                booked: STATIC_BASE_BOOKED[monthName] || 0,
                available: STATIC_BASE_AVAILABLE[monthName] || 0
            };
        }

        // Increment counts with real-time Firestore data
        properties.forEach(prop => {
            if (prop.createdAt) {
                const date = prop.createdAt.toDate ? prop.createdAt.toDate() : new Date(prop.createdAt);
                const monthName = months[date.getMonth()];
                if (dataMap.hasOwnProperty(monthName)) {
                    if (prop.status === "booked") {
                        dataMap[monthName].booked++;
                    } else if (prop.status === "available") {
                        dataMap[monthName].available++;
                    }
                }
            }
        });

        return Object.keys(dataMap).map(name => ({
            name,
            booked: dataMap[name].booked,
            available: dataMap[name].available
        }));
    }, [properties, timeRange]);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel p-6 rounded-3xl w-full h-[400px] mb-8"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Property Insights</h3>
                    <p className="text-sm text-slate-400">Booked vs Available trends</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-slate-300">Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-slate-300">Available</span>
                        </div>
                    </div>
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                    >
                        <option value="6m" className="bg-slate-900">Last 6 Months</option>
                        <option value="1y" className="bg-slate-900">Last Year</option>
                    </select>
                </div>
            </div>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="booked" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBooked)" name="booked" />
                        <Area type="monotone" dataKey="available" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvailable)" name="available" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
