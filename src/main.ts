import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter())

    app.setGlobalPrefix('api/v1');

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Clínica Turnos API')
        .setDescription('API para gestionar usuarios, médicos, disponibilidad y turnos')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument, {
        useGlobalPrefix: true,
    });

    await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
