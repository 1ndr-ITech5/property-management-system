"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl text-center">
          <h1 className="text-4xl font-extrabold text-blue-600">
            Welcome to Dashboard
          </h1>
          <p className="text-gray-600">
            You are logged in as: <span className="font-semibold text-gray-900">{currentUser?.email}</span>
          </p>

          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
