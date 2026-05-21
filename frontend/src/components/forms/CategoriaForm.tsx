"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Categoria } from '@/types';

const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  initialData?: Categoria;
  onSubmit: (data: CategoriaFormData) => void;
  isLoading?: boolean;
}

export default function CategoriaForm({ initialData, onSubmit, isLoading }: CategoriaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: initialData || {
      nome: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nome da Categoria"
        placeholder="Ex: Casual"
        error={errors.nome?.message}
        {...register('nome')}
      />

      <div className="flex justify-end gap-4">
        <Button type="submit" isLoading={isLoading} className="w-full">
          {initialData ? 'Atualizar Categoria' : 'Cadastrar Categoria'}
        </Button>
      </div>
    </form>
  );
}
