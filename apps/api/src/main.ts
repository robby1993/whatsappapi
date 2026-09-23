import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

dotenv.config();

async function bootstrap() {
  // Intercept process.stdout.write to silence internal libsignal C/JS E2EE key rotation logs
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk: any, encoding?: any, callback?: any): boolean => {
    const str = typeof chunk === 'string' ? chunk : chunk.toString();
    if (str.includes('Closing session:') || str.includes('SessionEntry')) {
      return true;
    }
    return originalStdoutWrite(chunk, encoding, callback);
  };

  const originalLog = console.log;
  console.log = (...args: any[]) => {
    if (typeof args[0] === 'string' && (args[0].includes('Closing session:') || args[0].includes('SessionEntry'))) {
      return;
    }
    originalLog(...args);
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Global Safety Net to prevent library-internal errors from crashing the process
  process.on('uncaughtException', (err) => {
    console.error('🔥 Global Uncaught Exception:', err.message);
    if (err.stack) console.error(err.stack);
  });

  process.on('unhandledRejection', (reason: any) => {
    console.error('🌊 Global Unhandled Rejection:', reason?.message || reason);
  });

  app.setGlobalPrefix('api');
  app.enableCors();

  // Serve static files from the uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    transform: true,
  }));

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 MsgPilot Server running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('API failed to start. Login and every other route will return 502 until this process stays up.');
  console.error(err?.message || err);
  process.exit(1);
});

