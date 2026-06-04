"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  Footprints,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  ShoppingCart,
  Tag,
  User,
  Users,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '@/services/api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UsuarioLogado = {
  nome: string;
  email: string;
  perfil: string;
};

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
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('kickhub_usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  const iniciais = useMemo(() => {
    if (!usuario?.nome) return 'KH';
    return usuario.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase();
  }, [usuario]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor', error);
    } finally {
      localStorage.removeItem('kickhub_usuario');
      router.push('/login');
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-800 bg-[#0f0f0f] transition-transform">
      <div className="flex h-full flex-col px-3 py-6">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <Footprints size={20} />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase italic">
            Kick<span className="text-red-600">Hub</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item, index) => {
            if (item.type === 'header') {
              return (
                <div
                  key={index}
                  className="px-2 pb-1 pt-6 text-[10px] font-black tracking-[0.2em] text-neutral-600 uppercase"
                >
                  {item.label}
                </div>
              );
            }

            if (!item.href || !item.icon) return null;

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href + index}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-red-600/10 text-red-500 border border-red-600/20 shadow-[0_0_20px_rgba(220,38,38,0.05)]'
                    : 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200 border border-transparent',
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-red-500" : "text-neutral-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="mt-auto pt-6 border-t border-neutral-800/50">
          <div className="flex items-center justify-between rounded-2xl bg-neutral-900/40 p-3 border border-neutral-800/50 group">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-xs font-black text-white border border-neutral-700 shadow-inner group-hover:border-red-600/50 transition-colors">
                {usuario ? iniciais : <User size={18} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-white truncate leading-none mb-1">
                  {usuario?.nome?.split(' ')[0] ?? 'Usuário'}
                </span>
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter truncate">
                  {usuario?.perfil ?? 'Admin'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Sair do sistema"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
