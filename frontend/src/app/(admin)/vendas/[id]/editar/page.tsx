"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { vendaService } from '@/services/vendaService';
import { clienteService } from '@/services/clienteService';
import { produtoService } from '@/services/produtoService';
import VendaForm from '@/components/forms/VendaForm';
import { Cliente, Produto, Venda } from '@/types';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

interface EditarVendaPageProps {
  params: Promise<{ id: string }>;
}

export default function EditarVendaPage({ params }: EditarVendaPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [venda, setVenda] = useState<Venda | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, produtosData, vendaData] = await Promise.all([
          clienteService.listar(),
          produtoService.listar(),
          vendaService.buscarPorId(Number(id))
        ]);
        
        if (vendaData.status !== 'PENDENTE_PAGAMENTO') {
          showErrorAlert(null, 'Esta venda não pode ser editada pois já foi finalizada ou cancelada.');
          router.push('/vendas');
          return;
        }

        setClientes(clientesData);
        setProdutos(produtosData);
        setVenda(vendaData);
      } catch (error) {
        showErrorAlert(error, 'Não foi possível carregar os dados da venda.');
        router.push('/vendas');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Limpeza dos dados: remove campos extras (nome, marca, etc) que o backend rejeita no PATCH
      // Garante que o payload enviado contenha os itens modificados
      const cleanData = {
        clienteId: Number(data.clienteId),
        status: data.status,
        itens: data.itens.map((item: any) => ({
          produtoId: Number(item.produtoId),
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario)
        }))
      };

      await vendaService.atualizar(Number(id), cleanData);
      await showSuccessAlert('Sucesso!', 'Venda atualizada com sucesso.');
      router.push('/vendas');
    } catch (error) {
      showErrorAlert(error, 'Não foi possível atualizar a venda.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="text-white p-8">Carregando...</div>;
  if (!venda) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic">
          Editar <span className="text-red-600">Venda</span> #{id.padStart(6, '0')}
        </h1>
        <p className="text-neutral-500">Altere o status ou manipule os itens da venda pendente.</p>
      </div>

      <VendaForm 
        clientes={clientes} 
        produtos={produtos} 
        onSubmit={handleSubmit} 
        isLoading={loading}
        submitLabel="Atualizar Venda"
        initialData={{
          clienteId: venda.clienteId,
          status: venda.status as any,
          itens: venda.itens?.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            nome: item.produto?.nome,
            marca: item.produto?.marca,
            tamanho: item.produto?.tamanho,
            cor: item.produto?.cor,
            genero: item.produto?.genero,
            estoque: item.produto?.estoque
          }))
        }}
      />
    </div>
  );
}
