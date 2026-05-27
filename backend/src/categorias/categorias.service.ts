import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriaPayload } from './categoria.interface';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const categorias = await this.prisma.categoria.findMany({
      include: { _count: { select: { produtos: true } } },
      orderBy: { id: 'asc' },
    });

    return categorias.map(({ _count, ...categoria }) => ({
      ...categoria,
      totalProdutos: _count.produtos,
    }));
  }

  async buscarPorId(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { produtos: true } } },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria nao encontrada.');
    }

    const { _count, ...dados } = categoria;
    return { ...dados, totalProdutos: _count.produtos };
  }

  async criar(payload: Partial<CategoriaPayload>) {
    const dados = this.validarPayload(payload);
    return this.prisma.categoria.create({ data: dados });
  }

  async atualizar(id: number, payload: Partial<CategoriaPayload>) {
    await this.buscarPorId(id);
    const dados = this.validarPayload(payload);
    return this.prisma.categoria.update({ where: { id }, data: dados });
  }

  async deletar(id: number) {
    await this.buscarPorId(id);
    await this.prisma.categoria.delete({ where: { id } });
  }

  private validarPayload(payload: Partial<CategoriaPayload>): CategoriaPayload {
    const nome = payload.nome?.trim().replace(/\s+/g, ' ') ?? '';

    if (!nome) {
      throw new BadRequestException('O campo nome e obrigatorio.');
    }

    return { nome };
  }
}
