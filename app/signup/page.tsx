"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [success, setSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      await signup(email, password);
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode === "auth/email-already-in-use") {
        setEmailError("Ky email është tashmë në përdorim");
      } else if (errorCode === "auth/weak-password") {
        setPasswordError("Password duhet të jetë të paktën 6 karaktere");
      } else if (errorCode === "auth/invalid-email") {
        setEmailError("Email address i pavlefshëm");
      } else {
        setError("Ndodhi një gabim: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Create Account
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Join the Property Management System
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          {error && (
            <div className="mb-6 flex items-center rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
              <span className="mr-2 h-2 w-2 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 animate-in fade-in slide-in-from-top-1">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></span>
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full rounded-lg border ${emailError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} px-4 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{emailError}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`block w-full rounded-lg border ${passwordError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} px-4 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center sm:text-sm">
            <p className="text-slate-600 font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 transition-colors font-bold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all duration-200 group"
          >
            <span className="mr-2 transition-transform duration-200 group-hover:-translate-x-1">←</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
