"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { PropertyType } from "@/app/dashboard/page";

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, price: number, status: "available" | "booked", type: PropertyType) => Promise<void>;
    loading: boolean;
}

export default function AddPropertyModal({ isOpen, onClose, onAdd, loading }: AddPropertyModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [status, setStatus] = useState<"available" | "booked">("available");
    const [type, setType] = useState<PropertyType>("Vila");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd(name, price, status, type);
        // Reset form on success (caller handles closing)
        if (!loading) {
            setName("");
            setPrice(0);
            setStatus("available");
            setType("Vila");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-md glass-panel overflow-hidden rounded-3xl"
                    >
                        <div className="border-b border-white/10 p-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Add New Unit</h2>
                            <p className="mt-1 text-sm text-slate-400">Enter the details for the new listing.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 ml-1">Property Name</label>
                                <input
                                    required
                                    placeholder="e.g. Oceanview Villa"
                                    className="block w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 text-white font-medium focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all placeholder-slate-500 shadow-inner"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 ml-1">Property Type</label>
                                <select
                                    className="block w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 text-white font-medium focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all shadow-inner appearance-none"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as PropertyType)}
                                >
                                    <option value="Vila" className="bg-slate-900">🏡 Vila</option>
                                    <option value="Hotel" className="bg-slate-900">🏨 Hotel</option>
                                    <option value="Apartment" className="bg-slate-900">🏢 Apartment</option>
                                    <option value="Guesthouse" className="bg-slate-900">🛏️ Guesthouse</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 ml-1">Price per Night ($)</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    className="block w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 text-white font-medium focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all placeholder-slate-500 shadow-inner"
                                    value={price || ""}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 ml-1">Initial Status</label>
                                <select
                                    className="block w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 text-white font-medium focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all shadow-inner appearance-none"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "available" | "booked")}
                                >
                                    <option value="available" className="bg-slate-900">Available</option>
                                    <option value="booked" className="bg-slate-900">Booked</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6 mt-2 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 rounded-2xl bg-white/5 hover:bg-white/10 py-3.5 text-sm font-semibold text-white transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-2xl bg-indigo-500 hover:bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all border border-indigo-400/50"
                                >
                                    {loading ? "Adding..." : "Add Property"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
