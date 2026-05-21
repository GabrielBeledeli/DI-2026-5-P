"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footprints, Mail, Lock, Loader2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de login
    setTimeout(() => {
      if (email === 'admin@kickhub.com' && password === 'admin123') {
        router.push('/dashboard');
      } else {
        MySwal.fire({
          title: 'Erro de Acesso',
          text: 'E-mail ou senha incorretos. Use admin@kickhub.com / admin123',
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff'
        });
        setLoading(false);
      }
    }, 1500);
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
                type="password"
                required
                className="block w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] py-3 pl-10 pr-3 text-sm text-white placeholder-neutral-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-800 bg-[#0f0f0f] text-red-600 focus:ring-red-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-neutral-500">
                Lembrar de mim
              </label>
            </div>
            <div className="text-xs">
              <a href="#" className="font-medium text-red-600 hover:text-red-500">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <Button type="submit" className="w-full py-6 text-base" isLoading={loading}>
            Entrar no Sistema
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-8">
          &copy; 2026 KickHub. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
