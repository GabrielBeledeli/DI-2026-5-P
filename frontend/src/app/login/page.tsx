"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Footprints, Lock, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import { AppSwal as MySwal } from '@/lib/alerts';
import api from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', {
        email,
        senha: password,
      });

      localStorage.setItem('kickhub_usuario', JSON.stringify(data.usuario));
      router.push('/dashboard');
    } catch {
      MySwal.fire({
        title: 'Erro de Acesso',
        text: 'E-mail ou senha incorretos.',
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#dc2626',
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-10 shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
            <Footprints size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Kick<span className="text-red-600">Hub</span>
          </h1>
          <p className="text-sm text-neutral-500">Acesse o sistema de gestão de sneakers</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-neutral-600" />
              </div>
              <input
                type="email"
                required
                className="block w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] py-3 pl-10 pr-3 text-sm text-white placeholder-neutral-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="E-mail corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-neutral-600" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] py-3 pl-10 pr-12 text-sm text-white placeholder-neutral-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 transition-colors hover:text-white"
                aria-label={showPassword ? 'Esconder senha' : 'Visualizar senha'}
                title={showPassword ? 'Esconder senha' : 'Visualizar senha'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full py-6 text-base" isLoading={loading}>
            Entrar no Sistema
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-600">
          &copy; 2026 KickHub. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
