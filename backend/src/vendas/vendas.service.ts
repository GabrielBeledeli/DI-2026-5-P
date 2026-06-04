import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VendaStatus } from '@prisma/client';
import { PaginationQuery, parsePagination, toPaginatedResponse } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';

type VendasQuery = PaginationQuery & {
  search?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
};

const vendaInclude = {
  cliente: true,
  itens: {
    include: {
      produto: {
        include: { categoria: true },
      },
    },
  },
};

const parseMoney = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return Number.NaN;

  const trimmed = value.replace(/R\$\s?/i, '').trim();
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : /^\d{1,3}(\.\d{3})+$/.test(trimmed)
      ? trimmed.replace(/\./g, '')
      : trimmed;

  return Number(normalized);
};

@Injectable()
export class VendasService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.venda.findMany({
      include: vendaInclude,
      orderBy: { id: 'desc' },
    });
  }

  async listarPaginado(query: VendasQuery) {
    const pagination = parsePagination(query);
    const where = this.buildWhere(query);
    const [vendas, total] = await Promise.all([
      this.prisma.venda.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        include: vendaInclude,
        orderBy: { id: 'desc' },
      }),
      this.prisma.venda.count({ where }),
    ]);

    return toPaginatedResponse(vendas, total, pagination);
  }

  private buildWhere(query: VendasQuery): Prisma.VendaWhereInput {
    const where: Prisma.VendaWhereInput = {};
    const status = query.status?.trim();
    const search = query.search?.trim();
    const dataInicio = query.dataInicio?.trim();
    const dataFim = query.dataFim?.trim();

    if (status && Object.values(VendaStatus).includes(status as VendaStatus)) {
      where.status = status as VendaStatus;
    }

    if (dataInicio || dataFim) {
      where.dataVenda = {};

      if (dataInicio) {
        where.dataVenda.gte = new Date(`${dataInicio}T00:00:00.000`);
      }

      if (dataFim) {
        where.dataVenda.lte = new Date(`${dataFim}T23:59:59.999`);
      }
    }

    if (search) {
      const or: Prisma.VendaWhereInput[] = [
        {
          cliente: {
            nome: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];

      if (/^\d+$/.test(search)) {
        or.push({ id: BigInt(search) });
      }

      where.OR = or;
    }

    return where;
  }

  async buscarPorId(id: number) {
    const venda = await this.prisma.venda.findUnique({
      where: { id: BigInt(id) },
      include: vendaInclude,
    });

    if (!venda) {
      throw new NotFoundException('Venda nao encontrada.');
    }

    return venda;
  }

  async criar(payload: CreateVendaDto) {
    const dados = await this.validarPayload(payload);

    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.create({
        data: {
          clienteId: BigInt(dados.clienteId),
          total: dados.total,
          status: payload.status,
          itens: {
            create: dados.itens.map((item) => ({
              produtoId: BigInt(item.produtoId),
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              subtotal: item.subtotal,
            })),
          },
        },
        include: vendaInclude,
      });

      for (const item of dados.itens) {
        await tx.produto.update({
          where: { id: BigInt(item.produtoId) },
          data: { estoque: { decrement: item.quantidade } },
        });
      }

      return venda;
    });
  }

  async atualizar(id: number, payload: UpdateVendaDto) {
    const vId = BigInt(id);
    
    // 1. Busca a venda original de forma isolada para garantir que existe e estornar estoque
    const vendaOriginal = await this.prisma.venda.findUnique({
      where: { id: vId },
      include: { itens: true }
    });

    if (!vendaOriginal) throw new NotFoundException('Venda nao encontrada.');

    // 2. Trava de seguranca
    if (vendaOriginal.status === VendaStatus.CONCLUIDA || vendaOriginal.status === VendaStatus.CANCELADO) {
      throw new BadRequestException('Esta venda ja esta finalizada ou cancelada e nao permite alteracoes.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 3. ESTORNO DE ESTOQUE (Devolve itens antigos)
      for (const item of vendaOriginal.itens) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { increment: item.quantidade } }
        });
      }

      // 4. VALIDAÇÃO E CÁLCULO (Usando os dados originais como fallback para PATCH parcial)
      const dadosParaValidar = {
        clienteId: payload.clienteId ?? Number(vendaOriginal.clienteId),
        itens: payload.itens ?? vendaOriginal.itens.map(i => ({
          produtoId: Number(i.produtoId),
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario
        })),
        status: payload.status ?? vendaOriginal.status
      };

      const dados = await this.validarPayloadInterno(dadosParaValidar as any, tx);

      // 5. ATUALIZAÇÃO ATÔMICA (DELETA ITENS, CRIA NOVOS E ATUALIZA CABEÇA)
      const vendaAtualizada = await tx.venda.update({
        where: { id: vId },
        data: {
          clienteId: BigInt(dados.clienteId),
          total: dados.total,
          status: dadosParaValidar.status as VendaStatus,
          itens: {
            deleteMany: {}, // Limpa todos os itens vinculados a esta venda
            create: dados.itens.map((item) => ({
              produtoId: BigInt(item.produtoId),
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              subtotal: item.subtotal,
            })),
          },
        },
        include: vendaInclude,
      });

      // 6. DEDUÇÃO DO NOVO ESTOQUE
      for (const item of dados.itens) {
        await tx.produto.update({
          where: { id: BigInt(item.produtoId) },
          data: { estoque: { decrement: item.quantidade } }
        });
      }

      return vendaAtualizada;
    });
  }

  // Refatoracao para aceitar um client do Prisma (transacional ou nao) e lidar com BigInt
  private async validarPayloadInterno(payload: any, prisma: Prisma.TransactionClient | PrismaService) {
    const clienteId = Number(payload.clienteId);
    const itensPayload = payload.itens ?? [];

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      throw new BadRequestException('Cliente invalido.');
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: BigInt(clienteId) } });
    if (!cliente) {
      throw new BadRequestException('Cliente nao encontrado.');
    }

    if (!Array.isArray(itensPayload) || itensPayload.length === 0) {
      throw new BadRequestException('Adicione pelo menos um item a venda.');
    }

    const itens = await Promise.all(
      itensPayload.map(async (item) => {
        const produtoId = Number(item.produtoId);
        const quantidade = Number(item.quantidade);

        if (!Number.isInteger(produtoId) || produtoId <= 0) {
          throw new BadRequestException('Produto invalido.');
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
          throw new BadRequestException('Quantidade invalida.');
        }

        const produto = await prisma.produto.findUnique({ where: { id: BigInt(produtoId) } });
        if (!produto) {
          throw new BadRequestException('Produto nao encontrado.');
        }

        if (produto.estoque < quantidade) {
          throw new BadRequestException(`Estoque insuficiente para ${produto.nome}. Disponivel: ${produto.estoque}`);
        }

        const precoPayload = parseMoney(item.precoUnitario);
        const precoUnitario = Number.isFinite(precoPayload) && precoPayload > 0 ? precoPayload : produto.preco;
        const subtotal = quantidade * precoUnitario;

        return { produtoId, quantidade, precoUnitario, subtotal };
      }),
    );

    const total = itens.reduce((acc, item) => acc + item.subtotal, 0);
    return { clienteId, itens, total };
  }

  private async validarPayload(payload: CreateVendaDto) {
    return this.validarPayloadInterno(payload, this.prisma);
  }

  async cancelar(id: number) {
    const vId = BigInt(id);
    const venda = await this.buscarPorId(id);

    if (venda.status === VendaStatus.CANCELADO) {
      return venda;
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of venda.itens) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { increment: item.quantidade } },
        });
      }

      return tx.venda.update({
        where: { id: vId },
        data: { status: VendaStatus.CANCELADO },
        include: vendaInclude,
      });
    });
  }

  async deletar(id: number) {
    const vId = BigInt(id);
    await this.buscarPorId(id);
    await this.prisma.venda.delete({ where: { id: vId } });
  }
}
