"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { produtoService } from '@/services/produtoService';
import { categoriaService } from '@/services/categoriaService';
import ProdutoForm from '@/components/forms/ProdutoForm';
import { Categoria } from '@/types';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await categoriaService.listar();
        setCategorias(data);
      } catch (error) {
        showErrorAlert(error, 'Não foi possível carregar as categorias.');
      }
    };
    fetchCategorias();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await produtoService.criar(data);
      await showSuccessAlert('Sucesso!', 'Produto cadastrado com sucesso.');
      router.push('/produtos');
    } catch (error) {
      showErrorAlert(error, 'Não foi possível cadastrar o produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Novo Produto</h1>
        <p className="text-neutral-500">Preencha os dados abaixo para cadastrar um novo sneaker no catálogo.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-8 shadow-sm">
        <ProdutoForm categorias={categorias} onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
