import {
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  Post,
} from '@nestjs/common';
import {
  DashboardService,
  DashboardStatsParams,
  CustomerAnalysisParams,
} from './dashboard.service';
import { CurrentUser } from '../auth/user.decorator';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function resolvePythonExecutable(venvPath: string, envVarName: string) {
  const customPython = process.env[envVarName];
  if (customPython) return customPython;

  const pythonExe =
    process.platform === 'win32'
      ? join(venvPath, 'venv', 'Scripts', 'python.exe')
      : join(venvPath, 'venv', 'bin', 'python');

  return pythonExe;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(
    @Query() query: DashboardStatsParams,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getStats(query, user);
  }

  @Get('customer-analysis')
  async getCustomerAnalysis(
    @Query() query: CustomerAnalysisParams,
    @CurrentUser() user: any,
  ) {
    if (user.perfil !== 'GESTOR') {
      throw new Error('Acesso restrito ao perfil de Gestor.');
    }
    return this.dashboardService.getCustomerAnalysis(query);
  }

  @Post('refresh-intelligence')
  async refreshIntelligence(@CurrentUser() user: any) {
    if (user.perfil !== 'GESTOR') throw new Error('Acesso negado.');

    const baseBIPath = join(process.cwd(), '..', 'bi', 'python');

    // 1. Executa o ETL
    const etlPath = join(baseBIPath, 'etl_oltp_to_bi');
    const etlExe = resolvePythonExecutable(etlPath, 'PYTHON_ETL_EXECUTABLE');
    const etlScript = join(etlPath, 'etl_pipeline.py');
    console.log('Iniciando ETL...');
    await execAsync(`"${etlExe}" "${etlScript}"`);

    // 2. Executa o ML
    const mlPath = join(baseBIPath, 'ml_churn_rfm');
    const mlExe = resolvePythonExecutable(mlPath, 'PYTHON_ML_EXECUTABLE');
    const mlScript = join(mlPath, 'ml_churn_rfm.py');
    console.log('Iniciando Recálculo de ML...');
    await execAsync(`"${mlExe}" "${mlScript}"`);

    return { message: 'Inteligência de dados atualizada com sucesso!' };
  }

  @Get('report/managerial')
  async generateManagerialReport(
    @Res({ passthrough: true }) res,
    @CurrentUser() user: any,
  ) {
    if (user.perfil !== 'GESTOR') throw new Error('Acesso negado.');

    // Antes de gerar, garante que os dados estão atualizados
    await this.refreshIntelligence(user);

    const baseBIPath = join(process.cwd(), '..', 'bi', 'python', 'relatorios');
    const pythonExe = resolvePythonExecutable(
      baseBIPath,
      'PYTHON_RELATORIOS_EXECUTABLE',
    );
    const scriptPath = join(baseBIPath, 'gerar_relatorio_gerencial.py');

    await execAsync(`"${pythonExe}" "${scriptPath}"`);

    const fileName = 'relatorio_gerencial.pdf';
    const filePath = join(baseBIPath, 'arquivos', fileName);

    if (!existsSync(filePath)) throw new Error('Relatório não encontrado.');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(createReadStream(filePath));
  }

  @Get('report/strategic')
  async generateStrategicReport(
    @Res({ passthrough: true }) res,
    @CurrentUser() user: any,
  ) {
    if (user.perfil !== 'GESTOR') throw new Error('Acesso negado.');

    // Antes de gerar, garante que os dados estão atualizados
    await this.refreshIntelligence(user);

    const baseBIPath = join(process.cwd(), '..', 'bi', 'python', 'relatorios');
    const pythonExe = resolvePythonExecutable(
      baseBIPath,
      'PYTHON_RELATORIOS_EXECUTABLE',
    );
    const scriptPath = join(baseBIPath, 'gerar_relatorio_estrategico.py');

    await execAsync(`"${pythonExe}" "${scriptPath}"`);

    const fileName = 'relatorio_estrategico.pdf';
    const filePath = join(baseBIPath, 'arquivos', fileName);

    if (!existsSync(filePath)) throw new Error('Relatório não encontrado.');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(createReadStream(filePath));
  }
}
