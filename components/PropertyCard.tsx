"use client";

import { PropertyType } from "@/app/dashboard/page";

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked";
    type: PropertyType;
    createdAt: any;
}

const typeEmojis: Record<PropertyType, string> = {
    Vila: "🏡",
    Hotel: "🏨",
    Apartment: "🏢",
    Guesthouse: "🛏️"
};

interface PropertyCardProps {
    property: Property;
    onEdit: (property: Property) => void;
    onDelete: (id: string) => void;
}

export default function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
    const emoji = typeEmojis[property.type] || "🏠";

    return (
        <div className="glass-card flex flex-col overflow-hidden rounded-[2.5rem] group h-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/20">
            {/* Header Section: Emoji & Price */}
            <div className="relative w-full py-10 flex flex-col items-center justify-center bg-white/[0.02] border-b border-white/10 rounded-t-[2.5rem]">
                <span className="text-7xl select-none mb-4 transform transition-transform group-hover:scale-110 duration-300">{emoji}</span>
                <div className="flex items-baseline gap-1.5 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <span className="text-2xl font-black text-white">${property.price}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ night</span>
                </div>
            </div>

            {/* Content Section: Name & Status */}
            <div className="flex flex-1 flex-col p-8">
                <div className="mb-8 text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-white mb-4 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {property.name}
                    </h3>
                    
                    <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md border ${
                        property.status === 'available'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                        <span className={`h-2 w-2 rounded-full ${property.status === 'available' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                        {property.status === 'available' ? 'Available' : 'Booked'}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <button
                        onClick={() => onEdit(property)}
                        className="py-4 text-sm font-black rounded-[1.25rem] bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-center uppercase tracking-widest active:scale-95 shadow-lg"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(property.id)}
                        className="py-4 text-sm font-black rounded-[1.25rem] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-center uppercase tracking-widest active:scale-95 shadow-lg"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
