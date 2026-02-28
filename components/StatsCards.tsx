"use client";

import { Building2, DollarSign, Percent } from "lucide-react";
import { motion } from "framer-motion";

interface StatsProps {
    totalProperties: number;
    occupancyRate: string;
    monthlyRevenue: number;
}

export default function StatsCards({ totalProperties, occupancyRate, monthlyRevenue }: StatsProps) {
    const cards = [
        {
            title: "Total Properties",
            value: totalProperties.toString(),
            trend: "+12%",
            trendUp: true,
            icon: Building2,
            color: "from-blue-500 to-cyan-500",
            shadow: "shadow-cyan-500/20"
        },
        {
            title: "Occupancy Rate",
            value: occupancyRate,
            trend: "+5.2%",
            trendUp: true,
            icon: Percent,
            color: "from-emerald-400 to-teal-500",
            shadow: "shadow-emerald-500/20"
        },
        {
            title: "Est. Revenue",
            value: `$${monthlyRevenue.toLocaleString()}`,
            trend: "-2.4%",
            trendUp: false,
            icon: DollarSign,
            color: "from-purple-500 to-indigo-500",
            shadow: "shadow-purple-500/20"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    className="glass-card p-6 rounded-3xl relative overflow-hidden group"
                >
                    {/* Subtle background glow effect */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 font-medium mb-1">{card.title}</p>
                            <h3 className="text-3xl font-bold text-white">{card.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${card.color} ${card.shadow} shadow-lg`}>
                            <card.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${card.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {card.trend}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">vs last month</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
