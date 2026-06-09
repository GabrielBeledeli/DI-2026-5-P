"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { produtoService } from "@/services/produtoService";
import { categoriaService } from "@/services/categoriaService";
import ProdutoForm, { ProdutoFormData } from "@/components/forms/ProdutoForm";
import { Categoria } from "@/types";
import { showErrorAlert, showSuccessAlert } from "@/lib/alerts";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await categoriaService.listar();
        setCategorias(data);
      } catch (error) {
        showErrorAlert(error, "Não foi possível carregar as categorias.");
      }
    };
    fetchCategorias();
  }, []);

  const handleSubmit = async (data: ProdutoFormData) => {
    try {
      setLoading(true);
      await produtoService.criar(data);
      await showSuccessAlert("Sucesso!", "Produto cadastrado com sucesso.");
      router.push("/produtos");
    } catch (error) {
      showErrorAlert(error, "Não foi possível cadastrar o produto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-bold text-white tracking-tight sm:text-3xl">
          Novo Produto
        </h1>
        <p className="break-words text-sm text-neutral-500 sm:text-base">
          Preencha os dados abaixo para cadastrar um novo sneaker no catálogo.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-4 shadow-sm sm:p-8">
        <ProdutoForm
          categorias={categorias}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
