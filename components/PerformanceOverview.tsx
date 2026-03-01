"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    TrendingUp, 
    TrendingDown, 
    X,
    Maximize2,
    BarChart3,
    CalendarDays,
    Home,
    DollarSign,
    Activity,
    CheckCircle2
} from "lucide-react";
import { 
    LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie
} from 'recharts';

interface KPIData {
    id: string;
    title: string;
    value: string | number;
    trend: string;
    trendUp: boolean;
    icon: any;
    color: string;
    chartData: { name: string; val: number }[];
    details: {
        label: string;
        value: string | number;
        color: string;
    }[];
}

interface PerformanceOverviewProps {
    stats: KPIData[];
}

// --- SUB-COMPONENT: KPI Detail Modal ---
function KPIModal({ isOpen, onClose, kpi }: { isOpen: boolean; onClose: () => void; kpi: KPIData | null }) {
    if (!kpi) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose} 
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                        className="w-full max-w-5xl glass-panel overflow-hidden rounded-[3rem] relative z-10 border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl bg-white/5 ${kpi.color} shadow-lg`}>
                                    <kpi.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">{kpi.title} Report</h2>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed Performance Analytics</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/10 text-slate-400 transition-all active:scale-90">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Summary Section */}
                                <div className="space-y-6">
                                    <div className="glass-card p-8 rounded-[2rem] border border-white/10 shadow-xl">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Current Value</p>
                                        <h3 className="text-5xl font-black text-white mb-4">{kpi.value}</h3>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black ${
                                            kpi.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                            {kpi.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {kpi.trend}
                                            <span className="text-[10px] text-slate-500 uppercase ml-1">Trend</span>
                                        </div>
                                    </div>

                                    <div className="glass-card p-8 rounded-[2rem] border border-white/10 shadow-xl">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Breakdown by Category</p>
                                        <div className="space-y-5">
                                            {kpi.details.map((detail, idx) => (
                                                <div key={idx} className="flex justify-between items-center group">
                                                    <span className="text-sm font-bold text-slate-400 group-hover:text-slate-300 transition-colors">{detail.label}</span>
                                                    <span className={`text-sm font-black ${detail.color}`}>{detail.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart Section */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="glass-card p-8 rounded-[2rem] border border-white/10 shadow-xl h-[450px] flex flex-col">
                                        <div className="flex items-center justify-between mb-10">
                                            <h4 className="text-white font-bold text-lg">Performance Trend</h4>
                                            <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 6 Periods</div>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={kpi.chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dy={15} />
                                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '20px', border: 'none' }}
                                                    />
                                                    <Bar dataKey="val" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40}>
                                                        {kpi.chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === kpi.chartData.length - 1 ? '#818cf8' : '#312e81'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                            <button onClick={onClose} className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-[0.2em] transition-all">Close Report</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default function PerformanceOverview({ stats }: PerformanceOverviewProps) {
    const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {stats.map((item, i) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedKPI(item)}
                        className="glass-card p-5 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer shadow-xl active:scale-[0.98]"
                    >
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/[0.02] transition-colors" />
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl bg-white/5 ${item.color} transition-all group-hover:scale-110 group-hover:bg-white/10`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="h-10 w-20 opacity-60 group-hover:opacity-100 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={item.chartData}>
                                        <Line 
                                            type="monotone" 
                                            dataKey="val" 
                                            stroke={item.trendUp ? "#10b981" : "#f43f5e"} 
                                            strokeWidth={3} 
                                            dot={false} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">
                                {item.title}
                            </p>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                                {item.value}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                        item.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                        {item.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {item.trend}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">Trend</span>
                                </div>
                                <Maximize2 className="w-3 h-3 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                            </div>
                        </div>

                        {/* Background decorative element */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-white/[0.03] transition-all" />
                    </motion.div>
                ))}
            </div>

            <KPIModal 
                isOpen={!!selectedKPI} 
                onClose={() => setSelectedKPI(null)} 
                kpi={selectedKPI} 
            />
        </>
    );
}
