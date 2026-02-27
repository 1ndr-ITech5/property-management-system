export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 italic">
      <nav className="p-4 bg-white border-b">
        <h2 className="font-bold">Dashboard Layout (Protected Placeholder)</h2>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  );
}
