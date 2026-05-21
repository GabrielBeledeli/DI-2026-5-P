"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Produto, Categoria } from '@/types';

const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco: z.coerce.number().positive('O preço deve ser maior que zero'),
  estoque: z.coerce.number().min(0, 'O estoque não pode ser negativo'),
  categoriaId: z.coerce.number().optional(),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

interface ProdutoFormProps {
  initialData?: Produto;
  categorias: Categoria[];
  onSubmit: (data: ProdutoFormData) => void;
  isLoading?: boolean;
}

export default function ProdutoForm({ initialData, categorias, onSubmit, isLoading }: ProdutoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: initialData ? {
      nome: initialData.nome,
      preco: initialData.preco,
      estoque: initialData.estoque,
      categoriaId: initialData.categoriaId,
    } : {
      nome: '',
      preco: 0,
      estoque: 0,
    },
  });

  const categoriaOptions = categorias.map(cat => ({
    value: cat.id,
    label: cat.nome
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Nome do Produto"
          placeholder="Ex: Air Jordan 1"
          error={errors.nome?.message}
          {...register('nome')}
          containerClassName="md:col-span-2"
        />
        <Input
          label="Preço (R$)"
          type="number"
          step="0.01"
          placeholder="0,00"
          error={errors.preco?.message}
          {...register('preco')}
        />
        <Input
          label="Estoque"
          type="number"
          placeholder="0"
          error={errors.estoque?.message}
          {...register('estoque')}
        />
        <Select
          label="Categoria"
          options={categoriaOptions}
          error={errors.categoriaId?.message}
          {...register('categoriaId')}
          containerClassName="md:col-span-2"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </Button>
      </div>
    </form>
  );
}
