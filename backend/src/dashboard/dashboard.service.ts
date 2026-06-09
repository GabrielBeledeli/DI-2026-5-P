import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaBiService } from '../prisma/prisma-bi.service';

export class DashboardStatsParams {
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

export class CustomerAnalysisParams {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  risco?: string;

  @IsOptional()
  @IsString()
  classificacao?: string;

  @IsOptional()
  @IsString()
  isOutlier?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prismaBi: PrismaBiService) {}

  async getStats(params: DashboardStatsParams, user: any) {
    const userProfile = user.perfil;
    const userId = user.userId;
    const isGestor = userProfile === 'GESTOR';
    
    let { usuarioId, dataInicio, dataFim } = params;

    if (!isGestor) {
      usuarioId = userId.toString();
    }

    const filters: string[] = ["v.status = 'CONCLUIDA'"];
    const queryParams: any[] = [];

    if (usuarioId && usuarioId.trim() !== "") {
      queryParams.push(BigInt(usuarioId));
      filters.push(`v.usuarioId = $${queryParams.length}`);
    }

    if (dataInicio) {
      queryParams.push(new Date(`${dataInicio}T00:00:00.000`));
      filters.push(`v.dataVenda >= $${queryParams.length}`);
    }

    if (dataFim) {
      queryParams.push(new Date(`${dataFim}T23:59:59.999`));
      filters.push(`v.dataVenda <= $${queryParams.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // 1. Métricas de Performance
    const resumo: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        COUNT(v.id)::text as total_vendas,
        COALESCE(SUM(v.total), 0) as faturamento_total
      FROM bi_vendas v
      ${whereClause}
    `, ...queryParams);

    const totalVendasNum = parseInt(resumo[0]?.total_vendas || '0');
    const faturamentoTotalNum = parseFloat(resumo[0]?.faturamento_total || '0');
    const ticketMedio = totalVendasNum > 0 ? faturamentoTotalNum / totalVendasNum : 0;

    const vendasMensais: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        TO_CHAR(v.dataVenda, 'Mon') as mes,
        EXTRACT(MONTH FROM v.dataVenda) as mes_num,
        SUM(v.total) as faturamento,
        COUNT(v.id)::text as quantidade
      FROM bi_vendas v
      ${whereClause}
      GROUP BY mes, mes_num
      ORDER BY mes_num
    `, ...queryParams);

    const vendasCategoria: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        c.nome as categoria,
        SUM(vi.subtotal) as faturamento
      FROM bi_venda_itens vi
      JOIN bi_produtos p ON vi.produtoId = p.id
      JOIN bi_categorias c ON p.categoriaId = c.id
      JOIN bi_vendas v ON vi.vendaId = v.id
      ${whereClause}
      GROUP BY c.nome
      ORDER BY faturamento DESC
    `, ...queryParams);

    const topClientes: any[] = await this.prismaBi.$queryRaw`
      SELECT 
        c.nome,
        s.score_compra_rfm as score,
        s.risco_churn as risco,
        s.frequencia_total as vendas,
        s.valor_total as total_gasto
      FROM ml_cliente_scores s
      JOIN bi_clientes c ON s.cliente_id = c.id
      ORDER BY s.score_compra_rfm DESC
      LIMIT 5
    `;

    const topChurn: any[] = await this.prismaBi.$queryRaw`
      SELECT 
        c.nome,
        s.probabilidade_churn,
        s.risco_churn
      FROM ml_cliente_scores s
      JOIN bi_clientes c ON s.cliente_id = c.id
      WHERE s.risco_churn IN ('Crítico', 'Alto')
      ORDER BY s.probabilidade_churn DESC
      LIMIT 5
    `;

    let biEstrategico: any = {
      topChurn: topChurn.map(c => ({
        nome: c.nome,
        risco: c.risco,
        probabilidade: (parseFloat(c.probabilidade_churn) * 100).toFixed(0) + '%'
      }))
    };

    if (isGestor) {
      const totalClientesBase: any[] = await this.prismaBi.$queryRaw`SELECT COUNT(*)::text as total FROM bi_clientes`;
      const totalVendasBase: any[] = await this.prismaBi.$queryRaw`SELECT COUNT(*)::text as total FROM bi_vendas WHERE status = 'CONCLUIDA'`;
      const distribuicaoRisco: any[] = await this.prismaBi.$queryRaw`
        SELECT risco_churn, COUNT(*)::text as total
        FROM ml_cliente_scores
        GROUP BY risco_churn
      `;
      const statsChurn: any[] = await this.prismaBi.$queryRaw`
        SELECT 
          (COUNT(*) FILTER (WHERE risco_churn IN ('Crítico', 'Alto')) * 100.0 / NULLIF(COUNT(*), 0)) as taxa_churn,
          AVG(valor_total) as clv_medio
        FROM ml_cliente_scores
      `;

      biEstrategico = {
        ...biEstrategico,
        totalClientes: parseInt(totalClientesBase[0]?.total || '0'),
        totalVendasHistorico: parseInt(totalVendasBase[0]?.total || '0'),
        taxaChurn: parseFloat(statsChurn[0]?.taxa_churn || '0').toFixed(1),
        clvMedio: parseFloat(statsChurn[0]?.clv_medio || '0').toFixed(2),
        distribuicaoRisco: distribuicaoRisco.map(r => ({
          label: r.risco_churn,
          valor: parseInt(r.total)
        }))
      };

      // 4. Última Carga BI
      const lastLoad: any[] = await this.prismaBi.$queryRaw`SELECT TO_CHAR(MAX(dtregistrocarga), 'YYYY-MM-DD HH24:MI:SS') as ultima_carga FROM bi_categorias`;
      if (lastLoad[0]?.ultima_carga) {
        biEstrategico.ultimaCarga = lastLoad[0].ultima_carga;
      }
    } else {
      // Se não for gestor, ainda precisamos buscar a última carga para o dashboard do vendedor
      const lastLoad: any[] = await this.prismaBi.$queryRaw`SELECT TO_CHAR(MAX(dtregistrocarga), 'YYYY-MM-DD HH24:MI:SS') as ultima_carga FROM bi_categorias`;
      if (lastLoad[0]?.ultima_carga) {
        biEstrategico.ultimaCarga = lastLoad[0].ultima_carga;
      }
    }

    return {
      perfil: userProfile,
      resumo: {
        totalVendas: totalVendasNum,
        faturamentoTotal: faturamentoTotalNum,
        ticketMedio: parseFloat(ticketMedio.toFixed(2)),
      },
      vendasMensais: vendasMensais.map(v => ({
        mes: v.mes,
        faturamento: parseFloat(v.faturamento || '0'),
        quantidade: parseInt(v.quantidade || '0')
      })),
      vendasCategoria: (vendasCategoria || []).map(v => ({
        categoria: v.categoria,
        faturamento: parseFloat(v.faturamento || '0')
      })),
      topClientes: topClientes.map(c => ({
        nome: c.nome,
        vendas: parseInt(c.vendas || '0'),
        totalGasto: parseFloat(c.total_gasto || '0'),
        score: parseFloat(c.score || '0'),
        risco: c.risco
      })),
      biEstrategico
    };
  }

