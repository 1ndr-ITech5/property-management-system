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
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

import { motion } from "framer-motion";
import StatsCards from "@/components/StatsCards";
import RevenueChart from "@/components/RevenueChart";

// Modular Components
import PropertyCard from "@/components/PropertyCard";
import AddPropertyModal from "@/components/AddPropertyModal";
import EditPropertyModal from "@/components/EditPropertyModal";
import Toast from "@/components/Toast";

interface Property {
  id: string;
  name: string;
  price: number;
  status: "available" | "booked";
  createdAt: any;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Filter and Sort States
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "booked">("all");
  const [sortKey, setSortKey] = useState<"name" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { currentUser, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) return;

    setFetching(true);
    const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));

    // Real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const props: Property[] = [];
      querySnapshot.forEach((docSnap) => {
        props.push({ id: docSnap.id, ...docSnap.data() } as Property);
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

  // Transformation Logic
  const transformedProperties = useMemo(() => {
    let result = [...properties];

    // Filter
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }

    // Sort
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
  }, [properties, statusFilter, sortKey, sortOrder]);

  // Aggregate Metrics for StatsCards
  const occupancyRate = properties.length
    ? Math.round((properties.filter(p => p.status === "booked").length / properties.length) * 100) + "%"
    : "0%";
  const monthlyRevenue = properties
    .filter(p => p.status === "booked")
    .reduce((acc, p) => acc + (p.price * 30), 0);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleAddProperty = async (name: string, price: number, status: "available" | "booked") => {
    if (!currentUser) return;

    // Validation
    if (!name.trim()) {
      showToast("Ju lutem plotësoni emrin e pronës.", "error");
      return;
    }
    if (price <= 0) {
      showToast("Çmimi duhet të jetë një numër pozitiv.", "error");
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

  const handleDeleteProperty = async (propertyId: string) => {
    if (!currentUser) return;
    if (!window.confirm("A jeni të sigurt që dëshironi të fshini këtë pronë?")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "properties", propertyId));
      showToast("Prona u fshi me sukses.", "success");
    } catch (e) {
      console.error("Error deleting document: ", e);
      showToast("Gabim gjatë fshirjes.", "error");
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
      showToast("Prona u përditësua me sukses.", "success");
    } catch (e) {
      console.error("Error updating document: ", e);
      showToast("Gabim gjatë përditësimit.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top Banner & Actions */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Manage Properties</h1>
          <p className="text-slate-400 mt-1">Real-time data synchronization for all units.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
        >
          <span className="text-lg leading-none">+</span> Add Unit
        </button>
      </div>

      {/* Overview Analytics */}
      <StatsCards
        totalProperties={properties.length}
        occupancyRate={occupancyRate}
        monthlyRevenue={monthlyRevenue}
      />

      <RevenueChart />

      {/* Filters Toolbar */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter:</span>
          <div className="flex bg-white/5 p-1 rounded-xl">
            {(["all", "available", "booked"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${statusFilter === status
                    ? 'bg-white/10 text-white shadow-inner border border-white/5'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {status === 'all' ? 'All' : status === 'available' ? 'Available' : 'Booked'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:ml-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort:</span>
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm outline-none"
            >
              <option value="name" className="text-slate-900">Name</option>
              <option value="price" className="text-slate-900">Price</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-medium animate-pulse">Syncing data...</p>
        </div>
      ) : transformedProperties.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center border-dashed">
          <h3 className="text-2xl font-bold text-white mb-2">No units found</h3>
          <p className="text-slate-400">Try adjusting your filters or add a new property.</p>
        </div>
      ) : (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {transformedProperties.map((property) => (
            <motion.div
              key={property.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
            >
              <PropertyCard
                property={property}
                onEdit={setEditingProperty}
                onDelete={handleDeleteProperty}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modals */}
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

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
