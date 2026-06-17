import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('AIS Test API')
    .setDescription(' API documentation of Movie Ticket Booking System for AIS Test')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('APP', 'Example API')
    .addTag('USERS', 'User management API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
      customSiteTitle: 'AIS Test API Docs',
      defaultModelsExpandDepth: -1,
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
