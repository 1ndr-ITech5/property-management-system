"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Sparkles } from "lucide-react";

/* ───────────────── Animated Mini-Chart ───────────────── */
function AnimatedChart() {
    const bars = [35, 55, 45, 70, 60, 85, 75, 90, 65, 80, 95, 70];
    return (
        <div className="flex items-end gap-[3px] h-20">
            {bars.map((height, i) => (
                <motion.div
                    key={i}
                    className="w-2 rounded-t-sm bg-gradient-to-t from-purple-500 to-fuchsia-400"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${height}%`, opacity: 1 }}
                    transition={{
                        delay: 1.2 + i * 0.08,
                        duration: 0.6,
                        type: "spring",
                        stiffness: 100,
                    }}
                />
            ))}
        </div>
    );
}

/* ───────────────── Animated Counter ───────────────── */
function AnimatedCounter({ value, label, prefix = "", delay = 0 }: { value: number; label: string; prefix?: string; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="text-center"
        >
            <motion.p
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.3, duration: 0.4 }}
            >
                {prefix}{value.toLocaleString()}
            </motion.p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mt-1">{label}</p>
        </motion.div>
    );
}

/* ───────────────── Animated Property Cards ───────────────── */
function FloatingPropertyCards() {
    const cards = [
        { name: "Skyline Penthouse", price: 320, status: "booked", emoji: "🏙️" },
        { name: "Lakeside Villa", price: 185, status: "available", emoji: "🏡" },
        { name: "Downtown Loft", price: 240, status: "booked", emoji: "🌆" },
    ];
    return (
        <div className="space-y-2.5">
            {cards.map((card, i) => (
                <motion.div
                    key={card.name}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.2, duration: 0.5 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                >
                    <span className="text-xl">{card.emoji}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{card.name}</p>
                        <p className="text-[10px] text-white/40">${card.price}/night</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${card.status === "available"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}>
                        {card.status}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

/* ───────────────── Animated Donut Ring ───────────────── */
function AnimatedDonut() {
    const segments = [
        { pct: 40, color: "#a855f7" },
        { pct: 25, color: "#d946ef" },
        { pct: 20, color: "#6366f1" },
        { pct: 15, color: "#818cf8" },
    ];
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    return (
        <div className="relative w-24 h-24 mx-auto">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                {segments.map((seg, i) => {
                    const dashLen = (seg.pct / 100) * circumference;
                    const offset = cumulativeOffset;
                    cumulativeOffset += dashLen;
                    return (
                        <motion.circle
                            key={i}
                            cx="40" cy="40" r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                            strokeDashoffset={-offset}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 1.8 + i * 0.15, duration: 0.8 }}
                        />
                    );
                })}
            </svg>
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4, duration: 0.4 }}
            >
                <span className="text-lg font-bold text-white">94%</span>
                <span className="text-[9px] text-white/40 font-bold">OCCUPIED</span>
            </motion.div>
        </div>
    );
}

/* ───────────────── Animated Line Sparkline ───────────────── */
function AnimatedSparkline() {
    const points = "0,30 10,25 20,28 30,15 40,20 50,10 60,18 70,5 80,12 90,8 100,3";
    return (
        <svg viewBox="0 0 100 35" className="w-full h-10 mt-2">
            <motion.polyline
                points={points}
                fill="none"
                stroke="url(#sparkGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 2.0, duration: 1.5 }}
            />
            <defs>
                <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
            </defs>
        </svg>
    );
}


/* ═════════════════ MAIN PAGE ═════════════════ */
export default function Home() {
    return (
        <BackgroundGradientAnimation className="flex flex-col min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-5xl space-y-16">

                {/* ── Hero ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center space-y-6"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-purple-300 backdrop-blur-md"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Property Management System
                    </motion.span>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        Manage your
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
                            entire portfolio
                        </span>
                    </h1>

                    <p className="mx-auto max-w-xl text-lg text-white/50 leading-relaxed font-medium">
                        A streamlined dashboard for property owners. Monitor bookings,
                        track revenue, and manage every unit — all from one place.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-lg shadow-white/10 transition-all duration-300 hover:shadow-white/20 hover:scale-[1.03] text-center"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/signup"
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-sm backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:scale-[1.03] text-center"
                        >
                            Create Account
                        </Link>
                    </div>
                </motion.div>

                {/* ── Animated Dashboard Preview ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="rounded-3xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-lg p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                    {/* Fake window bar */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                        <div className="flex-1 mx-4 h-5 rounded-md bg-white/5 border border-white/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Left: Stats + Chart */}
                        <div className="md:col-span-2 space-y-5">
                            {/* KPI Row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 24, label: "Properties", prefix: "" },
                                    { value: 89420, label: "Revenue", prefix: "$" },
                                    { value: 94, label: "Occupancy", prefix: "", suffix: "%" },
                                ].map((kpi, i) => (
                                    <motion.div
                                        key={kpi.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 + i * 0.12, duration: 0.5 }}
                                        className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                                    >
                                        <AnimatedCounter
                                            value={kpi.value}
                                            label={kpi.label}
                                            prefix={kpi.prefix}
                                            delay={1.0 + i * 0.15}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Bar Chart */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1, duration: 0.5 }}
                                className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[11px] text-white/50 uppercase tracking-wider font-bold">Monthly Revenue</p>
                                    <motion.span
                                        className="text-[10px] text-emerald-400 font-bold"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2.2 }}
                                    >
                                        ↑ 12.4%
                                    </motion.span>
                                </div>
                                <AnimatedChart />
                                <AnimatedSparkline />
                            </motion.div>
                        </div>

                        {/* Right: Properties + Donut */}
                        <div className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.3, duration: 0.5 }}
                                className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                            >
                                <p className="text-[11px] text-white/50 uppercase tracking-wider font-bold mb-3">Recent Properties</p>
                                <FloatingPropertyCards />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.6, duration: 0.5 }}
                                className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                            >
                                <p className="text-[11px] text-white/50 uppercase tracking-wider font-bold mb-3">Occupancy Rate</p>
                                <AnimatedDonut />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                    className="text-center text-white/20 text-xs font-bold uppercase tracking-[0.2em]"
                >
                    Built with Next.js &middot; Firebase &middot; Tailwind
                </motion.p>
            </div>
        </BackgroundGradientAnimation>
    );
}