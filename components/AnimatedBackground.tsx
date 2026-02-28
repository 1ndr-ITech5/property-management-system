"use client";

import { motion } from "framer-motion";
import { DottedSurface } from "./ui/dotted-surface";

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#05030a]">
            {/* 3D Dotted Surface Base Layer */}
            <DottedSurface className="opacity-60 mix-blend-screen" />

            {/* Dynamic Animated Gradient Overlay for richer purple */}
            <div
                className="absolute inset-0 opacity-[0.85] mix-blend-screen"
                style={{
                    background: 'linear-gradient(-45deg, rgba(30,27,75,0.7), rgba(76,29,149,0.8), rgba(46,16,101,0.9), rgba(5,3,10,0.95))',
                    backgroundSize: '400% 400%',
                    animation: 'gradientBG 15s ease infinite',
                }}
            />

            {/* Floating Orbs for extra glassy pops */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -100, 50, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[10%] left-[20%] w-96 h-96 bg-purple-500/15 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    x: [0, -150, 80, 0],
                    y: [0, 120, -100, 0],
                    scale: [1, 1.5, 0.9, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[150px]"
            />

            <motion.div
                animate={{
                    x: [0, 80, -120, 0],
                    y: [0, 80, 120, 0],
                    scale: [1, 0.8, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[40%] right-[40%] w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[100px]"
            />
        </div>
    );
}
