"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Eye, Trash2, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { vendaService } from '@/services/vendaService';
import { Venda } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

const MySwal = withReactContent(Swal);

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendas = async () => {
    try {
      setLoading(true);
      const data = await vendaService.listar();
      setVendas(data);
    } catch (error) {
      MySwal.fire('Erro', 'Não foi possível carregar as vendas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  const handleCancelar = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Cancelar venda?',
      text: 'Esta ação não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar!',
      confirmButtonColor: '#dc2626',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await vendaService.cancelar(id);
        MySwal.fire('Sucesso', 'Venda cancelada com sucesso.', 'success');
        fetchVendas();
      } catch (error) {
        MySwal.fire('Erro', 'Não foi possível cancelar a venda.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Vendas</h1>
          <p className="text-neutral-500">Histórico e gestão de pedidos realizados.</p>
        </div>
        <Link href="/vendas/nova">
          <Button leftIcon={<Plus size={18} />}>Nova Venda</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                type="text"
                placeholder="Buscar por cliente ou ID..."
                className="w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] py-2 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:outline-none"
              />
            </div>
            <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
              Filtros
            </Button>
          </div>
        </div>

        <Table headers={['ID', 'Cliente', 'Data', 'Total', 'Status', 'Ações']} isLoading={loading}>
          {vendas.map((venda) => (
            <TableRow key={venda.id}>
              <TableCell className="font-mono text-xs text-neutral-500">#{venda.id.toString().padStart(6, '0')}</TableCell>
              <TableCell className="font-medium text-white">{venda.cliente?.nome || 'N/A'}</TableCell>
              <TableCell>{new Date(venda.data).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell className="text-white font-bold">
                R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <Badge variant={venda.status === 'ATIVO' ? 'success' : 'error'}>
                  {venda.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                    <Eye size={16} />
                  </Button>
                  {venda.status === 'ATIVO' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-400"
                      onClick={() => handleCancelar(venda.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!loading && vendas.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-neutral-500">
                Nenhuma venda realizada.
              </TableCell>
            </TableRow>
          )}
        </Table>
      </Card>
    </div>
  );
}
