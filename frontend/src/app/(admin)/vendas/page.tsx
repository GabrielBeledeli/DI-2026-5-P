"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Trash2, Search, Filter, Edit2, ShoppingCart } from "lucide-react";
import { vendaService } from "@/services/vendaService";
import { PaginationMeta, Venda } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Pagination from "@/components/ui/Pagination";
import Table, { TableRow, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
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
  const router = useRouter();
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
  
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(searchParam);
  }, [searchParam]);

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

  const openDetails = (venda: Venda) => {
    setSelectedVenda(venda);
    setIsModalOpen(true);
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
          headers={["ID", "Cliente", "Produtos", "Data", "Total", "Status", "Acoes"]}
          isLoading={loading}
        >
          {vendas.map((venda) => (
            <TableRow 
              key={venda.id} 
              onClick={() => openDetails(venda)} 
              className="cursor-pointer hover:bg-neutral-900 transition-colors group"
            >
              <TableCell className="font-mono text-xs text-neutral-500 group-hover:text-red-500">
                #{venda.id.toString().padStart(6, "0")}
              </TableCell>
              <TableCell className="font-medium text-white">
                {venda.cliente?.nome || "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {venda.itens?.map(item => (
                    <span key={item.id} className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700">
                      #{item.produtoId}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {venda.dataVenda || venda.data
                  ? new Date(venda.dataVenda ?? venda.data ?? "").toLocaleDateString(
                      "pt-BR",
                    )
                  : "-"}
              </TableCell>
              <TableCell className="text-white font-bold whitespace-nowrap">
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
                <div className="flex items-center justify-end" onClick={e => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-0.5 w-16">
                    <div className="flex justify-center">
                      {venda.status === "PENDENTE_PAGAMENTO" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-400 hover:text-white hover:bg-white/5"
                          onClick={() => router.push(`/vendas/${venda.id}/editar`)}
                        >
                          <Edit2 size={14} />
                        </Button>
                      ) : (
                        <div className="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {venda.status !== "CANCELADO" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/5"
                          onClick={() => handleCancelar(venda.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!loading && vendas.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Detalhes da Venda #${selectedVenda?.id.toString().padStart(6, "0")}`}
        size="2xl"
      >
        {selectedVenda && (
          <div className="space-y-8 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6 flex flex-col justify-center">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Cliente</p>
                <p className="text-white font-black text-2xl leading-tight">{selectedVenda.cliente?.nome}</p>
                <p className="text-neutral-400 text-sm mt-1">{selectedVenda.cliente?.email}</p>
              </div>
              <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6 flex flex-col justify-between gap-4">
                <div className="flex justify-between items-center h-full">
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] leading-none">Status</p>
                    <Badge variant={statusVariant[selectedVenda.status] ?? "success"} className="w-fit text-sm px-4 py-1.5 font-black uppercase">
                      {statusLabel[selectedVenda.status] ?? selectedVenda.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col text-right gap-1">
                    <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] leading-none">Data da Venda</p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {new Date(selectedVenda.dataVenda || selectedVenda.data || '').toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-[#0f0f0f] shadow-inner">
              <div className="p-1">
                <Table 
                  headers={['Produto', 'Marca', 'Cor', 'Tam', 'Gênero', 'Preço Un.', 'Qtd', 'Subtotal']}
                  className="!mb-0 !border-0"
                >
                  {selectedVenda.itens?.map((item) => (
                    <TableRow key={item.id} className="border-b border-neutral-900/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-5">
                        <p className="text-white font-black text-sm uppercase tracking-tight">{item.produto?.nome}</p>
                        <p className="text-[10px] text-neutral-600 font-mono mt-0.5">SKU: {item.produtoId}</p>
                      </TableCell>
                      <TableCell className="text-neutral-400 font-bold text-xs">{item.produto?.marca}</TableCell>
                      <TableCell className="text-neutral-400 font-medium text-xs">{item.produto?.cor}</TableCell>
                      <TableCell className="font-black text-white">
                        <span className="bg-neutral-800 px-2 py-1 rounded text-xs">
                          {item.produto?.tamanho}
                        </span>
                      </TableCell>
                      <TableCell className="text-neutral-500 text-[10px] font-bold uppercase tracking-tighter">{item.produto?.genero}</TableCell>
                      <TableCell className="text-neutral-300 font-bold">
                        {Number(item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-red-600/10 text-red-500 px-2.5 py-1 rounded-lg text-xs font-black border border-red-600/10">
                          {item.quantidade}
                        </span>
                      </TableCell>
                      <TableCell className="text-white font-black text-right pr-6">
                        {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
              <div className="bg-neutral-900 p-8 flex justify-between items-center border-t border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    <ShoppingCart size={20} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] leading-none block mb-1">Total do Pedido</span>
                    <p className="text-neutral-400 text-xs font-medium">Impostos e taxas inclusas</p>
                  </div>
                </div>
                <span className="text-5xl font-black text-white tracking-tighter">
                  {Number(selectedVenda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
