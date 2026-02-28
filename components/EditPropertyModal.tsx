"use client";

import { useState, useEffect } from "react";

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked";
    createdAt: any;
}

interface EditPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    onUpdate: (id: string, name: string, price: number, status: "available" | "booked") => Promise<void>;
    loading: boolean;
}

export default function EditPropertyModal({ isOpen, onClose, property, onUpdate, loading }: EditPropertyModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [status, setStatus] = useState<"available" | "booked">("available");

    useEffect(() => {
        if (property) {
            setName(property.name);
            setPrice(property.price);
            setStatus(property.status);
        }
    }, [property]);

    if (!isOpen || !property) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate(property.id, name, price, status);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-300">
                <div className="border-b border-slate-100 p-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Redakto Pronën</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">Përditësimi i të dhënave bëhet menjëherë.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Emri i Pronës</label>
                        <input
                            required
                            className="block w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder-slate-300 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Çmimi për Natë ($)</label>
                        <input
                            type="number"
                            required
                            className="block w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Statusi Aktual</label>
                        <select
                            className="block w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none bg-slate-50"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as "available" | "booked")}
                        >
                            <option value="available">E Disponueshme</option>
                            <option value="booked">E Rezervuar</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Anulo
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                            {loading ? "Duke ruajtur..." : "Përditëso"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
