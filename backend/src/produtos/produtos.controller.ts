import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ProdutoPayload } from './produto.interface';
import { ProdutosService } from './produtos.service';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  listar() {
    return this.produtosService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.buscarPorId(id);
  }

  @Post()
  criar(@Body() payload: Partial<ProdutoPayload>) {
    return this.produtosService.criar(payload);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() payload: Partial<ProdutoPayload>) {
    return this.produtosService.atualizar(id, payload);
  }

  @Delete(':id')
  deletar(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.deletar(id);
  }
}
