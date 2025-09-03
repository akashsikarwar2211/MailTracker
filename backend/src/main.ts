import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication (allow Vercel and localhost)
  app.enableCors({
    origin: (origin, callback) => {
      const allowList: (string | RegExp)[] = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://mail-tracker-frontend-2mk4.vercel.app',
        /\.vercel\.app$/,
      ];

      if (!origin) {
        // Allow non-browser or same-origin requests
        return callback(null, true);
      }

      const allowed = allowList.some((allowedOrigin) =>
        typeof allowedOrigin === 'string'
          ? origin === allowedOrigin
          : allowedOrigin.test(origin)
      );

      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global prefix for API routes
  app.setGlobalPrefix('api');
  
  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  
  console.log(`🚀 InspMail Backend running on http://${host}:${port}`);
  console.log(`📧 IMAP monitoring enabled for ${process.env.IMAP_HOST}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
