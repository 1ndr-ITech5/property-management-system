"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, User, ArrowRight } from "lucide-react";

interface AddReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (guestName: string, checkIn: string, checkOut: string) => Promise<void>;
    loading: boolean;
    propertyName: string;
}

export default function AddReservationModal({ isOpen, onClose, onAdd, loading, propertyName }: AddReservationModalProps) {
    const [guestName, setGuestName] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName || !checkIn || !checkOut) return;
        
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        
        if (end <= start) {
            alert("Check-out date must be after check-in date.");
            return;
        }

        await onAdd(guestName, checkIn, checkOut);
        if (!loading) {
            setGuestName("");
            setCheckIn("");
            setCheckOut("");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="w-full max-w-md glass-panel overflow-hidden rounded-[2.5rem] relative z-10 border border-white/20 shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">New Booking</h2>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">{propertyName}</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <User className="w-3 h-3" /> Guest Full Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        <CalendarIcon className="w-3 h-3" /> Check-in
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner [color-scheme:dark]"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        <CalendarIcon className="w-3 h-3" /> Check-out
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner [color-scheme:dark]"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? "Processing..." : (
                                        <>
                                            Confirm Reservation
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
