import { Controller, Get, Query, Res, StreamableFile } from '@nestjs/common';
import { DashboardService, DashboardStatsParams, CustomerAnalysisParams } from './dashboard.service';
import { CurrentUser } from '../auth/user.decorator';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(
    @Query() query: DashboardStatsParams,
    @CurrentUser() user: any
  ) {
    return this.dashboardService.getStats(query, user);
  }

  @Get('customer-analysis')
  async getCustomerAnalysis(
    @Query() query: CustomerAnalysisParams,
    @CurrentUser() user: any
  ) {
    if (user.perfil !== 'GESTOR') {
      throw new Error('Acesso restrito ao perfil de Gestor.');
    }
    return this.dashboardService.getCustomerAnalysis(query);
  }

  @Get('report/managerial')
  async generateManagerialReport(@Res({ passthrough: true }) res, @CurrentUser() user: any) {
    if (user.perfil !== 'GESTOR') throw new Error('Acesso negado.');
    
    // Executa o script Python
    const scriptPath = join(process.cwd(), '..', 'bi', 'python', 'relatorios', 'gerar_relatorios.py');
    await execAsync(`python "${scriptPath}"`);
    
    // O script gera um arquivo com a data de hoje. Vamos buscar o mais recente na pasta arquivos.
    const filesDir = join(process.cwd(), '..', 'bi', 'python', 'relatorios', 'arquivos');
    const fileName = `relatorio_gerencial_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
    const filePath = join(filesDir, fileName);

    if (!existsSync(filePath)) throw new Error('Relatório não encontrado.');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(createReadStream(filePath));
  }

  @Get('report/strategic')
  async generateStrategicReport(@Res({ passthrough: true }) res, @CurrentUser() user: any) {
    if (user.perfil !== 'GESTOR') throw new Error('Acesso negado.');
    
    const scriptPath = join(process.cwd(), '..', 'bi', 'python', 'relatorios', 'gerar_relatorios.py');
    await execAsync(`python "${scriptPath}"`);
    
    const filesDir = join(process.cwd(), '..', 'bi', 'python', 'relatorios', 'arquivos');
    const fileName = `relatorio_estrategico_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
    const filePath = join(filesDir, fileName);

    if (!existsSync(filePath)) throw new Error('Relatório não encontrado.');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(createReadStream(filePath));
  }
}
