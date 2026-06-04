"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  DollarSign,
  Plus,
  Filter,
  RefreshCw
} from 'lucide-react';
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
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import { usuarioService, Vendedor } from '@/services/usuarioService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [vendedorFilter, setVendedorFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats({
        usuarioId: vendedorFilter || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined
      });
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [vendedorFilter, dataInicio, dataFim]);

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const data = await usuarioService.listarVendedores();
        setVendedores(data);
      } catch (error) {
        console.error("Erro ao carregar vendedores:", error);
      }
    };
    fetchVendedores();
  }, []);

  const clearFilters = () => {
    setVendedorFilter("");
    setDataInicio("");
    setDataFim("");
  };

  if (!stats && loading) {
    return <div className="flex items-center justify-center h-screen text-white">Carregando Dashboard...</div>;
  }

  const lineData = {
    labels: stats?.vendasMensais.map(v => v.mes) || [],
    datasets: [
      {
        fill: true,
        label: 'Faturamento (R$)',
        data: stats?.vendasMensais.map(v => v.total) || [],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#dc2626',
        pointBorderColor: '#0f0f0f',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const categoryBarData = {
    labels: stats?.vendasCategoria.map(v => v.categoria) || [],
    datasets: [
      {
        label: 'Faturamento por Categoria (R$)',
        data: stats?.vendasCategoria.map(v => v.faturamento) || [],
        backgroundColor: '#dc2626',
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#a3a3a3',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
    },
    scales: {
      y: {
        grid: { color: '#2a2a2a', drawBorder: false },
        ticks: { 
          color: '#737373',
          callback: (value: any) => `R$ ${value >= 1000 ? (value/1000) + 'k' : value}`
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#737373' }
      }
    }
  };

  const categoryChartOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        grid: { color: '#2a2a2a', drawBorder: false },
        ticks: { 
          color: '#737373',
          callback: (value: any) => `R$ ${value >= 1000 ? (value/1000) + 'k' : value}`
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#a3a3a3' }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Analítico</h1>
          <p className="text-neutral-500">Dados consolidados do BI (atualizados a cada 5 min).</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            leftIcon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-red-600/20 bg-red-600/5">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
              Vendedor
              <select
                className="h-10 rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={vendedorFilter}
                onChange={(e) => setVendedorFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {vendedores.map((v) => (
                  <option key={v.id.toString()} value={v.id.toString()}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
              Data inicial
              <input
                type="date"
                className="h-10 rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
              Data final
              <input
                type="date"
                className="h-10 rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </label>

            <Button type="button" variant="ghost" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          title="Vendas (Concluídas)" 
          value={stats?.resumo.totalVendas.toString() || "0"} 
          icon={<ShoppingCart className="text-red-500" />} 
          subtitle="No período selecionado"
        />
        <SummaryCard 
          title="Faturamento" 
          value={`R$ ${stats?.resumo.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || "0"}`} 
          icon={<DollarSign className="text-green-500" />} 
          subtitle="Soma das vendas concluídas"
        />
        <SummaryCard 
          title="Clientes Ativos" 
          value={stats?.resumo.totalClientes.toString() || "0"} 
          icon={<Users className="text-blue-500" />} 
          subtitle="Base total no período"
        />
        <SummaryCard 
          title="Ticket Médio" 
          value={`R$ ${stats?.resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0"}`} 
          icon={<RefreshCw className="text-purple-500" />} 
          subtitle="Eficiência por venda"
          trendColor="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Evolução de Faturamento" className="lg:col-span-2">
          <div className="h-80">
            <Line data={lineData} options={chartOptions} />
          </div>
        </Card>
        <Card title="Faturamento por Categoria">
          <div className="h-80">
            <Bar data={categoryBarData} options={categoryChartOptions} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Ranking: Top 5 Clientes" className="lg:col-span-2">
          <Table headers={['Cliente', 'Qtd. Vendas', 'Total Investido']}>
            {stats?.topClientes.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-white">{item.nome}</TableCell>
                <TableCell>{item.vendas}</TableCell>
                <TableCell className="text-red-500 font-bold">
                  R$ {item.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            {(!stats || stats.topClientes.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-neutral-500">
                  Sem dados para o filtro selecionado.
                </TableCell>
              </TableRow>
            )}
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
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  trendColor?: string;
};

function SummaryCard({ title, value, icon, subtitle, trendColor = "text-neutral-500" }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-lg bg-[#0f0f0f] p-2">
          {icon}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${trendColor}`}>{subtitle}</span>
      </div>
      <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

type QuickActionButtonProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

function QuickActionButton({ title, description, href, icon }: QuickActionButtonProps) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-[#0f0f0f] p-4 transition-all hover:border-red-600/50 hover:bg-[#1a1a1a]"
    >
      <div className="text-red-500">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}
