import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CallHandler, ExecutionContext, NestInterceptor, ValidationPipe, StreamableFile } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import cookieParser from 'cookie-parser';

class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // Se os dados forem um StreamableFile (como os relatórios PDF), 
        // ignoramos o interceptor para não corromper o binário.
        if (data instanceof StreamableFile || (data && data.pipe && typeof data.pipe === 'function')) {
          return data;
        }

        return JSON.parse(
          JSON.stringify(data, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value,
          ),
        );
      }),
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita o cookie-parser para o NestJS conseguir ler e enviar cookies
  app.use(cookieParser());

  // Configuração rigorosa de CORS para permitir cookies entre front e back
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // URL do seu Next.js
    credentials: true, // ESSENCIAL: Permite o envio/recebimento de cookies
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  app.useGlobalInterceptors(new BigIntInterceptor());
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
