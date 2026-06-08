"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Award, 
  MapPin,
  Mail,
  AlertTriangle
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { dashboardService, CustomerAnalysisParams } from '@/services/dashboardService';

export default function CustomerAnalysisPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [search, setSearch] = useState("");
  const [risco, setRisco] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [isOutlier, setIsOutlier] = useState("");

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const params: CustomerAnalysisParams = {
        search: search || undefined,
        risco: risco || undefined,
        classificacao: classificacao || undefined,
        isOutlier: isOutlier || undefined,
        page: page.toString(),
        limit: "50"
      };
      const result = await dashboardService.getCustomerAnalysis(params);
      setData(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error("Erro ao carregar análise de clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500); 
    return () => clearTimeout(timer);
  }, [search, risco, classificacao, isOutlier]);

  const clearFilters = () => {
    setSearch("");
    setRisco("");
    setClassificacao("");
    setIsOutlier("");
  };

  const getClassVariant = (cls: string) => {
    switch (cls) {
      case 'Diamante': return 'success';
      case 'Ouro': return 'warning';
      case 'Prata': return 'secondary';
      case 'Bronze': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskVariant = (r: string) => {
    switch (r.toLowerCase()) {
      case 'crítico': return 'error'; // Vermelho vibrante
      case 'alto': return 'warning';
      case 'médio': return 'warning';
      case 'baixo': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic">
            Análise <span className="text-red-600">Clientes</span>
          </h1>
          <p className="text-neutral-500">Exploração analítica profunda da base de consumidores.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw size={16} />} onClick={() => fetchData(meta.page)}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Botão Filtro */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-800 bg-[#1a1a1a] text-sm text-white focus:border-red-600 focus:outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          className="h-11 px-6 rounded-xl"
          leftIcon={<Filter size={18} />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros
        </Button>
      </div>

      {/* Painel de Filtros Avançados */}
      {showFilters && (
        <Card className="border-red-600/20 bg-red-600/5 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Risco de Churn</label>
              <select 
                className="w-full h-10 rounded-lg border border-neutral-800 bg-[#0f0f0f] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={risco}
                onChange={(e) => setRisco(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Crítico">Crítico</option>
                <option value="Alto">Alto</option>
                <option value="Médio">Médio</option>
                <option value="Baixo">Baixo</option>
                <option value="OUTLIER">Outlier</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Classificação RFM</label>
              <select 
                className="w-full h-10 rounded-lg border border-neutral-800 bg-[#0f0f0f] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={classificacao}
                onChange={(e) => setClassificacao(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Diamante">💎 Diamante</option>
                <option value="Ouro">🥇 Ouro</option>
                <option value="Prata">🥈 Prata</option>
                <option value="Bronze">🥉 Bronze</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">É Outlier?</label>
              <select 
                className="w-full h-10 rounded-lg border border-neutral-800 bg-[#0f0f0f] px-3 text-sm text-white focus:border-red-600 focus:outline-none"
                value={isOutlier}
                onChange={(e) => setIsOutlier(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <Button variant="ghost" size="sm" className="h-10 px-4" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Tabela Mega Analítica */}
      <Card className="overflow-hidden border-neutral-800 bg-[#1a1a1a]/50">
        <div className="overflow-x-auto">
          <Table headers={[
            'Cliente', 
            'Localização', 
            'Métricas (R/F/V)', 
            'Score RFM', 
            'Classificação', 
            'Risco Churn'
          ]}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-red-600" size={32} />
                    <span className="text-neutral-500 font-medium">Processando análise completa...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.map((client) => (
              <TableRow key={client.id} className={client.is_outlier === 'SIM' ? 'opacity-60 bg-neutral-900/20' : ''}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{client.nome}</span>
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Mail size={10} /> {client.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-300 flex items-center gap-1">
                      <MapPin size={10} className="text-red-500" /> {client.cidade} - {client.estado}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase">{client.pais}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-mono ${client.is_outlier === 'SIM' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      REC: {client.recencia_dias} d
                    </span>
                    <span className={`text-[10px] font-mono ${client.is_outlier === 'SIM' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      FREQ: {client.frequencia_total}
                    </span>
                    <span className={`text-[10px] font-mono ${client.is_outlier === 'SIM' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      VALOR: {client.is_outlier === 'SIM' ? 'OUTLIER' : `R$ ${parseFloat(client.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {client.is_outlier === 'SIM' ? (
                    <span className="text-[10px] font-bold text-neutral-600">OUTLIER</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${client.score}%` }} />
                      </div>
                      <span className="text-xs font-black text-white">{client.score}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getClassVariant(client.classificacao)} className="font-black italic">
                    {client.classificacao === 'Diamante' ? '💎 ' : client.classificacao === 'Ouro' ? '🥇 ' : client.classificacao === 'Prata' ? '🥈 ' : client.classificacao === 'Bronze' ? '🥉 ' : ''}{client.classificacao}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskVariant(client.risco)} outline>
                      {client.risco}
                    </Badge>
                    {client.risco !== 'OUTLIER' && (
                      <span className="text-[10px] font-bold text-neutral-500">
                        ({(parseFloat(client.probabilidade) * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center text-neutral-500">
                  Nenhum cliente encontrado nos filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </Table>
        </div>
      </Card>

      {/* Paginação */}
      {!loading && data.length > 0 && (
        <div className="mt-6">
          <Pagination
            meta={meta}
            onPageChange={(page) => fetchData(page)}
          />
        </div>
      )}
    </div>
  );
}
