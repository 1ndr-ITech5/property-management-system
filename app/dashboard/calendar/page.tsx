"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Plus, X, Clock } from "lucide-react";
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
    maxCapacity: number;
    currentBookings: number;
    status: "available" | "booked" | "unavailable";
}

// --- SUB-COMPONENT: Day Details Modal ---
function DayDetailsModal({ isOpen, onClose, date, reservations, properties, isPast, onStartBooking }: { 
    isOpen: boolean, 
    onClose: () => void, 
    date: string, 
    reservations: Reservation[],
    properties: Property[],
    isPast: boolean,
    onStartBooking: () => void
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg glass-panel overflow-hidden rounded-[2rem] relative z-10 border border-white/20 shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-black text-white">Bookings for {date}</h3>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">
                                    {isPast ? "Historical View" : "Active Management"}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {reservations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                    <CalendarIcon className="w-12 h-12 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No bookings found</p>
                                </div>
                            ) : (
                                reservations.map(r => {
                                    const p = properties.find(prop => prop.id === r.propertyId);
                                    return (
                                        <div key={r.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><User className="w-5 h-5" /></div>
                                                    <div>
                                                        <p className="text-sm font-black text-white leading-none">{r.guestName}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{p?.name || 'Unknown Unit'}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/20">Confirmed</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 border-t border-white/5 pt-3">
                                                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> IN: {r.checkIn}</div>
                                                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> OUT: {r.checkOut}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">Close</button>
                            {!isPast && (
                                <button 
                                    onClick={() => { onClose(); onStartBooking(); }}
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Add Booking
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default function CalendarPage() {
    const { currentUser } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [properties, setProperties] = useState<Property[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
    const [selectedDayInfo, setSelectedDayInfo] = useState<{ date: string, res: Reservation[], isPast: boolean } | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    useEffect(() => {
        if (!currentUser) return;

        const qProps = query(collection(db, "properties"), where("ownerId", "==", currentUser.uid));
        const unsubProps = onSnapshot(qProps, (snap) => {
            const pData: Property[] = [];
            snap.forEach(doc => {
                const data = doc.data();
                pData.push({ id: doc.id, ...data } as Property);
            });
            setProperties(pData);
        });

        const qRes = query(collection(db, "reservations"), where("ownerId", "==", currentUser.uid));
        const unsubRes = onSnapshot(qRes, (snap) => {
            const rData: Reservation[] = [];
            snap.forEach(doc => rData.push({ id: doc.id, ...doc.data() } as Reservation));
            setReservations(rData);
        });

        return () => { unsubProps(); unsubRes(); };
    }, [currentUser]);

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const total = new Date(year, month + 1, 0).getDate();
        const offset = new Date(year, month, 1).getDay();
        const days = [];
        for (let i = 0; i < offset; i++) days.push(null);
        for (let i = 1; i <= total; i++) days.push(i);
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
                guestName, checkIn, checkOut,
                createdAt: serverTimestamp()
            });
            const newCount = (bookingProperty.currentBookings || 0) + 1;
            await updateDoc(doc(db, "properties", bookingProperty.id), {
                currentBookings: newCount,
                status: newCount >= bookingProperty.maxCapacity ? "booked" : bookingProperty.status
            });
            setBookingProperty(null);
            setToast({ message: "Booking confirmed!", type: "success" });
        } catch (e) {
            setToast({ message: "Error creating booking", type: "error" });
        } finally { setLoading(false); }
    };

    return (
        <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Booking Calendar</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-indigo-400" />
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </p>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                <span>Today</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <span>Past</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    <button onClick={handlePrevMonth} className="p-2.5 rounded-xl hover:bg-white/10 text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all border-x border-white/10">Today</button>
                    <button onClick={handleNextMonth} className="p-2.5 rounded-xl hover:bg-white/10 text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[160px]">
                    {calendarDays.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="border-r border-b border-white/5 bg-white/[0.01]" />;
                        
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isPast = dateStr < todayStr;
                        const isToday = dateStr === todayStr;
                        const dayRes = reservations.filter(r => dateStr >= r.checkIn && dateStr <= r.checkOut);

                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedDayInfo({ date: dateStr, res: dayRes, isPast })}
                                className={`border-r border-b border-white/5 p-2 flex flex-col gap-1 group transition-all cursor-pointer relative overflow-hidden ${
                                    isToday ? "bg-indigo-500/[0.05]" : isPast ? "bg-black/20" : "hover:bg-white/[0.03]"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-black transition-colors ${
                                        isToday ? "text-indigo-400" : isPast ? "text-slate-700" : "text-slate-500 group-hover:text-white"
                                    }`}>
                                        {day}
                                    </span>
                                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
                                </div>
                                
                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                                    {dayRes.map(r => {
                                        const prop = properties.find(p => p.id === r.propertyId);
                                        return (
                                            <div key={r.id} className={`px-2 py-1 rounded-lg border text-[8px] flex flex-col shrink-0 ${
                                                isPast 
                                                ? "bg-slate-800/50 border-slate-700/50 grayscale opacity-60" 
                                                : "bg-indigo-500/20 border-indigo-500/30 shadow-sm"
                                            }`}>
                                                <span className={`font-black uppercase truncate ${isPast ? "text-slate-500" : "text-indigo-300"}`}>
                                                    {prop?.name || 'Unit'}
                                                </span>
                                                <span className={`font-bold truncate ${isPast ? "text-slate-600" : "text-white/70"}`}>
                                                    {r.guestName}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {!isPast && dayRes.length === 0 && properties.some(p => p.status === 'available') && (
                                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-4 h-4 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                                {isToday && <div className="absolute inset-0 border-2 border-indigo-500/20 pointer-events-none rounded-sm" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <DayDetailsModal 
                isOpen={!!selectedDayInfo} 
                onClose={() => setSelectedDayInfo(null)} 
                date={selectedDayInfo?.date || ""} 
                reservations={selectedDayInfo?.res || []}
                properties={properties}
                isPast={selectedDayInfo?.isPast || false}
                onStartBooking={() => {
                    const avail = properties.find(p => p.status === 'available');
                    if (avail) setBookingProperty(avail);
                }}
            />

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
