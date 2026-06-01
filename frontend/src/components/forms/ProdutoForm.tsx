"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Produto, Categoria } from "@/types";

const parsePreco = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;

  const trimmed = value.replace(/R\$\s?/i, "").trim();
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(\.\d{3})+$/.test(trimmed)
      ? trimmed.replace(/\./g, "")
      : trimmed;

  return Number(normalized);
};

const isPrecoFormat = (value: string) => {
  const trimmed = value.replace(/R\$\s?/i, "").trim();

  return (
    /^(\d+|\d{1,3}(\.\d{3})+)(,\d{1,2})?$/.test(trimmed) ||
    /^\d+\.\d{1,2}$/.test(trimmed)
  );
};

const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  marca: z.string().min(1, "Marca é obrigatória"),
  cor: z.string().min(1, "Cor é obrigatória"),
  genero: z.string().min(1, "Gênero é obrigatório"),
  tamanho: z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => value !== "", "Tamanho é obrigatório")
    .refine(
      (value) => /^\d+(\.\d+)?$/.test(value),
      "Informe um tamanho válido, ex: 36 ou 36.5",
    ),
  preco: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine(isPrecoFormat, "Formato inválido. Use 100,50, 100.50 ou 10.500,50")
    .transform(parsePreco)
    .refine((value) => value > 0, "O preço deve ser maior que zero"),
  estoque: z.coerce.number().min(0, "O estoque não pode ser negativo"),
  categoriaId: z
    .union([z.string(), z.number()])
    .refine((value) => value !== "", "A categoria não pode ser vazia")
    .transform(Number)
    .refine(
      (value) => Number.isInteger(value) && value > 0,
      "A categoria não pode ser vazia",
    ),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;
type ProdutoFormValues = z.input<typeof produtoSchema>;

interface ProdutoFormProps {
  initialData?: Produto;
  categorias: Categoria[];
  onSubmit: (data: ProdutoFormData) => void;
  isLoading?: boolean;
}

export default function ProdutoForm({
  initialData,
  categorias,
  onSubmit,
  isLoading,
}: ProdutoFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProdutoFormValues, unknown, ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: initialData
      ? {
          nome: initialData.nome,
          marca: initialData.marca ?? "",
          cor: initialData.cor ?? "",
          genero: initialData.genero ?? "",
          tamanho: initialData.tamanho ?? "",
          preco: initialData.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          estoque: initialData.estoque,
          categoriaId:
            initialData.categoriaId ?? initialData.categoria?.id ?? "",
        }
      : {
          nome: "",
          marca: "",
          cor: "",
          genero: "",
          tamanho: "",
          preco: "",
          estoque: 0,
          categoriaId: "",
        },
  });

  const formatPreco = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    const numericValue = Number(digits) / 100;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const precoRegister = register("preco", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = formatPreco(event.target.value);
      event.target.value = formattedValue;
      setValue("preco", formattedValue, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  });

  const handlePrecoFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      event.target.value = "R$ 0,00";
      setValue("preco", "R$ 0,00", { shouldDirty: true });
    }
  };

  const categoriaOptions = categorias.map((cat) => ({
    value: cat.id,
    label: cat.nome,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Nome do Produto"
          placeholder="Ex: Air Jordan 1"
          error={errors.nome?.message}
          {...register("nome")}
          containerClassName="md:col-span-2"
        />
        <Input
          label="Marca"
          placeholder="Ex: Nike"
          error={errors.marca?.message}
          {...register("marca")}
        />
        <Input
          label="Cor"
          placeholder="Ex: Vermelho"
          error={errors.cor?.message}
          {...register("cor")}
        />
        <Input
          label="Gênero"
          placeholder="Ex: Unissex"
          error={errors.genero?.message}
          {...register("genero")}
        />
        <Input
          label="Tamanho"
          type="number"
          placeholder="Ex: 36"
          error={errors.tamanho?.message}
          {...register("tamanho")}
        />
        <Input
          label="Preço (R$)"
          type="text"
          inputMode="decimal"
          placeholder="R$ 10.500,50"
          error={errors.preco?.message}
          {...precoRegister}
          onFocus={handlePrecoFocus}
        />
        <Input
          label="Estoque"
          type="number"
          placeholder="0"
          error={errors.estoque?.message}
          {...register("estoque")}
        />
        <Select
          label="Categoria"
          options={categoriaOptions}
          error={errors.categoriaId?.message}
          {...register("categoriaId")}
          containerClassName="md:col-span-2"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Atualizar Produto" : "Cadastrar Produto"}
        </Button>
      </div>
    </form>
  );
}
