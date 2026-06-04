"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, Plus, Search, ShoppingCart, Check, X, Minus, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Autocomplete from '@/components/ui/Autocomplete';
import { Cliente, Produto } from '@/types';
import { clsx } from 'clsx';

const vendaSchema = z.object({
  clienteId: z.coerce.number().min(1, 'Selecione um cliente'),
  status: z.enum(['CONCLUIDA', 'PENDENTE_PAGAMENTO']),
  itens: z.array(z.object({
    produtoId: z.coerce.number().min(1, 'Selecione um produto'),
    quantidade: z.coerce.number().min(1, 'Mínimo 1'),
    precoUnitario: z.coerce.number(),
    nome: z.string().optional(),
    marca: z.string().optional(),
    tamanho: z.string().optional(),
    estoque: z.number().optional(),
  })).min(1, 'Adicione pelo menos um item'),
});

type VendaFormData = z.infer<typeof vendaSchema>;

interface VendaFormProps {
  clientes: Cliente[];
  produtos: Produto[];
  onSubmit: (data: VendaFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<VendaFormData>;
  submitLabel?: string;
}

export default function VendaForm({ clientes, produtos, onSubmit, isLoading, initialData, submitLabel = "Registrar Venda" }: VendaFormProps) {
  const [productSearch, setProductSearch] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [total, setTotal] = useState(0);
  
  const productContainerRef = useRef<HTMLDivElement>(null);

  const hasLoadedInitialData = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteId: 0,
      status: 'PENDENTE_PAGAMENTO',
      itens: [],
    },
  });

  // Garante que o reset ocorra apenas uma vez quando os dados chegarem do backend
  useEffect(() => {
    if (initialData && !hasLoadedInitialData.current) {
      reset({
        clienteId: initialData.clienteId || 0,
        status: initialData.status || 'PENDENTE_PAGAMENTO',
        itens: initialData.itens || [],
      });
      hasLoadedInitialData.current = true;
    }
  }, [initialData, reset]);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "itens",
  });

  const watchedItens = useWatch({
    control,
    name: "itens",
    defaultValue: [],
  });

  const statusValue = watch('status');
  const clienteIdValue = watch('clienteId');

  const filteredProdutos = useMemo(() => {
    const search = productSearch.toLowerCase().trim();
    if (!search && !isProductDropdownOpen) return [];
    return (produtos || []).filter(p => 
      p.nome.toLowerCase().includes(search) ||
      p.marca?.toLowerCase().includes(search) ||
      p.cor?.toLowerCase().includes(search) ||
      p.tamanho?.toLowerCase().includes(search) ||
      String(p.id).includes(search)
    );
  }, [produtos, productSearch, isProductDropdownOpen]);

  const formatCurrency = (value?: number) =>
    (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    const currentItens = getValues('itens') || [];
    const newTotal = currentItens.reduce((acc, item) => {
      const q = Number(item?.quantidade) || 0;
      const p = Number(item?.precoUnitario) || 0;
      return acc + (q * p);
    }, 0);
    setTotal(newTotal);
  }, [watchedItens, getValues]);

  // Click fora para fechar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productContainerRef.current && !productContainerRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductRowClick = (produto: Produto) => {
    const currentItens = getValues('itens') || [];
    const existingIndex = currentItens.findIndex(item => Number(item.produtoId) === Number(produto.id));
    
    if (existingIndex !== -1) {
      const currentItem = currentItens[existingIndex];
      if (Number(currentItem.quantidade) < Number(produto.estoque)) {
        update(existingIndex, {
          ...currentItem,
          quantidade: Number(currentItem.quantidade) + 1
        });
      }
    } else {
      append({
        produtoId: Number(produto.id),
        quantidade: 1,
        precoUnitario: Number(produto.preco),
        nome: produto.nome,
        marca: produto.marca,
        tamanho: produto.tamanho,
        cor: (produto as any).cor,
        genero: (produto as any).genero,
        estoque: Number(produto.estoque)
      });
    }
    
    setIsProductDropdownOpen(false);
    setProductSearch('');
  };

  const updateQuantity = (index: number, delta: number) => {
    const currentItens = getValues('itens');
    const item = currentItens[index];
    if (!item) return;

    const currentQty = Number(item.quantidade);
    const maxQty = Number(item.estoque) || 999;
    const newQty = Math.max(1, Math.min(maxQty, currentQty + delta));
    
    update(index, { ...item, quantidade: newQty });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-full pb-32">
      {/* 1. CLIENTE */}
      <Card title="1. Identificação do Cliente">
        <Autocomplete
          placeholder="Comece a digitar o nome do cliente..."
          options={clientes.map(c => ({ 
            value: c.id, 
            label: c.nome,
            description: `${c.email} | ${c.cidade}-${c.estado}`
          }))}
          value={clienteIdValue}
          onChange={(val) => setValue('clienteId', Number(val), { shouldValidate: true })}
          error={errors.clienteId?.message}
        />
      </Card>

      {/* 2. BUSCADOR DE PRODUTO (OVERLAY) */}
      <Card title="2. Adicionar Produto à Venda">
        <div className="relative" ref={productContainerRef}>
          <div className={clsx(
            "group relative flex items-center rounded-lg border bg-[#0f0f0f] transition-all",
            isProductDropdownOpen ? "border-red-600 ring-1 ring-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-neutral-800"
          )}>
            <Search className="absolute left-4 text-neutral-500 group-hover:text-red-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Pesquise o produto (Nome, Marca, Cor, Gênero, Tamanho)..."
              className="w-full bg-transparent py-4 pl-12 pr-4 text-white outline-none placeholder:text-neutral-600 font-medium"
              value={productSearch}
              onFocus={() => setIsProductDropdownOpen(true)}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setIsProductDropdownOpen(true);
              }}
            />
            {productSearch && (
              <button 
                type="button" 
                onClick={() => setProductSearch('')}
                className="absolute right-4 text-neutral-500 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* PAINEL FLUTUANTE (POP-UP) */}
          {isProductDropdownOpen && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-[450px] overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-150">
              <div className="overflow-y-auto max-h-[450px]">
                <Table 
                  headers={['ID', 'Nome', 'Marca', 'Categoria', 'Cor', 'Gênero', 'Tam', 'Preço', 'Estoque']}
                  className="!mb-0"
                >
                  {filteredProdutos.length > 0 ? (
                    filteredProdutos.map((produto) => {
                      const isInCart = watchedItens.some(item => item.produtoId === produto.id);
                      return (
                        <TableRow 
                          key={produto.id} 
                          onClick={() => handleProductRowClick(produto)}
                          className="cursor-pointer hover:bg-red-600/10 transition-colors group/row border-b border-neutral-900/50 last:border-0"
                        >
                          <TableCell className="font-mono text-[10px] text-neutral-500 group-hover/row:text-red-500">#{produto.id}</TableCell>
                          <TableCell className="font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {produto.nome}
                              {isInCart && <Check size={14} className="text-green-500" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-neutral-400 group-hover/row:text-neutral-200">{produto.marca}</TableCell>
                          <TableCell className="text-neutral-500 group-hover/row:text-neutral-300 text-xs">{produto.categoria?.nome || '-'}</TableCell>
                          <TableCell className="text-neutral-400">{produto.cor}</TableCell>
                          <TableCell className="text-neutral-500">{produto.genero || '-'}</TableCell>
                          <TableCell className="font-black text-white">{produto.tamanho}</TableCell>
                          <TableCell className="text-green-500 font-black whitespace-nowrap">{formatCurrency(produto.preco)}</TableCell>
                          <TableCell>
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-bold border",
                              produto.estoque <= 0 ? "bg-red-500/5 border-red-500/20 text-red-500" :
                              produto.estoque < 5 ? "bg-orange-500/5 border-orange-500/20 text-orange-500" : "bg-neutral-800 border-neutral-700 text-neutral-400"
                            )}>
                              {produto.estoque} un
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center text-neutral-600 font-medium">
                        {productSearch ? 'Nenhum resultado para esta pesquisa.' : 'Digite o que procura para ver a lista de produtos.'}
                      </TableCell>
                    </TableRow>
                  )}
                </Table>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 3. CARRINHO (BOX CENTRAL) */}
      <Card 
        title="3. Carrinho de Compras" 
        icon={<ShoppingCart size={18} className="text-red-600" />}
        className={clsx(fields.length === 0 && "opacity-60 saturate-50")}
      >
        {fields.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 overflow-hidden bg-[#0a0a0a]">
              <Table headers={['Item Detalhado', 'Quantidade / Estoque', 'Preço Unit.', 'Total Item', 'Remover']}>
                {fields.map((field, index) => (
                  <TableRow key={field.id} className="border-b border-neutral-900 last:border-0 hover:bg-neutral-900/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-6">
                        {/* MARCA À ESQUERDA */}
                        <div className="flex flex-col min-w-[70px]">
                          <span className="text-xs font-black text-red-500 uppercase tracking-tighter">
                            {watchedItens[index]?.marca || 'N/A'}
                          </span>
                        </div>
                        
                        {/* INFO CENTRAL AGRUPADA (NOME, TAM, SKU, COR, GÊNERO) */}
                        <div className="flex flex-col gap-1.5 py-1">
                          <p className="text-sm font-black text-white leading-tight">
                            {watchedItens[index]?.nome}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-bold uppercase">
                              TAM {watchedItens[index]?.tamanho}
                            </span>
                            <span className="text-[10px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono font-bold">
                              SKU #{watchedItens[index]?.produtoId}
                            </span>
                            <span className="text-[10px] bg-red-600/5 text-white px-1.5 py-0.5 rounded border border-white/5 font-bold uppercase">
                              {watchedItens[index]?.cor || '-'}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">
                              {watchedItens[index]?.genero || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(index, -1)}
                            className="h-9 w-9 flex items-center justify-center hover:bg-neutral-800 text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 text-center font-black text-white text-lg">{watchedItens[index]?.quantidade}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(index, 1)}
                            className="h-9 w-9 flex items-center justify-center hover:bg-neutral-800 text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter">Estoque</span>
                          <span className="text-xs font-bold text-neutral-400">{watchedItens[index]?.estoque} un</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-400 font-bold">
                      {formatCurrency(watchedItens[index]?.precoUnitario)}
                    </TableCell>
                    <TableCell className="text-white font-black text-lg">
                      {formatCurrency((watchedItens[index]?.quantidade ?? 0) * (watchedItens[index]?.precoUnitario ?? 0))}
                    </TableCell>
                    <TableCell>
                      <button 
                        type="button" 
                        onClick={() => remove(index)}
                        className="h-10 w-10 rounded-xl bg-red-600/5 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all group"
                      >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
            
            <div className="flex justify-between items-center px-8 py-6 rounded-2xl bg-neutral-900 border-2 border-neutral-800 border-dashed">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-neutral-500 uppercase tracking-widest leading-none">Total Parcial do Carrinho</p>
                  <p className="text-sm font-medium text-neutral-400 mt-1">Soma de todos os {watchedItens.length} itens selecionados</p>
                </div>
              </div>
              <span className="text-4xl font-black text-white tracking-tighter">{formatCurrency(total)}</span>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800">
                <ShoppingCart size={32} className="text-neutral-800" />
              </div>
              <Plus className="absolute -bottom-1 -right-1 text-red-600 bg-black rounded-full" size={24} />
            </div>
            <div className="max-w-[250px] space-y-2">
              <p className="text-lg font-black text-neutral-400 uppercase tracking-tighter leading-none">O Carrinho está vazio</p>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">Use o campo de busca acima e clique em um produto para adicioná-lo ao pedido.</p>
            </div>
            {errors.itens?.message && (
              <div className="px-4 py-2 rounded bg-red-600/10 border border-red-600/20">
                <p className="text-red-500 text-xs font-black uppercase tracking-widest">{errors.itens.message}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 4. STATUS DA VENDA */}
      <Card title="4. Finalização e Status">
        <div className="grid grid-cols-2 gap-4">
          <label className="relative cursor-pointer group">
            <input type="radio" {...register('status')} value="PENDENTE_PAGAMENTO" className="peer sr-only" />
            <div className={clsx(
              "flex h-24 flex-col items-center justify-center rounded-2xl border-2 bg-[#0f0f0f] transition-all duration-300",
              "border-neutral-800 text-neutral-500 group-hover:border-neutral-700",
              "peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-500 peer-checked:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            )}>
              <span className="text-sm font-black uppercase tracking-widest leading-none mb-1">Pendente</span>
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Aguardando Pagamento / Reserva</span>
            </div>
          </label>

          <label className="relative cursor-pointer group">
            <input type="radio" {...register('status')} value="CONCLUIDA" className="peer sr-only" />
            <div className={clsx(
              "flex h-24 flex-col items-center justify-center rounded-2xl border-2 bg-[#0f0f0f] transition-all duration-300",
              "border-neutral-800 text-neutral-500 group-hover:border-neutral-700",
              "peer-checked:border-green-500 peer-checked:bg-green-500/10 peer-checked:text-green-500 peer-checked:shadow-[0_0_20px_rgba(34,197,94,0.15)]"
            )}>
              <span className="text-sm font-black uppercase tracking-widest leading-none mb-1">Concluída</span>
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Venda Finalizada com Sucesso</span>
            </div>
          </label>
        </div>
      </Card>

      {/* RODAPÉ ESTRUTURAL */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-2xl border-t border-neutral-800 p-8 flex items-center justify-center shadow-[0_-10px_50px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] leading-none mb-2">Total Final do Pedido</span>
              <p className="text-5xl font-black text-white leading-none tracking-tighter">{formatCurrency(total)}</p>
            </div>
            <ArrowRight className="text-neutral-800" size={32} />
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Status Selecionado</span>
              <p className={clsx(
                "text-xs font-black uppercase px-2 py-1 rounded inline-block",
                statusValue === 'CONCLUIDA' ? "bg-green-600/10 text-green-500" : "bg-amber-600/10 text-amber-500"
              )}>
                {statusValue === 'CONCLUIDA' ? 'Finalizada' : 'Pendente de Pagamento'}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={() => window.history.back()} 
              className="h-16 px-10 border-neutral-800 hover:bg-neutral-900 text-neutral-500 font-black uppercase tracking-tighter"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading} 
              size="lg" 
              className="h-16 px-16 bg-red-600 hover:bg-red-700 text-white font-black text-xl shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all active:scale-95"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
