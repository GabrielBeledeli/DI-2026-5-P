"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { clienteService } from "@/services/clienteService";
import { Cliente, PaginationMeta } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Pagination from "@/components/ui/Pagination";
import Table, { TableCell, TableRow } from "@/components/ui/Table";
import {
  AppSwal as MySwal,
  showErrorAlert,
  showSuccessAlert,
} from "@/lib/alerts";

const PAGE_SIZE = 50;
const initialPagination: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

export default function ClientesPage() {
  return (
    <Suspense fallback={null}>
      <ClientesContent />
    </Suspense>
  );
}

function ClientesContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);

  const fetchClientes = useCallback(async (pageToLoad = page, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await clienteService.listarPaginado({
        page: pageToLoad,
        limit: PAGE_SIZE,
        search,
      });
      setClientes(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error(error);
      showErrorAlert(error, "Nao foi possivel carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchClientes(page, searchTerm);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [fetchClientes, page, searchTerm]);

  const handleDelete = async (id: number, nome: string) => {
    const result = await MySwal.fire({
      title: "Tem certeza?",
      text: `Deseja realmente excluir o cliente ${nome}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      background: "#1a1a1a",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await clienteService.deletar(id);
        showSuccessAlert("Sucesso", "Cliente excluido com sucesso.");
        await fetchClientes(page);
      } catch (error) {
        showErrorAlert(error, "Nao foi possivel excluir o cliente.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Clientes
          </h1>
          <p className="text-neutral-500">
            Gerencie sua base de clientes corporativos.
          </p>
        </div>
        <Link href="/clientes/novo">
          <Button leftIcon={<Plus size={18} />}>Novo Cliente</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou cidade..."
              className="w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] py-2 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:outline-none"
              value={searchTerm}
              onChange={(event) => {
                setPage(1);
                setSearchTerm(event.target.value);
              }}
            />
          </div>
        </div>

        <Table
          headers={["Nome", "E-mail", "Cidade", "Pais", "Acoes"]}
          isLoading={loading}
        >
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium text-white">
                {cliente.nome}
              </TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>
                {cliente.cidade} / {cliente.estado}
              </TableCell>
              <TableCell>
                <Badge variant="info">{cliente.pais}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/clientes/${cliente.id}/editar`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-400 hover:text-blue-300"
                    >
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
          {!loading && clientes.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-neutral-500"
              >
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </Table>

        <div className="mt-4">
          <Pagination
            meta={pagination}
            isLoading={loading}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
