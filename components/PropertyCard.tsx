"use client";

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked";
    createdAt: any;
}

interface PropertyCardProps {
    property: Property;
    onEdit: (property: Property) => void;
    onDelete: (id: string) => void;
}

export default function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
    return (
        <div className="glass-card flex flex-col overflow-hidden rounded-[2rem] group h-full">
            <div className="relative h-48 w-full overflow-hidden bg-slate-900/50">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${property.status === 'available'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${property.status === 'available' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                        {property.status === 'available' ? 'Available' : 'Booked'}
                    </div>
                </div>

                {/* Price */}
                <div className="absolute bottom-4 left-4 z-20">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">${property.price}</span>
                        <span className="text-xs text-slate-400 font-medium">/ night</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="mb-6 flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {property.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                        onClick={() => onEdit(property)}
                        className="py-2.5 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-center"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(property.id)}
                        className="py-2.5 text-sm font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-center"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
