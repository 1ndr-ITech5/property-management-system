"use client";

import { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

import { motion } from "framer-motion";
import { 
    Plus, 
    LayoutDashboard, 
    BarChart3, 
    FileText, 
    CalendarDays, 
    Home, 
    DollarSign, 
    CheckCircle2, 
    Activity 
} from "lucide-react";
import PerformanceOverview from "@/components/PerformanceOverview";
import BookingsChart from "@/components/BookingsChart";

// Modular Components
import AddPropertyModal from "@/components/AddPropertyModal";
import Toast from "@/components/Toast";
import { logActivity } from "@/lib/activity";

export type PropertyType = "Vila" | "Hotel" | "Apartment" | "Guesthouse";

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
}

interface Reservation {
    id: string;
    propertyId: string;
    ownerId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    createdAt: any;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { currentUser, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) return;

    setFetching(true);
    
    // Properties Listener
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

    // Reservations Listener
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

  const performanceStats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Helper to get stats for any specific month
    const getStatsForMonth = (m: number, y: number) => {
        const monthRes = reservations.filter(r => {
            const d = new Date(r.checkIn);
            return d.getMonth() === m && d.getFullYear() === y;
        });
        
        const rev = monthRes.reduce((acc, r) => {
            const p = properties.find(prop => prop.id === r.propertyId);
            return acc + (p?.price || 0);
        }, 0);

        return { count: monthRes.length, revenue: rev };
    };

