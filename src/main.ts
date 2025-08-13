// registra alias: 'src' -> 'dist'
import 'module-alias/register';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('VistaDoc API')
    .setDescription('Documentación de la API de VistaDoc')
    .setVersion('1.0')
    .addBearerAuth() // Para JWT en Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Ruta: /docs

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0'); // Render requiere 0.0.0.0
}
bootstrap();
