"use client";

import Link from 'next/link';

export default function Home() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans">
            {/* Decorative background element */}
            <div className="absolute top-0 left-1/2 -ml-[40rem] flex h-[64rem] w-[80rem] -translate-x-[50%] [mask-image:radial-gradient(closest-side,white,transparent)]">
                <div className="h-full w-full bg-gradient-to-tr from-blue-200 to-blue-50 opacity-40"></div>
            </div>

            <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
                <div className="w-full max-w-2xl space-y-10 rounded-3xl bg-white/70 p-10 shadow-2xl ring-1 ring-slate-200 backdrop-blur-xl md:p-16">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                            Property Management <span className="text-blue-600">System</span>
                        </h1>
                        <p className="mx-auto max-w-lg text-lg text-slate-600 leading-relaxed">
                            Menaxhoni pronat tuaja me lehtësi dhe profesionalizëm. Shikoni, shtoni dhe monitoroni gjithçka nga një panel i vetëm.
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/login"
                            className="w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/signup"
                            className="w-full rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-md ring-1 ring-slate-200 transition-all duration-200 hover:bg-slate-50 hover:shadow-lg sm:w-auto"
                        >
                            Sign Up
                        </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Menaxhim Modern i Pronave
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}