    // Calculate last 6 months accurately from real data
    const history = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const data = getStatsForMonth(m, y);
        return {
            name: months[m],
            year: y,
            ...data
        };
    });

    const currentM = now.getMonth();
    const currentY = now.getFullYear();
    const prevDate = new Date(currentY, currentM - 1, 1);
    const lastMonthStats = getStatsForMonth(prevDate.getMonth(), prevDate.getFullYear());

    const thisMonthRes = reservations.filter(r => {
        const d = new Date(r.checkIn);
        return d.getMonth() === currentM && d.getFullYear() === currentY;
    });

    const thisMonthRevenue = thisMonthRes.reduce((acc, r) => {
        const p = properties.find(prop => prop.id === r.propertyId);
        return acc + (p?.price || 0);
    }, 0);

    const availableCount = properties.filter(p => p.status === "available").length;
    const bookedCount = properties.filter(p => p.status === "booked").length;
    const occupancy = properties.length > 0 ? Math.round((bookedCount / properties.length) * 100) : 0;
    const futureBookings = reservations.filter(r => r.checkIn > todayStr).length;

    const calcTrend = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? "+100%" : "0%";
        const diff = ((curr - prev) / prev) * 100;
        return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    return [
        {
            id: "bookings",
            title: "Total Bookings",
            value: thisMonthRes.length,
            trend: calcTrend(thisMonthRes.length, lastMonthStats.count),
            trendUp: thisMonthRes.length >= lastMonthStats.count,
            icon: CalendarDays,
            color: "text-indigo-400",
            chartData: history.map(h => ({ name: h.name, val: h.count })),
            details: [
                { label: "Vila Bookings", value: reservations.filter(r => {
                    const p = properties.find(prop => prop.id === r.propertyId);
                    return p?.type === "Vila";
                }).length, color: "text-indigo-400" },
                { label: "Apartment Bookings", value: reservations.filter(r => {
                    const p = properties.find(prop => prop.id === r.propertyId);
                    return p?.type === "Apartment";
                }).length, color: "text-emerald-400" },
                { label: "Total Historical", value: reservations.length, color: "text-slate-400" }
            ]
        },
        {
            id: "available",
            title: "Available Units",
            value: availableCount,
            trend: "Real-time",
            trendUp: true,
            icon: Home,
            color: "text-emerald-400",
            chartData: history.map(h => ({ name: h.name, val: availableCount })),
            details: [
                { label: "Ready Now", value: availableCount, color: "text-emerald-400" },
                { label: "Currently Booked", value: bookedCount, color: "text-rose-400" },
                { label: "Total Portfolio", value: properties.length, color: "text-white" }
            ]
        },
        {
            id: "revenue",
            title: "Monthly Revenue",
            value: `$${thisMonthRevenue.toLocaleString()}`,
            trend: calcTrend(thisMonthRevenue, lastMonthStats.revenue),
            trendUp: thisMonthRevenue >= lastMonthStats.revenue,
            icon: DollarSign,
            color: "text-amber-400",
            chartData: history.map(h => ({ name: h.name, val: h.revenue })),
            details: [
                { label: "This Month", value: `$${thisMonthRevenue.toLocaleString()}`, color: "text-white" },
                { label: "Last Month", value: `$${lastMonthStats.revenue.toLocaleString()}`, color: "text-slate-400" },
                { label: "All-Time Revenue", value: `$${reservations.reduce((acc, r) => acc + (properties.find(p => p.id === r.propertyId)?.price || 0), 0).toLocaleString()}`, color: "text-indigo-400" }
            ]
        },
        {
            id: "occupancy",
            title: "Avg Occupancy",
            value: `${occupancy}%`,
            trend: "Current",
            trendUp: occupancy > 50,
            icon: Activity,
            color: "text-purple-400",
            chartData: history.map(h => ({ name: h.name, val: h.count > 0 ? Math.min(Math.round((h.count / Math.max(properties.length, 1)) * 100), 100) : 0 })),
            details: [
                { label: "Currently Occupied", value: `${occupancy}%`, color: "text-purple-400" },
                { label: "Total Units", value: properties.length, color: "text-slate-400" },
                { label: "Portfolio Status", value: occupancy > 70 ? "High Demand" : "Available", color: "text-white" }
            ]
        },
        {
            id: "future",
            title: "Future Bookings",
            value: futureBookings,
            trend: "Upcoming",
            trendUp: futureBookings > 0,
            icon: CheckCircle2,
            color: "text-blue-400",
            chartData: history.map(h => ({ name: h.name, val: 0 })), 
            details: [
                { label: "Confirmed Future", value: futureBookings, color: "text-blue-400" },
                { label: "Next Reservation", value: reservations.filter(r => r.checkIn > todayStr).sort((a,b) => a.checkIn.localeCompare(b.checkIn))[0]?.checkIn || "None", color: "text-indigo-400" },
                { label: "Status", value: "Ready", color: "text-emerald-400" }
            ]
        }
    ];
  }, [properties, reservations]);

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
      showToast("Prona u shtua me sukses!", "success");
    } catch (e) {
      console.error(e);
      showToast("Gabim gjatë shtimit të pronës.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Dashboard</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Real-time portfolio management</p>
        </div>
      </div>

      <BookingsChart />

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6 ml-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Performance Overview</h2>
            <div className="h-px flex-1 bg-white/5 ml-2" />
        </div>
        <PerformanceOverview stats={performanceStats} />
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6 ml-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quick Actions</h2>
            <div className="h-px flex-1 bg-white/5 ml-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Add Property", sub: "Create new unit", icon: Plus, color: "text-indigo-400", bg: "bg-indigo-500/20", action: () => setIsAdding(true) },
            { title: "View Directory", sub: "Manage all units", icon: LayoutDashboard, color: "text-purple-400", bg: "bg-purple-500/20", action: () => router.push("/dashboard/properties") },
            { title: "Analytics", sub: "Performance data", icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/20", action: () => router.push("/dashboard/analytics") },
            { title: "Calendar", sub: "Reservations", icon: CalendarDays, color: "text-amber-400", bg: "bg-amber-500/20", action: () => router.push("/dashboard/calendar") }
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all group text-left shadow-xl"
            >
              <div className={`w-12 h-12 rounded-2xl ${btn.bg} flex items-center justify-center ${btn.color} group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                <btn.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-wider">{btn.title}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{btn.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AddPropertyModal isOpen={isAdding} onClose={() => setIsAdding(false)} onAdd={handleAddProperty} loading={loading} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ProtectedRoute>
  );
}
