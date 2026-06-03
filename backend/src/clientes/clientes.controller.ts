import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { hasPaginationQuery } from '../common/pagination';
import type { PaginationQuery } from '../common/pagination';
import type { Cliente, ClientePayload } from './cliente.interface';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar(@Query() query: PaginationQuery) {
    if (hasPaginationQuery(query)) {
      return this.clientesService.listarPaginado(query);
    }

    return this.clientesService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
    return this.clientesService.buscarPorId(id);
  }

  @Post()
  criar(@Body() payload: Partial<ClientePayload>): Promise<Cliente> {
    return this.clientesService.criar(payload);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() payload: Partial<ClientePayload>): Promise<Cliente> {
    return this.clientesService.atualizar(id, payload);
  }

  @Delete(':id')
  deletar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.clientesService.deletar(id);
  }
}
