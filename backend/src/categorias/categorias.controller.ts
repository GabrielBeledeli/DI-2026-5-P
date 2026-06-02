import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { hasPaginationQuery } from '../common/pagination';
import type { PaginationQuery } from '../common/pagination';
import { CategoriaPayload } from './categoria.interface';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  listar(@Query() query: PaginationQuery) {
    if (hasPaginationQuery(query)) {
      return this.categoriasService.listarPaginado(query);
    }

    return this.categoriasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() payload: Partial<CategoriaPayload>) {
    return this.categoriasService.criar(payload);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() payload: Partial<CategoriaPayload>) {
    return this.categoriasService.atualizar(id, payload);
  }

  @Delete(':id')
  deletar(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.deletar(id);
  }
}
