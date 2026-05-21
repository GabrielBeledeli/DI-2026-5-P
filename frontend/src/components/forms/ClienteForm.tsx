"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Cliente } from '@/types';

const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  initialData?: Cliente;
  onSubmit: (data: ClienteFormData) => void;
  isLoading?: boolean;
}

export default function ClienteForm({ initialData, onSubmit, isLoading }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: initialData || {
      nome: '',
      email: '',
      cidade: '',
      estado: '',
      pais: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Nome Completo"
          placeholder="Ex: João Silva"
          error={errors.nome?.message}
          {...register('nome')}
        />
        <Input
          label="E-mail"
          placeholder="Ex: joao@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Cidade"
          placeholder="Ex: São Paulo"
          error={errors.cidade?.message}
          {...register('cidade')}
        />
        <Input
          label="Estado"
          placeholder="Ex: SP"
          error={errors.estado?.message}
          {...register('estado')}
        />
        <Input
          label="País"
          placeholder="Ex: Brasil"
          error={errors.pais?.message}
          {...register('pais')}
          containerClassName="md:col-span-2"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </form>
  );
}
