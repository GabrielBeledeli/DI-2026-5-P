"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

type UsuarioLogado = {
  nome: string;
  email: string;
  perfil: string;
};

export default function Header() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('kickhub_usuario');

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  const iniciais = useMemo(() => {
    if (!usuario?.nome) {
      return 'KH';
    }

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
    <header className="fixed right-0 top-0 z-30 flex h-16 w-[calc(100%-16rem)] items-center justify-end border-b border-neutral-800 bg-[#0f0f0f]/80 px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1 text-neutral-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
            {usuario ? iniciais : <User size={18} />}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">{usuario?.nome ?? 'Perfil'}</span>
            <span className="text-xs text-neutral-500">{usuario?.perfil ?? 'Usuário'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-[#1a1a1a] hover:text-white"
          title="Sair"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
