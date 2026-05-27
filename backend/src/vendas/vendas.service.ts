import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VendaStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarVendaPayload } from './venda.interface';

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

  async buscarPorId(id: number) {
    const venda = await this.prisma.venda.findUnique({
      where: { id },
      include: vendaInclude,
    });

    if (!venda) {
      throw new NotFoundException('Venda nao encontrada.');
    }

    return venda;
  }

  async criar(payload: Partial<CriarVendaPayload>) {
    const dados = await this.validarPayload(payload);

    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.create({
        data: {
          clienteId: dados.clienteId,
          total: dados.total,
          itens: {
            create: dados.itens.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              subtotal: item.subtotal,
            })),
          },
        },
        include: vendaInclude,
      });

      await Promise.all(
        dados.itens.map((item) =>
          tx.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { decrement: item.quantidade } },
          }),
        ),
      );

      return venda;
    });
  }

  async cancelar(id: number) {
    const venda = await this.buscarPorId(id);

    if (venda.status === VendaStatus.CANCELADO) {
      return venda;
    }

    return this.prisma.$transaction(async (tx) => {
      await Promise.all(
        venda.itens.map((item) =>
          tx.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { increment: item.quantidade } },
          }),
        ),
      );

      return tx.venda.update({
        where: { id },
        data: { status: VendaStatus.CANCELADO },
        include: vendaInclude,
      });
    });
  }

  async deletar(id: number) {
    await this.buscarPorId(id);
    await this.prisma.venda.delete({ where: { id } });
  }

  private async validarPayload(payload: Partial<CriarVendaPayload>) {
    const clienteId = Number(payload.clienteId);
    const itensPayload = payload.itens ?? [];

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      throw new BadRequestException('Cliente invalido.');
    }

    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      throw new BadRequestException('Cliente invalido.');
    }

    if (!Array.isArray(itensPayload) || itensPayload.length === 0) {
      throw new BadRequestException('Adicione pelo menos um item.');
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

        const produto = await this.prisma.produto.findUnique({ where: { id: produtoId } });
        if (!produto) {
          throw new BadRequestException('Produto invalido.');
        }

        if (produto.estoque <= 0) {
          throw new BadRequestException(`${produto.nome} esta sem estoque.`);
        }

        if (produto.estoque < quantidade) {
          throw new BadRequestException(`Estoque insuficiente para ${produto.nome}.`);
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
}
