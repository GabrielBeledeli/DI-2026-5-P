import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CriarVendaPayload } from './venda.interface';
import { VendasService } from './vendas.service';

@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Get()
  listar() {
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
