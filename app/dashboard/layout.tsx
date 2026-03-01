"use client";

import { useState, useEffect } from "react";
import GlassSidebar from "@/components/GlassSidebar";
import GlassHeader from "@/components/GlassHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const autoReleaseBookings = async () => {
      if (!currentUser) return;

      const today = new Date().toISOString().split('T')[0];
      
      try {
        // 1. Get all reservations for this admin
        const qRes = query(collection(db, "reservations"), where("ownerId", "==", currentUser.uid));
        const resSnap = await getDocs(qRes);
        
        // 2. Count truly active reservations per property
        const activeResByProperty: Record<string, number> = {};

        resSnap.forEach(snap => {
          const data = snap.data();
          // Active means: started today or before AND ends today or later
          if (data.checkIn <= today && data.checkOut >= today) {
            activeResByProperty[data.propertyId] = (activeResByProperty[data.propertyId] || 0) + 1;
          }
        });

        // 3. Sync property counts
        const qProps = query(collection(db, "properties"), where("ownerId", "==", currentUser.uid));
        const propsSnap = await getDocs(qProps);

        const updates = propsSnap.docs.map(async (pDoc) => {
          const prop = pDoc.data();
          const realActiveCount = activeResByProperty[pDoc.id] || 0;

          // If the stored count or status is wrong, sync it
          if (prop.currentBookings !== realActiveCount) {
            let newStatus = prop.status;
            
            // Only auto-flip status if it wasn't manually set to 'unavailable'
            if (prop.status !== 'unavailable') {
                newStatus = realActiveCount >= (prop.maxCapacity || 1) ? 'booked' : 'available';
            }
            
            await updateDoc(doc(db, "properties", pDoc.id), {
              currentBookings: realActiveCount,
              status: newStatus
            });
          }
        });

        await Promise.all(updates);
      } catch (e) {
        console.error("Auto-release sync error:", e);
      }
    };

    autoReleaseBookings();
  }, [currentUser]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full overflow-hidden text-slate-50 relative">
        <GlassSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10">
          <GlassHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="px-4 md:px-8 pb-12">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
