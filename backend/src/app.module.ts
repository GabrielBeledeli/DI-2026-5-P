import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriasModule } from './categorias/categorias.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProdutosModule } from './produtos/produtos.module';
import { VendasModule } from './vendas/vendas.module';

@Module({
  imports: [ClientesModule, CategoriasModule, ProdutosModule, VendasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
