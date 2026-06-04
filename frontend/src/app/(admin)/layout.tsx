import React from 'react';
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <div className="pl-64">
        <main className="min-h-screen px-8 py-10">
          {children}
        </main>
      </div>
    </>
  );
}
