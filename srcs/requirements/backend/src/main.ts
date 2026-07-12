import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    if (process.env.NODE_ENV === 'development') {
        app.use((req: Request, res: Response, next: NextFunction) => {
            if (req.path.startsWith('/asyncapi')) {
                helmet({
                    contentSecurityPolicy: {
                        directives: {
                            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'unpkg.com'],
                            styleSrc: ["'self'", "'unsafe-inline'", 'unpkg.com'],
                        },
                    },
                })(req, res, next);
            } else {
                helmet()(req, res, next);
            }
        });
    } else {
        app.use(helmet());
    }
    app.use((_req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
    });
    app.enableCors({
        origin: [`https://${process.env.DOMAIN}`, 'http://localhost:5173'],
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
        //swagger wiki config
        const config = new DocumentBuilder()
            .setTitle('Typerun API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document);
    }

    await app.listen(3000, '0.0.0.0');
}
bootstrap();
