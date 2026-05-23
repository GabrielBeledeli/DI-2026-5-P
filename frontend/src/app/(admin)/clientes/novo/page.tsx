"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { clienteService } from '@/services/clienteService';
import ClienteForm, { ClienteFormData } from '@/components/forms/ClienteForm';

const MySwal = withReactContent(Swal);

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ClienteFormData) => {
    try {
      setLoading(true);
      await clienteService.criar(data);
      await MySwal.fire({
        title: 'Sucesso!',
        text: 'Cliente cadastrado com sucesso.',
        icon: 'success',
        background: '#1a1a1a',
        color: '#fff',
      });
      router.push('/clientes');
    } catch {
      MySwal.fire('Erro', 'Não foi possível cadastrar o cliente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Novo Cliente</h1>
        <p className="text-neutral-500">Preencha os dados abaixo para cadastrar um novo cliente.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-8 shadow-sm">
        <ClienteForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
