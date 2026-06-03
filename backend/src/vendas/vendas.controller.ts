import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { hasPaginationQuery } from '../common/pagination';
import type { PaginationQuery } from '../common/pagination';
import { CriarVendaPayload } from './venda.interface';
import { VendasService } from './vendas.service';

type VendasQuery = PaginationQuery & {
  search?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
};

@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Get()
  listar(@Query() query: VendasQuery) {
    if (hasPaginationQuery(query)) {
      return this.vendasService.listarPaginado(query);
    }

    return this.vendasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.vendasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() payload: Partial<CriarVendaPayload>) {
    return this.vendasService.criar(payload);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.vendasService.cancelar(id);
  }

  @Delete(':id')
  deletar(@Param('id', ParseIntPipe) id: number) {
    return this.vendasService.deletar(id);
  }
}
