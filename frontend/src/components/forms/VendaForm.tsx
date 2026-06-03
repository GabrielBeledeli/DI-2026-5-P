"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, Plus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { Cliente, Produto } from '@/types';

const vendaSchema = z.object({
  clienteId: z.coerce.number().min(1, 'Selecione um cliente'),
  itens: z.array(z.object({
    produtoId: z.coerce.number().min(1, 'Selecione um produto'),
    quantidade: z.coerce.number().min(1, 'Mínimo 1'),
    precoUnitario: z.coerce.number(),
  })).min(1, 'Adicione pelo menos um item'),
});

type VendaFormData = z.infer<typeof vendaSchema>;
type VendaFormValues = z.input<typeof vendaSchema>;

interface VendaFormProps {
  clientes: Cliente[];
  produtos: Produto[];
  onSubmit: (data: VendaFormData) => void;
  isLoading?: boolean;
}

export default function VendaForm({ clientes, produtos, onSubmit, isLoading }: VendaFormProps) {
  const [total, setTotal] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VendaFormValues, unknown, VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteId: 0,
      itens: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });

  const watchedItens = useWatch({
    control,
    name: "itens",
    defaultValue: [],
  });

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const parseCurrencyNumber = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;

    const trimmed = value.replace(/R\$\s?/i, "").trim();
    const normalized = trimmed.includes(",")
      ? trimmed.replace(/\./g, "").replace(",", ".")
      : trimmed;

    return toNumber(normalized);
  };

  const findProdutoById = (produtoId: unknown) =>
    produtos.find((produto) => String(produto.id) === String(produtoId));

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    const newTotal = watchedItens.reduce((acc, item) => {
      return acc + (toNumber(item?.quantidade) * toNumber(item?.precoUnitario));
    }, 0);
    setTotal(newTotal);
  }, [watchedItens]);

  const handleAddProduto = () => {
    append({ produtoId: 0, quantidade: 1, precoUnitario: 0 });
  };

  const handleProdutoChange = (index: number, produtoId: string) => {
    const produto = findProdutoById(produtoId);
    if (produto) {
      setValue(`itens.${index}.precoUnitario`, parseCurrencyNumber(produto.preco), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      const quantidadeAtual = toNumber(watchedItens[index]?.quantidade);
      if (quantidadeAtual > produto.estoque) {
        setValue(`itens.${index}.quantidade`, produto.estoque, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card title="Informações da Venda">
        <Select
          label="Cliente"
          options={clientes.map(c => ({ value: c.id, label: c.nome }))}
          error={errors.clienteId?.message}
          {...register('clienteId')}
        />
      </Card>

      <Card 
        title="Produtos" 
        headerAction={
          <Button type="button" size="sm" onClick={handleAddProduto} leftIcon={<Plus size={16} />}>
            Adicionar Item
          </Button>
        }
      >
        {fields.length > 0 ? (
          <div className="space-y-4">
            <Table headers={['Produto', 'Quantidade', 'Preço Unit.', 'Subtotal', 'Ações']}>
              {fields.map((field, index) => {
                const quantidade = toNumber(watchedItens[index]?.quantidade);
                const precoUnitario = toNumber(watchedItens[index]?.precoUnitario);
                const subtotal = quantidade * precoUnitario;
                const selectedProduto = findProdutoById(watchedItens[index]?.produtoId);
                
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <input type="hidden" {...register(`itens.${index}.precoUnitario` as const)} />
                      <Select
                        options={produtos.map(p => ({ value: p.id, label: p.nome }))}
                        error={errors.itens?.[index]?.produtoId?.message}
                        {...register(`itens.${index}.produtoId` as const, {
                          onChange: (e) => handleProdutoChange(index, e.target.value)
                        })}
                        className="h-9 min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        max={selectedProduto?.estoque}
                        error={errors.itens?.[index]?.quantidade?.message}
                        {...register(`itens.${index}.quantidade` as const)}
                        className="h-9 w-20"
                      />
                      {selectedProduto && (
                        <p className="mt-1 text-xs text-neutral-500">Disponível: {selectedProduto.estoque}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatCurrency(precoUnitario)}
                    </TableCell>
                    <TableCell className="text-red-500 font-bold">
                      {formatCurrency(subtotal)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="text-neutral-500 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
            
            <div className="flex justify-end pt-4">
              <div className="text-right">
                <p className="text-sm text-neutral-500">Valor Total</p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <p>Nenhum produto adicionado à venda.</p>
            {errors.itens?.message && <p className="text-red-500 text-sm mt-2">{errors.itens.message}</p>}
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading} size="lg" className="px-12">
          Finalizar Venda
        </Button>
      </div>
    </form>
  );
}
