"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vendaService } from '@/services/vendaService';
import { clienteService } from '@/services/clienteService';
import { produtoService } from '@/services/produtoService';
import VendaForm from '@/components/forms/VendaForm';
import { Cliente, Produto } from '@/types';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

export default function NovaVendaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, produtosData] = await Promise.all([
          clienteService.listar(),
          produtoService.listar()
        ]);
        setClientes(clientesData);
        setProdutos(produtosData.filter((produto) => produto.estoque > 0));
      } catch (error) {
        showErrorAlert(error, 'Não foi possível carregar os dados necessários.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Limpeza dos dados: remove campos extras que o backend não aceita
      const cleanData = {
        ...data,
        itens: data.itens.map((item: any) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario
        }))
      };

      await vendaService.criar(cleanData);
      await showSuccessAlert('Venda Registrada', 'A venda foi processada com sucesso.');
      router.push('/vendas');
    } catch (error) {
      showErrorAlert(error, 'Não foi possível finalizar a venda.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="text-white">Carregando...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Nova Venda</h1>
        <p className="text-neutral-500">Registre uma nova venda selecionando o cliente e os produtos.</p>
      </div>

      <VendaForm 
        clientes={clientes} 
        produtos={produtos} 
        onSubmit={handleSubmit} 
        isLoading={loading} 
        submitLabel="Registrar Venda"
      />
    </div>
  );
}
