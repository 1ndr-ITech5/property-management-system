import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import AnimatedBackground from '@/components/AnimatedBackground'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'PMS Lite | Property Management System',
    description: 'Manage your properties with ease and clarity.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased min-h-screen text-slate-100`}>
                <AnimatedBackground />
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
