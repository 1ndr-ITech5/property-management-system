"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const mockOccupancyData = [
    { month: 'Jan', occupancy: 65, revenue: 12000 },
    { month: 'Feb', occupancy: 70, revenue: 14500 },
    { month: 'Mar', occupancy: 82, revenue: 18000 },
    { month: 'Apr', occupancy: 85, revenue: 19200 },
    { month: 'May', occupancy: 95, revenue: 24000 },
    { month: 'Jun', occupancy: 100, revenue: 28000 },
];

const mockPropertyTypes = [
    { name: 'Villas', value: 40, color: '#8b5cf6' },
    { name: 'Condos', value: 35, color: '#3b82f6' },
    { name: 'Cabins', value: 15, color: '#10b981' },
    { name: 'Lofts', value: 10, color: '#f43f5e' },
];

export default function AnalyticsPage() {
    return (
        <div className="pt-2">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Portfolio Analytics</h1>
                <p className="text-slate-400 text-sm">Deep insights into your revenue and occupancy trends.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-[2rem] p-8 lg:col-span-2 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-opacity group-hover:bg-purple-500/20" />

                    <h3 className="text-white font-bold mb-6 text-lg relative z-10">Occupancy vs Revenue (Last 6 Months)</h3>
                    <div className="h-72 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff' }}
                                    itemStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                <Area type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOccupancy)" name="Occupancy %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-[2rem] p-8 relative overflow-hidden group flex flex-col items-center justify-center"
                >
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -ml-24 -mb-24 transition-opacity group-hover:bg-emerald-500/20" />
                    <h3 className="text-white font-bold text-lg mb-6 w-full text-left relative z-10">Property Distribution</h3>

                    <div className="h-48 w-full relative z-10 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockPropertyTypes}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {mockPropertyTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-sm font-medium relative z-10">
                        {mockPropertyTypes.map((type) => (
                            <div key={type.name} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                <span className="text-slate-300">{type.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
