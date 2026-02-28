"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, BedDouble, Bath, Image as ImageIcon } from "lucide-react";

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked";
    createdAt: any;
    location?: string;
    beds?: number;
    baths?: number;
    image?: string;
}

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
                            <span className="text-8xl drop-shadow-2xl filter">{property.image}</span>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-white">{property.name}</h2>
                                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border ${property.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        property.status === 'booked' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    }`}>
                                    {property.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-300 mb-8 font-medium">
                                <MapPin className="w-5 h-5 text-purple-400" />
                                {property.location}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">$</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Price/Night</p>
                                        <p className="text-xl font-bold text-white">${property.price}</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <BedDouble className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Bedrooms</p>
                                        <p className="text-xl font-bold text-white">{property.beds}</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Bath className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Bathrooms</p>
                                        <p className="text-xl font-bold text-white">{property.baths}</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Theme</p>
                                        <p className="text-lg font-bold text-white">{property.image}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full glass-card hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-colors border border-white/20"
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
