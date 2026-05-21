"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { categoriaService } from '@/services/categoriaService';
import { Categoria } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import CategoriaForm from '@/components/forms/CategoriaForm';

const MySwal = withReactContent(Swal);

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaService.listar();
      setCategorias(data);
    } catch (error) {
      MySwal.fire('Erro', 'Não foi possível carregar as categorias.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleDelete = async (id: number, nome: string) => {
    const result = await MySwal.fire({
      title: 'Tem certeza?',
      text: `Deseja realmente excluir a categoria ${nome}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await categoriaService.deletar(id);
        MySwal.fire('Sucesso', 'Categoria excluída com sucesso.', 'success');
        fetchCategorias();
      } catch (error) {
        MySwal.fire('Erro', 'Não foi possível excluir a categoria.', 'error');
      }
    }
  };

  const handleOpenModal = (categoria?: Categoria) => {
    setEditingCategoria(categoria);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCategoria(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      if (editingCategoria) {
        await categoriaService.atualizar(editingCategoria.id, data);
        MySwal.fire('Sucesso', 'Categoria atualizada.', 'success');
      } else {
        await categoriaService.criar(data);
        MySwal.fire('Sucesso', 'Categoria criada.', 'success');
      }
      fetchCategorias();
      handleCloseModal();
    } catch (error) {
      MySwal.fire('Erro', 'Não foi possível salvar a categoria.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Categorias</h1>
          <p className="text-neutral-500">Organize seus produtos por categorias.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>
          Nova Categoria
        </Button>
      </div>

      <Card>
        <Table headers={['Nome', 'Total de Produtos', 'Ações']} isLoading={loading}>
          {categorias.map((categoria) => (
            <TableRow key={categoria.id}>
              <TableCell className="font-medium text-white">{categoria.nome}</TableCell>
              <TableCell>{categoria.totalProdutos || 0}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-blue-400 hover:text-blue-300"
                    onClick={() => handleOpenModal(categoria)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-400"
                    onClick={() => handleDelete(categoria.id, categoria.nome)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!loading && categorias.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-10 text-center text-neutral-500">
                Nenhuma categoria encontrada.
              </TableCell>
            </TableRow>
          )}
        </Table>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
        size="sm"
      >
        <CategoriaForm 
          initialData={editingCategoria} 
          onSubmit={handleSubmit} 
          isLoading={saving} 
        />
      </Modal>
    </div>
  );
}