  // --- Módulo de Análise de Clientes (Mega Analítico) ---
  async getCustomerAnalysis(params: CustomerAnalysisParams) {
    const { search, cidade, pais, risco, classificacao, isOutlier } = params;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '50');
    const offset = (page - 1) * limit;
    
    const queryParams: any[] = [];
    const filters: string[] = [];

    if (search) {
      queryParams.push(`%${search}%`);
      filters.push(`(c.nome ILIKE $${queryParams.length} OR c.email ILIKE $${queryParams.length})`);
    }

    if (cidade) {
      queryParams.push(cidade);
      filters.push(`c.cidade = $${queryParams.length}`);
    }

    if (pais) {
      queryParams.push(pais);
      filters.push(`c.pais = $${queryParams.length}`);
    }

    if (risco) {
      queryParams.push(risco);
      filters.push(`COALESCE(ml.risco_churn, 'OUTLIER') = $${queryParams.length}`);
    }

    if (classificacao) {
      queryParams.push(classificacao);
      filters.push(`(
        CASE 
          WHEN ml.score_compra_rfm >= 80 THEN 'Diamante'
          WHEN ml.score_compra_rfm >= 60 THEN 'Ouro'
          WHEN ml.score_compra_rfm >= 40 THEN 'Prata'
          WHEN ml.score_compra_rfm > 0 THEN 'Bronze'
          ELSE 'Sem Classificação'
        END
      ) = $${queryParams.length}`);
    }

