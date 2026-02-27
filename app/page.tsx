import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Property Management System</h1>
            <div className="flex gap-4">
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</Link>
                <Link href="/signup" className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">Signup</Link>
            </div>
        </main>
    );
}
