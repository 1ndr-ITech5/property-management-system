"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Home, Plus } from "lucide-react";
import AddReservationModal from "@/components/AddReservationModal";
import Toast from "@/components/Toast";
import { PropertyType } from "../page";

interface Reservation {
    id: string;
    propertyId: string;
    ownerId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
}

interface Property {
    id: string;
    name: string;
    type: PropertyType;
}

export default function CalendarPage() {
    const { currentUser } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [properties, setProperties] = useState<Property[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch Properties
        const qProps = query(collection(db, "properties"), where("ownerId", "==", currentUser.uid));
        const unsubProps = onSnapshot(qProps, (snap) => {
            const pData: Property[] = [];
            snap.forEach(doc => pData.push({ id: doc.id, ...doc.data() } as Property));
            setProperties(pData);
        });

        // Fetch Reservations
        const qRes = query(collection(db, "reservations"), where("ownerId", "==", currentUser.uid));
        const unsubRes = onSnapshot(qRes, (snap) => {
            const rData: Reservation[] = [];
            snap.forEach(doc => rData.push({ id: doc.id, ...doc.data() } as Reservation));
            setReservations(rData);
        });

        return () => { unsubProps(); unsubRes(); };
    }, [currentUser]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startOffset = firstDayOfMonth(year, month);

        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(i);
        
        return days;
    }, [currentDate]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    const handleAddReservation = async (guestName: string, checkIn: string, checkOut: string) => {
        if (!currentUser || !bookingProperty) return;
        try {
            setLoading(true);
            await addDoc(collection(db, "reservations"), {
                propertyId: bookingProperty.id,
                ownerId: currentUser.uid,
                guestName,
                checkIn,
                checkOut,
                createdAt: serverTimestamp()
            });
            setBookingProperty(null);
            setToast({ message: "Booking confirmed!", type: "success" });
        } catch (e) {
            setToast({ message: "Error creating booking", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Booking Calendar</h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-indigo-400" />
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    <button onClick={handlePrevMonth} className="p-2.5 rounded-xl hover:bg-white/10 text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all">Today</button>
                    <button onClick={handleNextMonth} className="p-2.5 rounded-xl hover:bg-white/10 text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)]">
                    {calendarDays.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="border-r border-b border-white/5 bg-white/[0.01]" />;
                        
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayReservations = reservations.filter(r => dateStr >= r.checkIn && dateStr <= r.checkOut);

                        return (
                            <div key={idx} className="border-r border-b border-white/5 p-3 flex flex-col gap-2 group hover:bg-white/[0.02] transition-colors relative">
                                <span className="text-sm font-black text-slate-500 group-hover:text-white transition-colors">{day}</span>
                                
                                <div className="flex flex-col gap-1.5">
                                    {dayReservations.map(r => {
                                        const prop = properties.find(p => p.id === r.propertyId);
                                        return (
                                            <div key={r.id} className="px-2 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex flex-col gap-0.5">
                                                <span className="text-[9px] font-black text-indigo-300 uppercase truncate leading-none">{prop?.name}</span>
                                                <span className="text-[8px] font-bold text-slate-400 truncate leading-none">{r.guestName}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {dayReservations.length === 0 && (
                                    <button 
                                        onClick={() => properties.length > 0 && setBookingProperty(properties[0])}
                                        className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center border border-white/5"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <AddReservationModal
                isOpen={!!bookingProperty}
                onClose={() => setBookingProperty(null)}
                onAdd={handleAddReservation}
                loading={loading}
                propertyName={bookingProperty?.name || ""}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