    if (isOutlier !== undefined && isOutlier !== "") {
      const outlierVal = isOutlier === 'true';
      filters.push(outlierVal ? `ml.cliente_id IS NULL` : `ml.cliente_id IS NOT NULL`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const totalResult: any[] = await this.prismaBi.$queryRawUnsafe(`
      SELECT COUNT(*)::text as total
      FROM bi_clientes c
      LEFT JOIN ml_cliente_scores ml ON c.id = ml.cliente_id
      ${whereClause}
    `, ...queryParams);

    const total = parseInt(totalResult[0]?.total || '0');

    const data = await this.prismaBi.$queryRawUnsafe(`
      SELECT 
        c.id, c.nome, c.email, c.cidade, c.estado, c.pais,
        COALESCE(ml.recencia_dias::text, 'OUTLIER') as recencia_dias,
        COALESCE(ml.frequencia_total::text, 'OUTLIER') as frequencia_total,
        COALESCE(ml.valor_total::text, 'OUTLIER') as valor_total,
        COALESCE(ROUND(ml.score_compra_rfm::numeric, 2)::text, 'OUTLIER') as score,
        COALESCE(ml.probabilidade_churn::text, '0') as probabilidade,
        COALESCE(ml.risco_churn, 'OUTLIER') as risco,
        CASE 
          WHEN ml.cliente_id IS NULL THEN 'SIM'
          ELSE 'NÃO'
        END as is_outlier,
        CASE 
          WHEN ml.score_compra_rfm >= 80 THEN 'Diamante'
          WHEN ml.score_compra_rfm >= 60 THEN 'Ouro'
          WHEN ml.score_compra_rfm >= 40 THEN 'Prata'
          WHEN ml.score_compra_rfm > 0 THEN 'Bronze'
          ELSE 'OUTLIER'
        END as classificacao
      FROM bi_clientes c
      LEFT JOIN ml_cliente_scores ml ON c.id = ml.cliente_id
      ${whereClause}
      ORDER BY ml.score_compra_rfm DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `, ...queryParams);

    // Busca a última carga para esta tela também
    const lastLoad: any[] = await this.prismaBi.$queryRaw`SELECT TO_CHAR(MAX(dtregistrocarga), 'YYYY-MM-DD HH24:MI:SS') as ultima_carga FROM bi_categorias`;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        ultimaCarga: lastLoad[0]?.ultima_carga || null
      }
    };
  }

  async getChurnReport() {
    return this.prismaBi.$queryRaw`
      SELECT 
        c.nome, c.email,
        s.recencia_dias, s.frequencia_total, s.valor_total,
        s.probabilidade_churn, s.risco_churn
      FROM ml_cliente_scores s
      JOIN bi_clientes c ON s.cliente_id = c.id
      ORDER BY s.probabilidade_churn DESC
    `;
  }

  async getScoreReport() {
    return this.prismaBi.$queryRaw`
      SELECT 
        c.nome, c.email,
        s.score_compra_rfm as score_compra_rfm, 
        s.frequencia_total, s.valor_total,
        s.tempo_relacionamento_dias
      FROM ml_cliente_scores s
      JOIN bi_clientes c ON s.cliente_id = c.id
      ORDER BY s.score_compra_rfm DESC
    `;
  }
}
