"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, BedDouble, Bath, Plus, Filter, MoreHorizontal } from "lucide-react";

import AddPropertyModal from "@/components/AddPropertyModal";
import EditPropertyModal from "@/components/EditPropertyModal";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";
import Toast from "@/components/Toast";

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

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [search, setSearch] = useState("");

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        setFetching(true);
        const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const props: Property[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                props.push({
                    id: docSnap.id,
                    ...data,
                    // Use mock values if they don't exist yet in the DB
                    location: data.location || "City Center",
                    beds: data.beds || 2,
                    baths: data.baths || 1,
                    image: data.image || "🏢"
                } as Property);
            });
            setProperties(props);
            setFetching(false);
        }, (error) => {
            console.error("Error listening to properties: ", error);
            showToast("Error loading properties.", "error");
            setFetching(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
    };

    const transformedProperties = useMemo(() => {
        if (!search) return properties;
        return properties.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()));
    }, [properties, search]);

    const handleAddProperty = async (name: string, price: number, status: "available" | "booked") => {
        if (!currentUser) return;

        if (!name.trim()) {
            showToast("Please enter a property name.", "error");
            return;
        }
        if (price <= 0) {
            showToast("Price must be a positive number.", "error");
            return;
        }

        try {
            setLoading(true);
            await addDoc(collection(db, "properties"), {
                name,
                price,
                status,
                createdAt: serverTimestamp(),
                ownerId: currentUser.uid,
                // Assign some random mock data for the new UI fields for now
                location: ["Downtown City Center", "Northern Wilderness", "West Coast Strip", "Quiet Bay", "Arts District", "Harbor View"][Math.floor(Math.random() * 6)],
                beds: Math.floor(Math.random() * 4) + 1,
                baths: Math.floor(Math.random() * 3) + 1,
                image: ["🏙️", "🏞️", "🌅", "🏖️", "🏭", "🏡"][Math.floor(Math.random() * 6)]
            });

            setIsAdding(false);
            showToast("Property added successfully!", "success");
        } catch (e) {
            console.error("Error adding document: ", e);
            showToast("Error adding property.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProperty = async (propertyId: string) => {
        if (!currentUser) return;
        if (!window.confirm("Are you sure you want to delete this property?")) return;

        try {
            setLoading(true);
            await deleteDoc(doc(db, "properties", propertyId));
            showToast("Property deleted successfully.", "success");
        } catch (e) {
            console.error("Error deleting document: ", e);
            showToast("Error deleting property.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProperty = async (id: string, name: string, price: number, status: "available" | "booked") => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const propertyRef = doc(db, "properties", id);
            await updateDoc(propertyRef, {
                name,
                price,
                status,
            });

            setEditingProperty(null);
            showToast("Property updated successfully.", "success");
        } catch (e) {
            console.error("Error updating document: ", e);
            showToast("Error updating property.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Properties Directory</h1>
                    <p className="text-slate-400 text-sm">Detailed management interface for your entire portfolio.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all w-full md:w-64 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 border border-purple-500/50 text-white font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>
            </div>

            {fetching ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-medium animate-pulse">Syncing directory...</p>
                </div>
            ) : transformedProperties.length === 0 ? (
                <div className="glass-panel p-16 rounded-3xl text-center border-dashed relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">No units found</h3>
                    <p className="text-slate-400">Try adjusting your search or add a new property.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    <AnimatePresence>
                        {transformedProperties.map((property, index) => (
                            <motion.div
                                key={property.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                className="glass-card rounded-[2rem] overflow-hidden flex flex-col"
                            >
                                <div className="h-40 bg-gradient-to-br from-white/10 to-white/0 relative flex items-center justify-center border-b border-white/10 group-hover:from-white/20 transition-all">
                                    <span className="text-6xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{property.image}</span>
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white shadow-lg">
                                        ${property.price} / night
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-white leading-tight min-h-[3rem]">{property.name}</h3>
                                        <div className="relative group/menu">
                                            <button className="text-slate-400 hover:text-white transition-colors p-1">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                            <div className="absolute right-0 top-full mt-2 w-32 glass-panel rounded-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all flex flex-col text-sm overflow-hidden z-20">
                                                <button onClick={() => setEditingProperty(property)} className="px-4 py-2 text-left text-slate-300 hover:bg-white/10 hover:text-white transition-colors">Edit</button>
                                                <button onClick={() => handleDeleteProperty(property.id)} className="px-4 py-2 text-left text-rose-400 hover:bg-rose-500/20 transition-colors">Delete</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-5">
                                        <MapPin className="w-4 h-4 text-purple-400" />
                                        {property.location}
                                    </div>

                                    <div className="flex items-center gap-4 text-slate-300 text-sm font-medium mb-6">
                                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                                            <BedDouble className="w-4 h-4 text-slate-400" /> {property.beds}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                                            <Bath className="w-4 h-4 text-slate-400" /> {property.baths}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${property.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                            property.status === 'booked' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                                'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            }`}>
                                            {property.status}
                                        </span>
                                        <button
                                            onClick={() => setViewingProperty(property)}
                                            className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/20 shadow-inner"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AddPropertyModal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                onAdd={handleAddProperty}
                loading={loading}
            />

            <EditPropertyModal
                isOpen={!!editingProperty}
                onClose={() => setEditingProperty(null)}
                property={editingProperty}
                onUpdate={handleUpdateProperty}
                loading={loading}
            />

            <PropertyDetailsModal
                isOpen={!!viewingProperty}
                onClose={() => setViewingProperty(null)}
                property={viewingProperty}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
