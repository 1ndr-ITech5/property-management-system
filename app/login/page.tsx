"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

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

    try {
      setLoading(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode === "auth/user-not-found" || errorCode === "auth/invalid-email") {
        setEmailError("Account not found.");
      } else if (errorCode === "auth/wrong-password") {
        setPasswordError("Incorrect password.");
      } else if (errorCode === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("An error occurred: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <BackgroundGradientAnimation
      className="flex min-h-screen items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="text-sm font-bold tracking-wide uppercase">Back to Home</span>
        </button>
        <div className="glass-panel p-10 md:p-12 rounded-[2.5rem] relative z-10 bg-white/[0.03] backdrop-blur-[50px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/30 flex items-center justify-center mb-6">
              <span className="text-white font-bold text-3xl">P</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-300 font-medium">
              Log in to manage your portfolio properties.
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 backdrop-blur-md">
              <svg className="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email-address" className="block text-xs font-semibold uppercase tracking-widest text-white/60 mb-2 ml-1">
                  Email Address
                </label>
                <input
                  id="email-address"
                  type="email"
                  required
                  className={`block w-full rounded-2xl bg-black/20 backdrop-blur-md border ${emailError ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-purple-400'} px-5 py-4 text-white font-medium focus:bg-black/30 outline-none transition-all placeholder-white/30 shadow-inner`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <p className="mt-2 text-xs font-medium text-rose-400 ml-1">{emailError}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-white/60 mb-2 ml-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className={`block w-full rounded-2xl bg-black/20 backdrop-blur-md border ${passwordError ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-purple-400'} px-5 py-4 text-white font-medium focus:bg-black/30 outline-none transition-all placeholder-white/30 shadow-inner`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && <p className="mt-2 text-xs font-medium text-rose-400 ml-1">{passwordError}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:shadow-none bg-gradient-to-r hover:from-purple-500/20 hover:to-fuchsia-500/20"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm font-medium">
              Don't have an account?{" "}
              <Link href="/signup" className="text-white hover:text-purple-300 transition-colors font-bold border-b border-white/30 hover:border-purple-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </BackgroundGradientAnimation>
  );
}
