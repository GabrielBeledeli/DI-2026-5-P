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
      <div className="min-w-0 lg:pl-64">
        <main className="min-h-screen px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </>
  );
}
