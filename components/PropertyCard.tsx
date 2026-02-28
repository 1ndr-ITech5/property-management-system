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
        <div className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-200 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
            <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
                    <svg className="h-24 w-24 opacity-30 transition-transform duration-500 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </div>

                {/* Status Badge */}
                <div className="absolute top-5 right-5 z-10">
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] shadow-xl backdrop-blur-md ${property.status === 'available'
                        ? 'bg-white/90 text-emerald-600'
                        : 'bg-white/90 text-rose-600'
                        }`}>
                        <span className={`h-2 w-2 rounded-full ${property.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}></span>
                        {property.status === 'available' ? 'E Disponueshme' : 'E Rezervuar'}
                    </div>
                </div>

                {/* Price Overlay */}
                <div className="absolute bottom-5 left-5 z-10">
                    <div className="rounded-2xl bg-slate-900/80 px-4 py-2.5 font-black text-white backdrop-blur-md shadow-lg">
                        <span className="text-2xl tracking-tight">${property.price}</span>
                        <span className="ml-1.5 text-[10px] font-bold uppercase opacity-60 tracking-widest">/ natë</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-8">
                <div className="mb-6 flex-1">
                    <h3 className="text-2xl font-black text-slate-900 transition-colors group-hover:text-blue-600 leading-tight line-clamp-1">
                        {property.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 italic">
                        "Një përshkrim i mrekullueshëm pret të plotësohet këtu."
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onEdit(property)}
                        className="flex items-center justify-center rounded-2xl bg-blue-50 py-3.5 text-sm font-black text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30"
                    >
                        Ndrysho
                    </button>
                    <button
                        onClick={() => onDelete(property.id)}
                        className="flex items-center justify-center rounded-2xl bg-rose-50 py-3.5 text-sm font-black text-rose-600 transition-all duration-300 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-500/30"
                    >
                        Fshij
                    </button>
                </div>
            </div>
        </div>
    );
}
