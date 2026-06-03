"use client";

import React from 'react';
import { Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-neutral-800 bg-[#0f0f0f]/80 px-8 backdrop-blur-md">
      <div className="relative w-96">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-neutral-500" />
        </div>
        <input
          type="text"
          className="block w-full rounded-lg border border-neutral-800 bg-[#1a1a1a] py-2 pl-10 pr-3 text-sm text-neutral-300 placeholder-neutral-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
          placeholder="Buscar no sistema..."
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-lg p-1 text-neutral-400 hover:bg-[#1a1a1a] hover:text-white transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800">
            <User size={18} />
          </div>
          <span className="text-sm font-medium">Perfil</span>
        </button>
      </div>
    </header>
  );
}
