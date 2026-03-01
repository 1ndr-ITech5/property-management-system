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
  serverTimestamp,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

import { motion } from "framer-motion";
import { Plus, LayoutDashboard, BarChart3, FileText } from "lucide-react";
import StatsCards from "@/components/StatsCards";
import BookingsChart from "@/components/BookingsChart";

// Modular Components
import AddPropertyModal from "@/components/AddPropertyModal";
import Toast from "@/components/Toast";

export type PropertyType = "Vila" | "Hotel" | "Apartment" | "Guesthouse";

interface Property {
  id: string;
  name: string;
  price: number;
  status: "available" | "booked";
  type: PropertyType;
  description: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  createdAt: any;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { currentUser, logout } = useAuth();
  const router = useRouter();

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
          type: data.type || "Vila",
          description: data.description || "No description yet",
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          location: data.location || "Unknown"
        } as Property);
      });
      setProperties(props);
      setFetching(false);
    }, (error) => {
      console.error("Error listening to properties: ", error);
      showToast("Gabim gjatë ngarkimit të pronave.", "error");
      setFetching(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const runMigration = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const batch: any[] = [];
      properties.forEach(p => {
        const updates: any = {};
        if (!p.type) updates.type = "Vila";
        if (p.description === undefined) updates.description = "No description yet";
        if (p.bedrooms === undefined) updates.bedrooms = 1;
        if (p.bathrooms === undefined) updates.bathrooms = 1;
        if (p.location === undefined || p.location === "City Center") updates.location = "Unknown";

        if (Object.keys(updates).length > 0) {
          batch.push(updateDoc(doc(db, "properties", p.id), updates));
        }
      });
      await Promise.all(batch);
      showToast("Migrimi përfundoi me sukses!", "success");
    } catch (e) {
      console.error("Migration error:", e);
      showToast("Gabim gjatë migrimit.", "error");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthName = months[currentMonth];

    const lastDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastDate.getMonth();
    const lastMonthYear = lastDate.getFullYear();
    const lastMonthName = months[lastMonth];

    const STATIC_BASE_BOOKED: { [key: string]: number } = {
      "Jan": 45, "Feb": 52, "Mar": 48, "Apr": 61, "May": 55, "Jun": 67,
      "Jul": 72, "Aug": 65, "Sep": 78, "Oct": 82, "Nov": 75, "Dec": 90
    };

    const STATIC_BASE_AVAILABLE: { [key: string]: number } = {
      "Jan": 30, "Feb": 25, "Mar": 35, "Apr": 20, "May": 28, "Jun": 15,
      "Jul": 12, "Aug": 22, "Sep": 10, "Oct": 8, "Nov": 18, "Dec": 5
    };

    const getStatsForMonth = (m: number, y: number, monthName: string) => {
      const monthProps = properties.filter(p => {
        if (!p.createdAt) return false;
        const d = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return d.getMonth() === m && d.getFullYear() === y;
      });

      return {
        booked: (STATIC_BASE_BOOKED[monthName] || 0) + monthProps.filter(p => p.status === "booked").length,
        available: (STATIC_BASE_AVAILABLE[monthName] || 0) + monthProps.filter(p => p.status === "available").length
      };
    };

    const current = getStatsForMonth(currentMonth, currentYear, currentMonthName);
    const previous = getStatsForMonth(lastMonth, lastMonthYear, lastMonthName);

    const formatTrend = (curr: number, prev: number) => {
      const diff = curr - prev;
      return diff >= 0 ? `+${diff}` : `${diff}`;
    };

    return {
      currentBooked: current.booked,
      bookedTrend: formatTrend(current.booked, previous.booked),
      currentAvailable: current.available,
      availableTrend: formatTrend(current.available, previous.available)
    };
  }, [properties]);

  const handleAddProperty = async (
    name: string, 
    price: number, 
    status: "available" | "booked", 
    type: PropertyType,
    description: string,
    bedrooms: number,
    bathrooms: number,
    location: string
  ) => {
    if (!currentUser) return;

    if (!name.trim()) {
      showToast("Ju lutem plotësoni emrin e pronës.", "error");
      return;
    }
    
    try {
      setLoading(true);
      await addDoc(collection(db, "properties"), {
        name,
        price,
        status,
        type,
        description: description.trim() || "No description yet",
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        location: location.trim() || "Unknown",
        createdAt: serverTimestamp(),
        ownerId: currentUser.uid,
      });

      setIsAdding(false);
      showToast("Prona u shtua me sukses!", "success");
    } catch (e) {
      console.error("Error adding document: ", e);
      showToast("Gabim gjatë shtimit të pronës.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time property management overview.</p>
        </div>
        <div className="flex items-center gap-3">
          {(properties.some(p => !p.type || !p.description || !p.bedrooms || !p.bathrooms || !p.location || p.location === "City Center")) && (
            <button
              onClick={runMigration}
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-semibold transition-all text-sm"
            >
              {loading ? "Duke migruar..." : "Migro Pronat"}
            </button>
          )}
        </div>
      </div>

      {/* Main Chart */}
      <BookingsChart />

      {/* Quick Stats Grid */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 ml-1">Performance Overview</h2>
        <StatsCards
          totalProperties={properties.length}
          bookedCount={stats.currentBooked}
          bookedTrend={stats.bookedTrend}
          availableCount={stats.currentAvailable}
          availableTrend={stats.availableTrend}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 ml-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all group text-left shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">Add Property</p>
              <p className="text-xs text-slate-500">Create a new unit</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/properties")}
            className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-purple-500/30 transition-all group text-left shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">View Directory</p>
              <p className="text-xs text-slate-500">Manage all units</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/analytics")}
            className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all group text-left shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">Analytics</p>
              <p className="text-xs text-slate-500">Deep performance data</p>
            </div>
          </button>

          <button
            onClick={() => showToast("Gjenerimi i raportit do të jetë i disponueshëm së shpejti.", "success")}
            className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-amber-500/30 transition-all group text-left shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">Reports</p>
              <p className="text-xs text-slate-500">Download data summaries</p>
            </div>
          </button>
        </div>
      </div>

      <AddPropertyModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onAdd={handleAddProperty}
        loading={loading}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ProtectedRoute>
  );
}
