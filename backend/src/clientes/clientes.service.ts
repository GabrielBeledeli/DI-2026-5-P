import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQuery, parsePagination, toPaginatedResponse } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { Cliente, ClientePayload } from './cliente.interface';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const capitalizeWords = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)(\S)/g, (match) => match.toUpperCase());

type ClientesQuery = PaginationQuery & {
  search?: string;
};

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<Cliente[]> {
    return this.prisma.cliente.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async listarPaginado(query: ClientesQuery) {
    const pagination = parsePagination(query);
    const where = this.buildWhere(query);
    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return toPaginatedResponse(clientes, total, pagination);
  }

  private buildWhere(query: ClientesQuery): Prisma.ClienteWhereInput {
    const search = query.search?.trim();

    if (!search) {
      return {};
    }

    const or: Prisma.ClienteWhereInput[] = [
      { nome: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { cidade: { contains: search, mode: 'insensitive' } },
      { estado: { contains: search, mode: 'insensitive' } },
      { pais: { contains: search, mode: 'insensitive' } },
    ];

    if (/^\d+$/.test(search)) {
      or.push({ id: Number(search) });
    }

    return { OR: or };
  }

  async buscarPorId(id: number): Promise<Cliente> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return cliente;
  }

  async criar(payload: Partial<ClientePayload>): Promise<Cliente> {
    const dados = this.validarPayload(payload);

    return this.prisma.cliente.create({
      data: dados,
    });
  }

  async atualizar(id: number, payload: Partial<ClientePayload>): Promise<Cliente> {
    const cliente = await this.buscarPorId(id);
    const dados = this.validarPayload({
      ...cliente,
      ...payload,
    });

    return this.prisma.cliente.update({
      where: { id },
      data: dados,
    });
  }

  async deletar(id: number): Promise<void> {
    await this.buscarPorId(id);
    await this.prisma.cliente.delete({
      where: { id },
    });
  }

  private validarPayload(payload: Partial<ClientePayload>): ClientePayload {
    const dados = {
      nome: payload.nome ? capitalizeWords(payload.nome) : '',
      email: payload.email?.trim() ?? '',
      cidade: payload.cidade ? capitalizeWords(payload.cidade) : '',
      estado: payload.estado?.trim().toUpperCase() ?? '',
      pais: payload.pais ? capitalizeWords(payload.pais) : '',
    };

    const camposObrigatorios: Array<keyof ClientePayload> = ['nome', 'email', 'cidade', 'estado', 'pais'];
    const campoVazio = camposObrigatorios.find((campo) => dados[campo].length === 0);

    if (campoVazio) {
      throw new BadRequestException(`O campo ${campoVazio} é obrigatório.`);
    }

    if (!emailRegex.test(dados.email)) {
      throw new BadRequestException('E-mail inválido.');
    }

    return dados;
  }
}
