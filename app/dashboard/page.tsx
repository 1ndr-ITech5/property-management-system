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
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Property <span className="text-blue-600">Admin</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-sm font-medium text-slate-600 md:block">
                  {currentUser?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Menaxho Pronat</h1>
              <p className="mt-1 text-slate-500 font-medium text-sm">Shikoni, redaktoni ose fshini listimet tuaja në kohë reale.</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all duration-200 hover:bg-blue-600 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="mr-2 text-xl">+</span>
              Shto Pronë
            </button>
          </div>

          {/* Filters and Sorting Toolbar */}
          <div className="mb-10 flex flex-wrap items-center gap-5 rounded-[2rem] bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtro:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(["all", "available", "booked"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === status
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    {status === 'all' ? 'Të gjitha' : status === 'available' ? 'Të Disponueshme' : 'Të Rezervuara'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 md:ml-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendit pas:</span>
              <div className="flex items-center gap-2">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as any)}
                  className="rounded-xl border-none bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1em_1em] bg-[right_0.75rem_center] bg-no-repeat"
                >
                  <option value="name">Emrit</option>
                  <option value="price">Çmimit</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                  title={sortOrder === 'asc' ? 'Rritëse' : 'Zbritëse'}
                >
                  {sortOrder === 'asc' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 4h13M3 8h9m-9 4h6m4 4l4 4m0 0l4-4m-4 4v-12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-sm font-bold text-slate-500 animate-pulse tracking-wide">Duke ngarkuar pronat tuaja...</p>
            </div>
          ) : transformedProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Nuk u gjet asnjë pronë</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-xs mx-auto">Nuk ka prona që përputhen me kriteret tuaja ose lista është boshe.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {transformedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={setEditingProperty}
                  onDelete={handleDeleteProperty}
                />
              ))}
            </div>
          )}
        </main>

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
      </div>
    </ProtectedRoute>
  );
}
