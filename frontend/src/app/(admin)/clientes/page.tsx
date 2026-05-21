"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { clienteService } from '@/services/clienteService';
import { Cliente } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

const MySwal = withReactContent(Swal);

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.listar();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error(error);
      MySwal.fire('Erro', 'Não foi possível carregar os clientes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    const filtered = clientes.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const handleDelete = async (id: number, nome: string) => {
    const result = await MySwal.fire({
      title: 'Tem certeza?',
      text: `Deseja realmente excluir o cliente ${nome}?`,
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
        await clienteService.deletar(id);
        MySwal.fire('Sucesso', 'Cliente excluído com sucesso.', 'success');
        fetchClientes();
      } catch (error) {
        MySwal.fire('Erro', 'Não foi possível excluir o cliente.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
          <p className="text-neutral-500">Gerencie sua base de clientes corporativos.</p>
        </div>
        <Link href="/clientes/novo">
          <Button leftIcon={<Plus size={18} />}>Novo Cliente</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] py-2 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table headers={['Nome', 'E-mail', 'Cidade', 'País', 'Ações']} isLoading={loading}>
          {filteredClientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium text-white">{cliente.nome}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.cidade || '-'} / {cliente.estado || '-'}</TableCell>
              <TableCell>
                <Badge variant="info">{cliente.pais || 'Brasil'}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/clientes/${cliente.id}/editar`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300">
                      <Pencil size={16} />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-400"
                    onClick={() => handleDelete(cliente.id, cliente.nome)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!loading && filteredClientes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-neutral-500">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </Table>
      </Card>
    </div>
  );
}
