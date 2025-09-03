"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            const allowList = [
                process.env.FRONTEND_URL || 'http://localhost:3000',
                'https://mail-tracker-frontend-2mk4.vercel.app',
                /\.vercel\.app$/,
            ];
            if (!origin) {
                return callback(null, true);
            }
            const allowed = allowList.some((allowedOrigin) => typeof allowedOrigin === 'string'
                ? origin === allowedOrigin
                : allowedOrigin.test(origin));
            if (allowed) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
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
//# sourceMappingURL=main.js.map