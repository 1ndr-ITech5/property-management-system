"use client";

import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl animate-in slide-in-from-right-10 duration-500 ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                {type === "success" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <p className="text-sm font-bold tracking-wide">{message}</p>
        </div>
    );
}
