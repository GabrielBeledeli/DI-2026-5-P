"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { clienteService } from '@/services/clienteService';
import ClienteForm from '@/components/forms/ClienteForm';
import { Cliente } from '@/types';

const MySwal = withReactContent(Swal);

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const data = await clienteService.buscarPorId(Number(id));
        setCliente(data);
      } catch (error) {
        MySwal.fire('Erro', 'Não foi possível carregar os dados do cliente.', 'error');
        router.push('/clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      await clienteService.atualizar(Number(id), data);
      await MySwal.fire({
        title: 'Sucesso!',
        text: 'Cliente atualizado com sucesso.',
        icon: 'success',
        background: '#1a1a1a',
        color: '#fff'
      });
      router.push('/clientes');
    } catch (error) {
      MySwal.fire('Erro', 'Não foi possível atualizar o cliente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white">Carregando...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Editar Cliente</h1>
        <p className="text-neutral-500">Atualize as informações do cliente abaixo.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-8 shadow-sm">
        {cliente && <ClienteForm initialData={cliente} onSubmit={handleSubmit} isLoading={saving} />}
      </div>
    </div>
  );
}
