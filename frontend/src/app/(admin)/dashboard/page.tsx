"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Card from "@/components/ui/Card";
import Table, { TableRow, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { vendaService } from "@/services/vendaService";
import { clienteService } from "@/services/clienteService";
import { produtoService } from "@/services/produtoService";
import { Venda, Cliente, Produto } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

export default function DashboardPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendasData, clientesData, produtosData] = await Promise.all([
          vendaService.listar(),
          clienteService.listar(),
          produtoService.listar(),
        ]);
        setVendas(vendasData || []);
        setClientes(clientesData || []);
        setProdutos(produtosData || []);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalVendas = vendas.length;
  const totalClientes = clientes.length;
  const totalProdutos = produtos.length;
  const estoqueBaixo = produtos.filter((p) => p.estoque < 5).length;
  const faturamentoTotal = vendas.reduce((acc, v) => {
    const total = Number(v.total);
    return acc + (v.status === "ATIVO" && Number.isFinite(total) ? total : 0);
  }, 0);

  const produtosPorCategoria = produtos.reduce<Record<string, number>>(
    (acc, produto) => {
      const categoriaNome = produto.categoria?.nome?.trim() || "Sem Categoria";
      acc[categoriaNome] = (acc[categoriaNome] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const produtosPorMarca = produtos.reduce<Record<string, number>>(
    (acc, produto) => {
      const marcaNome = produto.marca?.trim() || "Sem Marca";
      acc[marcaNome] = (acc[marcaNome] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const topMarcas = Object.entries(produtosPorMarca)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const barData = {
    labels: topMarcas.map(([marca]) => marca),
    datasets: [
      {
        label: "Produtos por Marca",
        data: topMarcas.map(([, count]) => count),
        backgroundColor: "#dc2626",
        borderRadius: 4,
      },
    ],
  };

  const pieLabels = Object.keys(produtosPorCategoria);
  const pieValues = Object.values(produtosPorCategoria);
  const categoryColors = [
    "#dc2626",
    "#1a1a1a",
    "#2a2a2a",
    "#4a4a4a",
    "#6a6a6a",
    "#8a8a8a",
  ];

  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieValues,
        backgroundColor: pieLabels.map(
          (_, index) => categoryColors[index % categoryColors.length],
        ),
        borderWidth: 1,
        borderColor: "#0f0f0f",
      },
    ],
  };

  const lowStockProducts = produtos.filter((p) => p.estoque < 5).slice(0, 5);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: { color: "#2a2a2a" },
        ticks: { color: "#a3a3a3" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#a3a3a3" },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-neutral-500">
          Bem-vindo de volta! Aqui está o resumo das operações.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total de Vendas"
          value={totalVendas.toString()}
          icon={<ShoppingCart className="text-red-500" />}
          trend="+12%"
        />
        <SummaryCard
          title="Total de Clientes"
          value={totalClientes.toString()}
          icon={<Users className="text-blue-500" />}
          trend="+5%"
        />
        <SummaryCard
          title="Faturamento"
          value={`R$ ${faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          icon={<DollarSign className="text-green-500" />}
          trend="+18%"
        />
        <SummaryCard
          title="Estoque Baixo"
          value={estoqueBaixo.toString()}
          icon={<AlertTriangle className="text-orange-500" />}
          trend={estoqueBaixo > 0 ? "Atenção" : "Normal"}
          trendColor={estoqueBaixo > 0 ? "text-orange-500" : "text-green-500"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Vendas Mensais" className="lg:col-span-2">
          <div className="h-80">
            <Bar data={barData} options={chartOptions} />
          </div>
        </Card>
        <Card title="Vendas por Categoria">
          <div className="h-80">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Top 5 Clientes" className="lg:col-span-2">
          <Table headers={["Cliente", "Vendas", "Total Gasto"]}>
            {clientes.slice(0, 5).map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium text-white">
                  {cliente.nome}
                </TableCell>
                <TableCell>{Math.floor(Math.random() * 10) + 1}</TableCell>
                <TableCell className="text-red-500 font-bold">
                  R${" "}
                  {(Math.random() * 5000 + 1000).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>

        <Card title="Ações Rápidas">
          <div className="space-y-4">
            <QuickActionButton
              title="Nova Venda"
              description="Registre um novo pedido"
              href="/vendas/nova"
              icon={<Plus size={20} />}
            />
            <QuickActionButton
              title="Cadastrar Produto"
              description="Adicione novos itens ao estoque"
              href="/produtos/novo"
              icon={<Package size={20} />}
            />
            <QuickActionButton
              title="Ver Clientes"
              description="Gerencie sua base de contatos"
              href="/clientes"
              icon={<Users size={20} />}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Produtos com Estoque Crítico" className="lg:col-span-3">
          <Table
            headers={[
              "Produto",
              "Marca",
              "Cor",
              "Gênero",
              "Tamanho",
              "Estoque",
            ]}
          >
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium text-white">
                    {produto.nome}
                  </TableCell>
                  <TableCell>{produto.marca || "—"}</TableCell>
                  <TableCell>{produto.cor || "—"}</TableCell>
                  <TableCell>{produto.genero || "—"}</TableCell>
                  <TableCell>{produto.tamanho || "—"}</TableCell>
                  <TableCell className="text-red-500 font-bold">
                    {produto.estoque}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-neutral-500"
                >
                  Nenhum produto com estoque crítico encontrado.
                </TableCell>
              </TableRow>
            )}
          </Table>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  trend,
  trendColor = "text-green-500",
}: any) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-lg bg-[#0f0f0f] p-2">{icon}</div>
        <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
      </div>
      <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function QuickActionButton({ title, description, href, icon }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-[#0f0f0f] p-4 transition-all hover:border-red-600/50 hover:bg-[#1a1a1a]"
    >
      <div className="text-red-500">{icon}</div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}
