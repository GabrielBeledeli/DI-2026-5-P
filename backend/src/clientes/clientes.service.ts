import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cliente, ClientePayload } from './cliente.interface';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const capitalizeWords = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)(\S)/g, (match) => match.toUpperCase());

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
