"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Filter,
  RefreshCw,
  TrendingDown,
  Activity,
  Award,
  ShieldAlert
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
import Badge from '@/components/ui/Badge';
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
  const [mounted, setMounted] = useState(false);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [vendedorFilter, setVendedorFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGestor = stats?.perfil === 'GESTOR';

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
    if (mounted) {
      fetchStats();
    }
  }, [mounted, vendedorFilter, dataInicio, dataFim]);

  useEffect(() => {
    if (mounted && isGestor) {
      const fetchVendedores = async () => {
        try {
          const data = await usuarioService.listarVendedores();
          setVendedores(data);
        } catch (error) {
          console.error("Erro ao carregar vendedores:", error);
        }
      };
      fetchVendedores();
    }
  }, [mounted, isGestor]);

  const clearFilters = () => {
    setVendedorFilter("");
    setDataInicio("");
    setDataFim("");
  };

  if (!mounted) return null;

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white">
        <RefreshCw className="animate-spin mb-4 text-red-600" size={48} />
        <p className="text-xl font-semibold">Sincronizando BI KickHub...</p>
      </div>
    );
  }

  // Configuração do Gráfico de Evolução (Dual-Axis)
  const lineData = {
    labels: stats?.vendasMensais.map(v => v.mes) || [],
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: stats?.vendasMensais.map(v => v.faturamento) || [],
        borderColor: '#dc2626', // Vermelho para Faturamento
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        yAxisID: 'yFaturamento',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Quantidade de Vendas',
        data: stats?.vendasMensais.map(v => v.quantidade) || [],
        borderColor: '#22c55e', // Verde para Quantidade
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'yQuantidade',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false, // Legenda removida
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        borderColor: '#2a2a2a',
        borderWidth: 1,
      }
    },
    scales: {
      yFaturamento: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: '#2a2a2a' },
        ticks: { 
          color: '#dc2626',
          callback: (value: any) => `R$ ${value >= 1000 ? (value/1000) + 'k' : value}`
        },
        title: { display: false }
      },
      yQuantidade: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false }, 
        ticks: { color: '#22c55e' },
        title: { display: false }
      },
      x: { grid: { display: false }, ticks: { color: '#737373' } }
    }
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

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        borderColor: '#2a2a2a',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: '#2a2a2a', drawBorder: false },
        ticks: { 
          color: '#737373',
          callback: (value: any) => `R$ ${value >= 1000 ? (value/1000) + 'k' : value}`
        }
      },
      y: { grid: { display: false }, ticks: { color: '#a3a3a3' } }
    },
    indexAxis: 'y' as const,
  };

  const riskColorMap: Record<string, string> = {
    'Baixo': '#cbd5e1',
    'Médio': '#94a3b8',
    'Alto': '#f87171',
    'Crítico': '#dc2626'
  };

  const riskPieData = {
    labels: stats?.biEstrategico?.distribuicaoRisco?.map(r => r.label) || [],
    datasets: [
      {
        data: stats?.biEstrategico?.distribuicaoRisco?.map(r => r.valor) || [],
        backgroundColor: stats?.biEstrategico?.distribuicaoRisco?.map(r => riskColorMap[r.label] || '#737373') || [], 
        borderWidth: 0,
      },
    ],
  };

  const getRiskBadgeVariant = (risk: string) => {
    if (!risk) return 'default';
    const r = risk.toLowerCase();
    if (r === 'crítico') return 'error';
    if (r === 'alto' || r === 'médio') return 'warning';
    if (r === 'baixo') return 'success';
    return 'default';
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic">
            Dashboard {isGestor ? <span className="text-red-600">Estratégico</span> : <span className="text-red-600">Individual</span>}
          </h1>
          <p className="text-neutral-500">
            {isGestor 
              ? 'Inteligência de negócios, clientes e performance comercial.' 
              : 'Seus indicadores de vendas e performance.'}
          </p>
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
            {isGestor && (
              <label className="flex flex-col gap-1.5 text-sm text-neutral-400">
                Vendedor
                <select
                  className="h-10 rounded-lg border border-neutral-800 bg-[#1a1a1a] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                  value={vendedorFilter}
                  onChange={(e) => setVendedorFilter(e.target.value)}
                >
                  <option value="">Todos os Vendedores</option>
                  {vendedores.map((v) => (
                    <option key={v.id.toString()} value={v.id.toString()}>{v.nome}</option>
                  ))}
                </select>
              </label>
            )}

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
              Limpar Filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Grid de Cards de Resumo */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isGestor ? (
          <>
            <SummaryCard 
              title="Faturamento" 
              value={`R$ ${stats?.resumo.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
              icon={<DollarSign className="text-red-500" />} 
            />
            <SummaryCard 
              title="Ticket Médio" 
              value={`R$ ${stats?.resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
              icon={<RefreshCw className="text-purple-500" />} 
            />
            <SummaryCard 
              title="Total Clientes" 
              value={stats?.biEstrategico?.totalClientes?.toString() || "0"} 
              icon={<Users className="text-blue-500" />} 
            />
            <SummaryCard 
              title="Total Vendas" 
              value={stats?.biEstrategico?.totalVendasHistorico?.toString() || "0"} 
              icon={<ShoppingCart className="text-green-500" />} 
            />
            <SummaryCard 
              title="Taxa de Churn" 
              value={`${stats?.biEstrategico?.taxaChurn || '0'}%`} 
              icon={<TrendingDown className="text-orange-500" />} 
            />
            <SummaryCard 
              title="CLV Médio" 
              value={`R$ ${stats?.biEstrategico?.clvMedio || '0'}`} 
              icon={<Activity className="text-cyan-500" />} 
            />
          </>
        ) : (
          <>
            <SummaryCard 
              title="Minhas Vendas" 
              value={stats?.resumo.totalVendas.toString() || "0"} 
              icon={<ShoppingCart className="text-green-500" />} 
            />
            <SummaryCard 
              title="Meu Faturamento" 
              value={`R$ ${stats?.resumo.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
              icon={<DollarSign className="text-red-500" />} 
            />
            <SummaryCard 
              title="Meu Ticket Médio" 
              value={`R$ ${stats?.resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
              icon={<Activity className="text-blue-500" />} 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de Evolução (Dual Axis) */}
        <Card 
          title={isGestor ? "Evolução Faturamento & Vendas" : "Minha Evolução Faturamento & Vendas"} 
          className={isGestor ? "lg:col-span-3" : "lg:col-span-2"}
        >
          <div className="h-80">
            <Line data={lineData} options={lineOptions} />
          </div>
        </Card>
        
        {/* Lado Direito Dinâmico (Vendedor) */}
        {!isGestor && (
          <Card title="Faturamento por Categoria">
            <div className="h-80">
              <Bar data={categoryBarData} options={categoryChartOptions} />
            </div>
          </Card>
        )}
      </div>

      {/* NOVO GRID GESTOR: Categoria e Risco Lado a Lado */}
      {isGestor && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="Faturamento por Categoria" className="lg:col-span-2">
            <div className="h-80">
              <Bar data={categoryBarData} options={categoryChartOptions} />
            </div>
          </Card>
          <Card title="Distribuição de Risco">
            <div className="h-80 flex items-center justify-center">
              <Pie 
                data={riskPieData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#a3a3a3' } } } 
                }} 
              />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tabela de Top Clientes */}
        <Card title="Melhores Clientes (RFM Score)" className="lg:col-span-2">
          <Table headers={['Cliente', 'RFM Score', 'Risco Churn', 'Total Gasto']}>
            {stats?.topClientes.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-2">
                    <Award size={16} className={index === 0 ? "text-yellow-500" : "text-neutral-500"} />
                    {item.nome}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600" 
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-300">{item.score}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(item.risco)}>{item.risco || 'Sem análise'}</Badge>
                </TableCell>
                <TableCell className="text-white font-semibold">
                  R$ {item.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
        
        {/* Alerta de Churn */}
        <Card title="Alerta: Churn Iminente" className="border-red-600/30">
          <div className="space-y-4">
            {stats?.biEstrategico?.topChurn?.map((client, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] border border-neutral-800">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={18} className="text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{client.nome}</p>
                    <p className="text-[10px] text-neutral-500 uppercase">{client.risco}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">{client.probabilidade}</p>
                  <p className="text-[10px] text-neutral-500">PROB.</p>
                </div>
              </div>
            ))}
            {(!stats?.biEstrategico?.topChurn || stats.biEstrategico.topChurn.length === 0) && (
              <p className="text-xs text-neutral-500 text-center py-4">Nenhum cliente em risco iminente.</p>
            )}
            <Link 
              href="/dashboard/churn-report"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f0f] border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white h-8 px-3 text-xs w-full mt-2"
            >
              Relatório Completo
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg bg-[#0f0f0f] p-2">{icon}</div>
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}

function QuickActionButton({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) {
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
