"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={() => logout()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Properties</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Tenants</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Requests</h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        <p className="text-gray-500">No recent activity.</p>
      </div>
    </div>
  );
}
