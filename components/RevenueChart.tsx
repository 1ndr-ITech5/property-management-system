"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

const data = [
    { name: 'Jan', revenue: 4000, occupancy: 2400 },
    { name: 'Feb', revenue: 3000, occupancy: 1398 },
    { name: 'Mar', revenue: 2000, occupancy: 9800 },
    { name: 'Apr', revenue: 2780, occupancy: 3908 },
    { name: 'May', revenue: 1890, occupancy: 4800 },
    { name: 'Jun', revenue: 2390, occupancy: 3800 },
    { name: 'Jul', revenue: 3490, occupancy: 4300 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-4 rounded-xl border border-white/20 shadow-2xl">
                <p className="text-white font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-300 capitalize">{entry.name}:</span>
                        <span className="text-white font-bold ml-auto">
                            {entry.name === 'revenue' ? `$${entry.value}` : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function RevenueChart() {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel p-6 rounded-3xl w-full h-[400px] mb-8"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Performance Insights</h3>
                    <p className="text-sm text-slate-400">Revenue & Occupancy trends</p>
                </div>
                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50">
                    <option value="6m" className="bg-slate-900">Last 6 Months</option>
                    <option value="1y" className="bg-slate-900">Last Year</option>
                </select>
            </div>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="occupancy" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorOccupancy)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
