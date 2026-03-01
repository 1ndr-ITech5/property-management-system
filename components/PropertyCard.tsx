"use client";

import { PropertyType } from "@/app/dashboard/page";
import { MapPin } from "lucide-react";

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked";
    type: PropertyType;
    location: string;
    description: string;
    bedrooms: number;
    bathrooms: number;
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
            <div className="relative w-full py-8 flex flex-col items-center justify-center bg-white/[0.02] border-b border-white/10 rounded-t-[2.5rem]">
                <span className="text-6xl select-none mb-3 transform transition-transform group-hover:scale-110 duration-300">{emoji}</span>
                <div className="flex items-baseline gap-1.5 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xl font-black text-white">${property.price}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">/ night</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                            {property.name}
                        </h3>
                        <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                            property.status === 'available'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${property.status === 'available' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                            {property.status}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mb-3">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="truncate">{property.location}</span>
                    </div>

                    <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2 mb-4 italic min-h-[2.5rem]">
                        "{property.description}"
                    </p>

                    <div className="flex items-center gap-4 py-3 border-y border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-300 font-bold text-sm">
                            <span>{property.bedrooms}</span>
                            <span className="text-base">🛏️</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 font-bold text-sm">
                            <span>{property.bathrooms}</span>
                            <span className="text-base">🚿</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                        onClick={() => onEdit(property)}
                        className="py-3 text-[11px] font-black rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-center uppercase tracking-widest active:scale-95 shadow-lg"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(property.id)}
                        className="py-3 text-[11px] font-black rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-center uppercase tracking-widest active:scale-95 shadow-lg"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
