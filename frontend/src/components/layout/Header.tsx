"use client";

import React from 'react';
import { User } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-[calc(100%-16rem)] items-center justify-end border-b border-neutral-800 bg-[#0f0f0f]/80 px-8 backdrop-blur-md">
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
