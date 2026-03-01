"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, BedDouble, Bath, Image as ImageIcon } from "lucide-react";

import { PropertyType } from "@/app/dashboard/page";

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked";
    type: PropertyType;
    description: string;
    bedrooms: number;
    bathrooms: number;
    location: string;
    createdAt: any;
}

const typeEmojis: Record<PropertyType, string> = {
    Vila: "🏡",
    Hotel: "🏨",
    Apartment: "🏢",
    Guesthouse: "🛏️"
};

interface PropertyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
}

export default function PropertyDetailsModal({ isOpen, onClose, property }: PropertyDetailsModalProps) {
    if (!property) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden relative z-10 p-1 flex flex-col"
                    >
                        <div className="h-48 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 relative flex items-center justify-center">
                            <span className="text-8xl drop-shadow-2xl filter">{typeEmojis[property.type] || "🏠"}</span>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-bold text-white leading-tight">{property.name}</h2>
                                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border ${property.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        property.status === 'booked' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    }`}>
                                    {property.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400 mb-6 text-sm font-medium">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                {property.location}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                                <p className="text-slate-300 text-sm leading-relaxed italic">
                                    "{property.description}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-white/20">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <span className="text-2xl font-black text-purple-300">$</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest mb-0.5">Price/Night</p>
                                        <p className="text-xl font-black text-white">${property.price}</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-white/20">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <BedDouble className="w-6 h-6 text-indigo-300 fill-indigo-300/20" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest mb-0.5">Bedrooms</p>
                                        <p className="text-xl font-black text-white">{property.bedrooms}</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-white/20">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Bath className="w-6 h-6 text-blue-300 fill-blue-300/20" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest mb-0.5">Bathrooms</p>
                                        <p className="text-xl font-black text-white">{property.bathrooms}</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-white/20">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <ImageIcon className="w-6 h-6 text-emerald-300 fill-emerald-300/20" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest mb-0.5">Property Type</p>
                                        <p className="text-sm font-bold text-white uppercase tracking-widest">{property.type}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
