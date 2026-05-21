"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { produtoService } from '@/services/produtoService';
import { categoriaService } from '@/services/categoriaService';
import ProdutoForm from '@/components/forms/ProdutoForm';
import { Produto, Categoria } from '@/types';

const MySwal = withReactContent(Swal);

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produtoData, categoriasData] = await Promise.all([
          produtoService.buscarPorId(Number(id)),
          categoriaService.listar()
        ]);
        setProduto(produtoData);
        setCategorias(categoriasData);
      } catch (error) {
        MySwal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
        router.push('/produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      await produtoService.atualizar(Number(id), data);
      await MySwal.fire({
        title: 'Sucesso!',
        text: 'Produto atualizado com sucesso.',
        icon: 'success',
        background: '#1a1a1a',
        color: '#fff'
      });
      router.push('/produtos');
    } catch (error) {
      MySwal.fire('Erro', 'Não foi possível atualizar o produto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white">Carregando...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Editar Produto</h1>
        <p className="text-neutral-500">Atualize as informações do sneaker no catálogo.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-8 shadow-sm">
        {produto && (
          <ProdutoForm 
            initialData={produto} 
            categorias={categorias} 
            onSubmit={handleSubmit} 
            isLoading={saving} 
          />
        )}
      </div>
    </div>
  );
}
