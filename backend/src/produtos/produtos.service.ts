import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProdutoPayload } from './produto.interface';

const parsePreco = (value: ProdutoPayload['preco']) => {
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

const isPrecoFormat = (value: ProdutoPayload['preco']) => {
  if (typeof value === 'number') {
    const decimalPart = value.toString().split('.')[1] ?? '';
    return decimalPart.length <= 2;
  }

  if (typeof value !== 'string') return false;

  const trimmed = value.replace(/R\$\s?/i, '').trim();

  return (
    /^(\d+|\d{1,3}(\.\d{3})+)(,\d{1,2})?$/.test(trimmed) ||
    /^\d+\.\d{1,2}$/.test(trimmed)
  );
};

type ProdutoDados = {
  nome: string;
  preco: number;
  estoque: number;
  categoriaId: number;
};

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.produto.findMany({
      include: { categoria: true },
      orderBy: { id: 'asc' },
    });
  }

  async buscarPorId(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!produto) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    return produto;
  }

  async criar(payload: Partial<ProdutoPayload>) {
    const dados = await this.validarPayload(payload);
    return this.prisma.produto.create({
      data: {
        nome: dados.nome,
        preco: dados.preco,
        estoque: dados.estoque,
        categoriaId: dados.categoriaId,
      },
      include: { categoria: true },
    });
  }

  async atualizar(id: number, payload: Partial<ProdutoPayload>) {
    const produto = await this.buscarPorId(id);
    const dados = await this.validarPayload({ ...produto, ...payload });

    return this.prisma.produto.update({
      where: { id },
      data: {
        nome: dados.nome,
        preco: dados.preco,
        estoque: dados.estoque,
        categoriaId: dados.categoriaId,
      },
      include: { categoria: true },
    });
  }

  async deletar(id: number) {
    await this.buscarPorId(id);
    await this.prisma.produto.delete({ where: { id } });
  }

  private async validarPayload(payload: Partial<ProdutoPayload>): Promise<ProdutoDados> {
    const nome = payload.nome?.trim().replace(/\s+/g, ' ') ?? '';
    const preco = parsePreco(payload.preco ?? Number.NaN);
    const estoque = Number(payload.estoque);
    const categoriaId = Number(payload.categoriaId);

    if (!nome) {
      throw new BadRequestException('O campo nome e obrigatorio.');
    }

    if (!isPrecoFormat(payload.preco ?? Number.NaN)) {
      throw new BadRequestException('Formato de preco invalido. Use 100,50, 100.50 ou 10.500,50.');
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      throw new BadRequestException('O preco deve ser maior que zero.');
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      throw new BadRequestException('O estoque nao pode ser negativo.');
    }

    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      throw new BadRequestException('A categoria não pode ser vazia.');
    }

    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) {
      throw new BadRequestException('Categoria invalida.');
    }

    return { nome, preco, estoque, categoriaId };
  }
}
