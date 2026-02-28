"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

/**
 * FirebaseTest Component
 * 
 * Verifies that Firebase Auth is correctly initialized.
 * Check your browser console (F12 > Console) to see the output.
 */
export default function FirebaseTest() {
    useEffect(() => {
        // Confirm initialization in console
        console.log("--- Firebase Auth Verification ---");
        console.log("Auth object:", auth);

        if (auth) {
            console.log("✅ Firebase Auth is initialized and accessible.");
            console.log("Current user:", auth.currentUser);
        } else {
            console.error("❌ Firebase Auth is UNDEFINED. Check lib/firebase.ts and .env.local.");
        }
        console.log("----------------------------------");
    }, []);

    return (
        <div className="p-6 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 mt-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-blue-800 mb-2 text-center">Firebase Auth Test</h2>
            <p className="text-sm text-blue-600 text-center">
                Open the <strong>Browser Console (F12)</strong> to verify initialization.
            </p>
            <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-gray-700">Client Component Loaded</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 ${auth ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></span>
                    <span className="text-xs text-gray-700">Firebase Auth Export Found</span>
                </div>
            </div>
        </div>
    );
}