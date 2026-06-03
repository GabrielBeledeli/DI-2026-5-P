"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Tag, 
  ShoppingCart, 
  Plus, 
  BarChart2,
  Footprints
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { label: 'PRINCIPAL', type: 'header' },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  
  { label: 'CADASTROS', type: 'header' },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Produtos', href: '/produtos', icon: Package },
  { label: 'Categorias', href: '/categorias', icon: Tag },
  
  { label: 'VENDAS', type: 'header' },
  { label: 'Vendas', href: '/vendas', icon: ShoppingCart },
  { label: 'Nova Venda', href: '/vendas/nova', icon: Plus },
  
  { label: 'RELATÓRIOS GERENCIAIS', type: 'header' },
  { label: 'Estatísticas', href: '/dashboard', icon: BarChart2 }, 
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-800 bg-[#0f0f0f] transition-transform">
      <div className="flex h-full flex-col px-3 py-4 overflow-y-auto">
        <div className="mb-10 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <Footprints size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Kick<span className="text-red-600">Hub</span>
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.type === 'header') {
              return (
                <div 
                  key={index} 
                  className="px-2 pt-4 pb-1 text-xs font-semibold text-neutral-500 tracking-wider"
                >
                  {item.label}
                </div>
              );
            }

            if (!item.href || !item.icon) {
              return null;
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href + index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-[#1a1a1a] text-red-600" 
                    : "text-neutral-400 hover:bg-[#1a1a1a] hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-neutral-800 pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-white">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">João Doe</span>
              <span className="text-xs text-neutral-500">Gestor</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
