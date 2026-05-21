import React from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="min-h-screen pt-16 px-8 pb-12">
          {children}
        </main>
      </div>
    </>
  );
}
