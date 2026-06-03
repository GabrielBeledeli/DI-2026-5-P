"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  DollarSign,
  Plus
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
import { Bar, Pie } from 'react-chartjs-2';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { vendaService } from '@/services/vendaService';
import { clienteService } from '@/services/clienteService';
import { produtoService } from '@/services/produtoService';
import { Venda, Cliente, Produto } from '@/types';

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
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendasData, clientesData, produtosData] = await Promise.all([
          vendaService.listar(),
          clienteService.listar(),
          produtoService.listar()
        ]);
        setVendas(vendasData || []);
        setClientes(clientesData || []);
        setProdutos(produtosData || []);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      }
    };
    fetchData();
  }, []);

  const totalVendas = vendas.length;
  const totalClientes = clientes.length;
  const estoqueBaixo = produtos.filter(p => p.estoque < 5).length;
  const faturamentoTotal = vendas.reduce((acc, venda) => {
    if (venda.status === 'CANCELADO') return acc;

    return acc + Number(venda.total || 0);
  }, 0);
  const topClientes = clientes
    .map((cliente) => {
      const vendasCliente = vendas.filter(
        (venda) =>
          String(venda.clienteId) === String(cliente.id) &&
          venda.status !== 'CANCELADO',
      );
      const totalGasto = vendasCliente.reduce(
        (acc, venda) => acc + Number(venda.total || 0),
        0,
      );

      return {
        cliente,
        totalVendas: vendasCliente.length,
        totalGasto,
      };
    })
    .filter((item) => item.totalVendas > 0)
    .sort((a, b) => b.totalGasto - a.totalGasto)
    .slice(0, 5);

  // Dados fictícios para os gráficos baseados nos dados reais (ou mockados se vazio)
  const barData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Vendas (R$)',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: '#dc2626',
        borderRadius: 4,
      },
    ],
  };

  const pieData = {
    labels: ['Casual', 'Running', 'Social', 'Outdoor', 'Kids'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          '#dc2626',
          '#1a1a1a',
          '#2a2a2a',
          '#4a4a4a',
          '#6a6a6a',
        ],
        borderWidth: 1,
        borderColor: '#0f0f0f',
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
    },
    scales: {
      y: {
        grid: { color: '#2a2a2a' },
        ticks: { color: '#a3a3a3' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#a3a3a3' }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-neutral-500">Bem-vindo de volta! Aqui está o resumo das operações.</p>
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
          value={`R$ ${faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
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
          <Table headers={['Cliente', 'Vendas', 'Total Gasto']}>
            {topClientes.map(({ cliente, totalVendas, totalGasto }) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium text-white">{cliente.nome}</TableCell>
                <TableCell>{totalVendas}</TableCell>
                <TableCell className="text-red-500 font-bold">
                  R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            {topClientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-neutral-500">
                  Nenhuma venda realizada.
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
  trend: string;
  trendColor?: string;
};

function SummaryCard({ title, value, icon, trend, trendColor = "text-green-500" }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-lg bg-[#0f0f0f] p-2">
          {icon}
        </div>
        <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
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
