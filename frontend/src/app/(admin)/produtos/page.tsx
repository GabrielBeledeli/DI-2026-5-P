"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { produtoService } from "@/services/produtoService";
import { PaginationMeta, Produto } from "@/types";
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

export default function ProdutosPage() {
  return (
    <Suspense fallback={null}>
      <ProdutosContent />
    </Suspense>
  );
}

function ProdutosContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);

  const fetchProdutos = useCallback(async (pageToLoad = page, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await produtoService.listarPaginado({
        page: pageToLoad,
        limit: PAGE_SIZE,
        search,
      });
      setProdutos(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error(error);
      showErrorAlert(error, "Nao foi possivel carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchProdutos(page, searchTerm);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [fetchProdutos, page, searchTerm]);

  const handleDelete = async (id: number, nome: string) => {
    const result = await MySwal.fire({
      title: "Tem certeza?",
      text: `Deseja realmente excluir o produto ${nome}?`,
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
        await produtoService.deletar(id);
        showSuccessAlert("Sucesso", "Produto excluido com sucesso.");
        await fetchProdutos(page);
      } catch (error) {
        showErrorAlert(error, "Nao foi possivel excluir o produto.");
      }
    }
  };

  const getCategoriaBadge = (categoria?: string) => {
    const cat = categoria?.toLowerCase() || "";
    if (cat.includes("casual")) return <Badge variant="info">Casual</Badge>;
    if (cat.includes("running")) return <Badge variant="success">Running</Badge>;
    if (cat.includes("social")) {
      return (
        <Badge
          variant="default"
          className="bg-purple-900/30 text-purple-400 border border-purple-900/50"
        >
          Social
        </Badge>
      );
    }
    if (cat.includes("outdoor")) return <Badge variant="warning">Outdoor</Badge>;
    if (cat.includes("kids")) {
      return (
        <Badge
          variant="default"
          className="bg-pink-900/30 text-pink-400 border border-pink-900/50"
        >
          Kids
        </Badge>
      );
    }
    return <Badge variant="outline">{categoria || "Sem categoria"}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic">
            Listagem <span className="text-red-600">Produtos</span>
          </h1>
          <p className="text-neutral-500">
            Catalogo de sneakers e controle de estoque.
          </p>
        </div>
        <Link href="/produtos/novo">
          <Button leftIcon={<Plus size={18} />}>Novo Produto</Button>
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
              placeholder="Buscar por nome, marca ou categoria..."
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
          headers={[
            "SKU",
            "Nome",
            "Categoria",
            "Marca",
            "Cor",
            "Genero",
            "Tamanho",
            "Preco",
            { label: "Estoque", align: "center" },
            "Acoes",
          ]}
          isLoading={loading}
        >
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell className="font-mono text-xs text-neutral-500">
                #{produto.id}
              </TableCell>
              <TableCell className="font-medium text-white">
                {produto.nome}
              </TableCell>
              <TableCell>
                {getCategoriaBadge(
                  produto.categoria?.nome || produto.categoriaId?.toString(),
                )}
              </TableCell>
              <TableCell>{produto.marca || "-"}</TableCell>
              <TableCell>{produto.cor || "-"}</TableCell>
              <TableCell>{produto.genero || "-"}</TableCell>
              <TableCell>{produto.tamanho || "-"}</TableCell>
              <TableCell className="text-white font-medium">
                R${" "}
                {Number(produto.preco).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={
                      produto.estoque < 5
                        ? "text-red-500 font-bold"
                        : "text-neutral-300"
                    }
                  >
                    {produto.estoque} un
                  </span>
                  {produto.estoque < 5 && (
                    <Badge variant="error" className="animate-pulse text-[10px] py-0 px-2 w-fit">
                      Estoque baixo
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/produtos/${produto.id}/editar`}>
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
                    onClick={() => handleDelete(produto.id, produto.nome)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!loading && produtos.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-10 text-center text-neutral-500"
              >
                Nenhum produto encontrado.
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
