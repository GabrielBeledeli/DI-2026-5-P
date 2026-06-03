"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Eye, Trash2, Search, Filter } from "lucide-react";
import { vendaService } from "@/services/vendaService";
import { PaginationMeta, Venda } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Pagination from "@/components/ui/Pagination";
import Table, { TableRow, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
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

const statusLabel: Record<string, string> = {
  CONCLUIDA: "Concluida",
  CANCELADO: "Cancelada",
  PENDENTE_PAGAMENTO: "Pendente",
  ATIVO: "Ativa",
};

const statusVariant: Record<
  string,
  "success" | "warning" | "error"
> = {
  CONCLUIDA: "success",
  CANCELADO: "error",
  PENDENTE_PAGAMENTO: "warning",
  ATIVO: "success",
};

export default function VendasPage() {
  return (
    <Suspense fallback={null}>
      <VendasContent />
    </Suspense>
  );
}

function VendasContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);

  const fetchVendas = async (pageToLoad = page) => {
    try {
      setLoading(true);
      const response = await vendaService.listarPaginado({
        page: pageToLoad,
        limit: PAGE_SIZE,
        search: searchTerm,
        status: statusFilter,
        dataInicio,
        dataFim,
      });
      setVendas(response.data);
      setPagination(response.meta);
    } catch (error) {
      showErrorAlert(error, "Nao foi possivel carregar as vendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendas(page);
  }, [page, searchTerm, statusFilter, dataInicio, dataFim]);

  const handleFilterChange = (callback: () => void) => {
    setPage(1);
    callback();
  };

  const clearFilters = () => {
    setPage(1);
    setSearchTerm("");
    setStatusFilter("");
    setDataInicio("");
    setDataFim("");
  };

  const handleCancelar = async (id: number) => {
    const result = await MySwal.fire({
      title: "Cancelar venda?",
      text: "Esta acao nao podera ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar!",
      confirmButtonColor: "#dc2626",
      background: "#1a1a1a",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await vendaService.cancelar(id);
        showSuccessAlert("Sucesso", "Venda cancelada com sucesso.");
        await fetchVendas(page);
      } catch (error) {
        showErrorAlert(error, "Nao foi possivel cancelar a venda.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Vendas
          </h1>
          <p className="text-neutral-500">
            Historico e gestao de pedidos realizados.
          </p>
        </div>
        <Link href="/vendas/nova">
          <Button leftIcon={<Plus size={18} />}>Nova Venda</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por cliente ou ID..."
                className="w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] py-2 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:outline-none"
                value={searchTerm}
                onChange={(event) =>
                  handleFilterChange(() => setSearchTerm(event.target.value))
                }
              />
            </div>
            <Button
              type="button"
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              leftIcon={<Filter size={16} />}
              onClick={() => setShowFilters((current) => !current)}
            >
              Filtros
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 grid gap-4 rounded-lg border border-neutral-800 bg-[#0f0f0f] p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
              Status
              <select
                className="h-10 rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={statusFilter}
                onChange={(event) =>
                  handleFilterChange(() => setStatusFilter(event.target.value))
                }
              >
                <option value="">Todos</option>
                <option value="CONCLUIDA">Concluida</option>
                <option value="PENDENTE_PAGAMENTO">Pendente</option>
                <option value="CANCELADO">Cancelada</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
              Data inicial
              <input
                type="date"
                className="h-10 rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={dataInicio}
                onChange={(event) =>
                  handleFilterChange(() => setDataInicio(event.target.value))
                }
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
              Data final
              <input
                type="date"
                className="h-10 rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={dataFim}
                onChange={(event) =>
                  handleFilterChange(() => setDataFim(event.target.value))
                }
              />
            </label>

            <Button type="button" variant="ghost" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        )}

        <Table
          headers={["ID", "Cliente", "Data", "Total", "Status", "Acoes"]}
          isLoading={loading}
        >
          {vendas.map((venda) => (
            <TableRow key={venda.id}>
              <TableCell className="font-mono text-xs text-neutral-500">
                #{venda.id.toString().padStart(6, "0")}
              </TableCell>
              <TableCell className="font-medium text-white">
                {venda.cliente?.nome || "N/A"}
              </TableCell>
              <TableCell>
                {venda.dataVenda || venda.data
                  ? new Date(venda.dataVenda ?? venda.data ?? "").toLocaleDateString(
                      "pt-BR",
                    )
                  : "-"}
              </TableCell>
              <TableCell className="text-white font-bold">
                R${" "}
                {Number(venda.total).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[venda.status] ?? "success"}>
                  {statusLabel[venda.status] ?? venda.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-white"
                  >
                    <Eye size={16} />
                  </Button>
                  {venda.status !== "CANCELADO" && (
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
              <TableCell
                colSpan={6}
                className="py-10 text-center text-neutral-500"
              >
                Nenhuma venda realizada.
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
