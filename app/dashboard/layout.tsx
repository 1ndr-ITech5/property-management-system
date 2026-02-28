"use client";

import { useState } from "react";
import GlassSidebar from "@/components/GlassSidebar";
import GlassHeader from "@/components/GlassHeader";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
