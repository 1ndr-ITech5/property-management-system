"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Plus, TrendingUp } from "lucide-react";

import AddPropertyModal from "@/components/AddPropertyModal";
import EditPropertyModal from "@/components/EditPropertyModal";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";
import AddReservationModal from "@/components/AddReservationModal";
import Toast from "@/components/Toast";
import { logActivity } from "@/lib/activity";

import { PropertyType } from "../page";

interface Reservation {
    id: string;
    propertyId: string;
    ownerId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    createdAt: any;
}

interface Property {
    id: string;
    name: string;
    price: number;
    status: "available" | "booked" | "unavailable";
    type: PropertyType;
    description: string;
    bedrooms: number;
    bathrooms: number;
    location: string;
    maxCapacity: number;
    currentBookings: number;
    createdAt: any;
    image?: string;
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
    const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "available" | "booked" | "unavailable">("all");
    const [typeFilter, setTypeFilter] = useState<"all" | PropertyType>("all");
    const [sortKey, setSortKey] = useState<"name" | "price">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        setFetching(true);
        
        // Properties Query
        const qProps = query(
            collection(db, "properties"), 
            where("ownerId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubProps = onSnapshot(qProps, (querySnapshot) => {
            const props: Property[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                props.push({
                    id: docSnap.id,
                    ...data,
                    type: data.type || "Vila",
                    description: data.description || "No description yet",
                    bedrooms: data.bedrooms || 1,
                    bathrooms: data.bathrooms || 1,
                    location: data.location || "Unknown",
                    maxCapacity: data.maxCapacity || 1,
                    currentBookings: data.currentBookings || 0,
                    status: data.status || "available"
                } as Property);
            });
            setProperties(props);
            setFetching(false);
        });

        // Reservations Query
        const qRes = query(
            collection(db, "reservations"),
            where("ownerId", "==", currentUser.uid)
        );

        const unsubRes = onSnapshot(qRes, (snap) => {
            const resData: Reservation[] = [];
            snap.forEach(doc => resData.push({ id: doc.id, ...doc.data() } as Reservation));
            setReservations(resData);
        });

        return () => {
            unsubProps();
            unsubRes();
        };
    }, [currentUser]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
    };

    const transformedProperties = useMemo(() => {
        let result = properties.map(p => {
            let derivedStatus = p.status;
            if (p.status !== "unavailable") {
                if (p.currentBookings >= p.maxCapacity) {
                    derivedStatus = "booked";
                }
            }
            return { ...p, status: derivedStatus };
        });

        if (search) {
            const term = search.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.location.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter(p => p.status === statusFilter);
        }

        if (typeFilter !== "all") {
            result = result.filter(p => p.type === typeFilter);
        }

        result.sort((a, b) => {
            let valA = a[sortKey as keyof Property];
            let valB = b[sortKey as keyof Property];
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [properties, statusFilter, typeFilter, sortKey, sortOrder, search]);

    const handleAddProperty = async (
        name: string, 
        price: number, 
        status: "available" | "booked" | "unavailable", 
        type: PropertyType,
        description: string,
        bedrooms: number,
        bathrooms: number,
        location: string,
        maxCapacity: number
    ) => {
        if (!currentUser) return;

        try {
            setLoading(true);
            await addDoc(collection(db, "properties"), {
                name, price, status, type,
                description: description.trim() || "No description yet",
                bedrooms: bedrooms || 1,
                bathrooms: bathrooms || 1,
                location: location.trim() || "Unknown",
                maxCapacity: maxCapacity || 1,
                currentBookings: 0,
                createdAt: serverTimestamp(),
                ownerId: currentUser.uid,
            });

            await logActivity(
                currentUser.uid,
                "property",
                "New Property Added",
                `${name} has been successfully added to your portfolio.`
            );

            setIsAdding(false);
            showToast("Property added successfully!", "success");
        } catch (e) {
            console.error(e);
            showToast("Error adding property.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddReservation = async (guestName: string, checkIn: string, checkOut: string) => {
        if (!currentUser || !bookingProperty) return;

        if (bookingProperty.currentBookings >= bookingProperty.maxCapacity) {
            alert("Maximum capacity reached for this property.");
            return;
        }

        try {
            setLoading(true);
            
            // 1. Create Reservation
            await addDoc(collection(db, "reservations"), {
                propertyId: bookingProperty.id,
                ownerId: currentUser.uid,
                guestName,
                checkIn,
                checkOut,
                createdAt: serverTimestamp()
            });

            // 2. Increment Current Bookings & Update Status if necessary
            const newCount = (bookingProperty.currentBookings || 0) + 1;
            const newStatus = newCount >= bookingProperty.maxCapacity ? "booked" : bookingProperty.status;
            
            const propRef = doc(db, "properties", bookingProperty.id);
            await updateDoc(propRef, {
                currentBookings: newCount,
                status: newStatus
            });

            // 3. Log Activity for Notification
            await logActivity(
                currentUser.uid,
                "booking",
                "New Reservation Confirmed",
                `Guest ${guestName} booked ${bookingProperty.name} for $${bookingProperty.price}.`
            );
            
            setBookingProperty(null);
            showToast("Booking confirmed successfully!", "success");
        } catch (e) {
            console.error(e);
            showToast("Failed to create booking.", "error");
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

    const handleUpdateProperty = async (
        id: string, 
        name: string, 
        price: number, 
        status: "available" | "booked" | "unavailable", 
        type: PropertyType,
        description: string,
        bedrooms: number,
        bathrooms: number,
        location: string,
        maxCapacity: number
    ) => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const propertyRef = doc(db, "properties", id);
            await updateDoc(propertyRef, {
                name, price, status, type,
                description: description.trim() || "No description yet",
                bedrooms: bedrooms || 1,
                bathrooms: bathrooms || 1,
                location: location.trim() || "Unknown",
                maxCapacity: maxCapacity || 1,
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

    const typeEmojis: Record<PropertyType, string> = {
        Vila: "🏡",
        Hotel: "🏨",
        Apartment: "🏢",
        Guesthouse: "🛏️"
    };

    return (
        <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Properties Directory</h1>
                    <p className="text-slate-400 text-sm">Detailed management interface for your entire portfolio.</p>
                </div>

                <div className="flex flex-col xl:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative group w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all w-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-2xl text-sm outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                        >
                            <option value="all" className="bg-slate-900">All Types</option>
                            <option value="Vila" className="bg-slate-900">Vilas</option>
                            <option value="Hotel" className="bg-slate-900">Hotels</option>
                            <option value="Apartment" className="bg-slate-900">Apartments</option>
                            <option value="Guesthouse" className="bg-slate-900">Guesthouses</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-2xl text-sm outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                        >
                            <option value="all" className="bg-slate-900">All Status</option>
                            <option value="available" className="bg-slate-900">Available</option>
                            <option value="booked" className="bg-slate-900">Booked</option>
                            <option value="unavailable" className="bg-slate-900">Unavailable</option>
                        </select>

                        <div className="flex items-center gap-2">
                            <select
                                value={sortKey}
                                onChange={(e) => setSortKey(e.target.value as any)}
                                className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-2xl text-sm outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                            >
                                <option value="name" className="bg-slate-900">Sort: Name</option>
                                <option value="price" className="bg-slate-900">Sort: Price</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>

                        <button
                            onClick={() => setIsAdding(true)}
                            className="h-[42px] px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 border border-purple-500/50 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Add Property
                        </button>
                    </div>
                </div>
            </div>

            {fetching ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-medium animate-pulse">Syncing directory...</p>
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
                                className="glass-card rounded-[2rem] overflow-hidden flex flex-col group h-full"
                            >
                                <div className="h-40 bg-gradient-to-br from-white/10 to-white/0 relative flex items-center justify-center border-b border-white/10 group-hover:from-white/20 transition-all shrink-0">
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border backdrop-blur-md ${
                                            property.status === 'available' 
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                                : property.status === 'booked' 
                                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                                    : 'bg-slate-500/20 text-slate-400 border-white/10'
                                        }`}>
                                            {property.status}
                                        </span>
                                    </div>

                                    <span className="text-6xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform transition-transform group-hover:scale-110 duration-300">
                                        {typeEmojis[property.type]}
                                    </span>

                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-black text-white shadow-lg">
                                        ${property.price} / night
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-2 flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors">{property.name}</h3>
                                        {property.status === 'available' && (
                                            <button 
                                                onClick={() => setBookingProperty(property)}
                                                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 transition-all"
                                            >
                                                Book Now
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-3">
                                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                                        {property.location}
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                                            <span>{property.currentBookings} / {property.maxCapacity} Bookings</span>
                                        </div>
                                    </div>

                                    <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2 mb-6 italic min-h-[2.5rem]">
                                        "{property.description}"
                                    </p>

                                    <div className="mt-auto">
                                        <button
                                            onClick={() => setViewingProperty(property)}
                                            className="w-full py-3.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs uppercase tracking-widest border border-purple-500/20 transition-all active:scale-95 shadow-inner mb-5"
                                        >
                                            View Details
                                        </button>

                                        <div className="grid grid-cols-2 gap-3 pt-5 border-t border-white/10">
                                            <button
                                                onClick={() => setEditingProperty(property)}
                                                className="py-3 text-[11px] font-black rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-center uppercase tracking-widest active:scale-95 shadow-lg"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProperty(property.id)}
                                                className="py-3 text-[11px] font-black rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-center uppercase tracking-widest active:scale-95 shadow-lg"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AddPropertyModal isOpen={isAdding} onClose={() => setIsAdding(false)} onAdd={handleAddProperty} loading={loading} />
            <EditPropertyModal isOpen={!!editingProperty} onClose={() => setEditingProperty(null)} property={editingProperty} onUpdate={handleUpdateProperty} loading={loading} />
            <PropertyDetailsModal isOpen={!!viewingProperty} onClose={() => setViewingProperty(null)} property={viewingProperty} />
            <AddReservationModal isOpen={!!bookingProperty} onClose={() => setBookingProperty(null)} onAdd={handleAddReservation} loading={loading} propertyName={bookingProperty?.name || ""} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
