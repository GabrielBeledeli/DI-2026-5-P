import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaBiService } from '../prisma/prisma-bi.service';

export class DashboardParams {
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @IsString()
  dataFim?: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prismaBi: PrismaBiService) {}

  async getStats(params: DashboardParams) {
    const { usuarioId, dataInicio, dataFim } = params;

    // Filtros baseados nas tabelas bi_*
    const filters: string[] = ["status = 'CONCLUIDA'"];
    const queryParams: any[] = [];

    // Validacao extra para BigInt e strings vazias
    if (usuarioId && usuarioId.trim() !== "") {
      try {
        queryParams.push(BigInt(usuarioId));
        filters.push(`usuarioId = $${queryParams.length}`);
      } catch (e) {
        console.error("Erro ao converter usuarioId para BigInt:", e);
      }
    }

    if (dataInicio) {
      queryParams.push(new Date(`${dataInicio}T00:00:00.000`));
      filters.push(`dataVenda >= $${queryParams.length}`);
    }

    if (dataFim) {
      queryParams.push(new Date(`${dataFim}T23:59:59.999`));
      filters.push(`dataVenda <= $${queryParams.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Filtro especial apenas de data para Clientes e Ticket Médio (conforme solicitado)
    const dateFilters: string[] = ["status = 'CONCLUIDA'"];
    const dateQueryParams: any[] = [];
    if (dataInicio) {
      dateQueryParams.push(new Date(`${dataInicio}T00:00:00.000`));
      dateFilters.push(`dataVenda >= $${dateQueryParams.length}`);
    }
    if (dataFim) {
      dateQueryParams.push(new Date(`${dataFim}T23:59:59.999`));
      dateFilters.push(`dataVenda <= $${dateQueryParams.length}`);
    }
    const dateWhereClause = dateFilters.length > 0 ? `WHERE ${dateFilters.join(' AND ')}` : '';

    // 1. Cards de Resumo
    const resumo: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        COUNT(id)::text as total_vendas,
        COALESCE(SUM(total), 0) as faturamento_total
      FROM bi_vendas
      ${whereClause}
    `, ...queryParams);

    const totalClientes: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT clienteId)::text as total_clientes
      FROM bi_vendas
      ${dateWhereClause}
    `, ...dateQueryParams);

    const faturamentoTotalNum = parseFloat(resumo[0]?.faturamento_total || '0');
    const totalVendasNum = parseInt(resumo[0]?.total_vendas || '0');
    const ticketMedio = totalVendasNum > 0 ? faturamentoTotalNum / totalVendasNum : 0;

    const estoqueBaixo: any[] = await this.prismaBi.$queryRaw`
      SELECT COUNT(id)::text as total
      FROM bi_produtos
      WHERE estoque < 5
    `;

    // 2. Vendas Mensais (Gráfico de Barras)
    const vendasMensais: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        TO_CHAR(dataVenda, 'Mon') as mes,
        EXTRACT(MONTH FROM dataVenda) as mes_num,
        SUM(total) as total
      FROM bi_vendas
      ${whereClause}
      GROUP BY mes, mes_num
      ORDER BY mes_num
    `, ...queryParams);

    // 3. Vendas por Categoria (Gráfico de Pizza)
    const vendasCategoria: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        c.nome as categoria,
        SUM(vi.subtotal) as faturamento
      FROM bi_venda_itens vi
      JOIN bi_produtos p ON vi.produtoId = p.id
      JOIN bi_categorias c ON p.categoriaId = c.id
      JOIN bi_vendas v ON vi.vendaId = v.id
      ${whereClause.replace(/WHERE/i, 'WHERE v.')}
      GROUP BY c.nome
      ORDER BY faturamento DESC
    `, ...queryParams);

    // 4. Top 5 Clientes
    const topClientes: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        c.nome,
        COUNT(v.id)::text as vendas,
        SUM(v.total) as total_gasto
      FROM bi_vendas v
      JOIN bi_clientes c ON v.clienteId = c.id
      ${whereClause.replace(/WHERE/i, 'WHERE v.')}
      GROUP BY c.id, c.nome
      ORDER BY total_gasto DESC
      LIMIT 5
    `, ...queryParams);

    return {
      resumo: {
        totalVendas: totalVendasNum,
        faturamentoTotal: faturamentoTotalNum,
        totalClientes: parseInt(totalClientes[0]?.total_clientes || '0'),
        ticketMedio: parseFloat(ticketMedio.toFixed(2)),
        estoqueBaixo: parseInt(estoqueBaixo[0]?.total || '0'),
      },
      vendasMensais: vendasMensais.map(v => ({
        mes: v.mes,
        total: parseFloat(v.total || '0')
      })),
      vendasCategoria: vendasCategoria.map(v => ({
        categoria: v.categoria,
        faturamento: parseFloat(v.faturamento || '0')
      })),
      topClientes: topClientes.map(c => ({
        nome: c.nome,
        vendas: parseInt(c.vendas || '0'),
        totalGasto: parseFloat(c.total_gasto || '0')
      }))
    };
  }
}
