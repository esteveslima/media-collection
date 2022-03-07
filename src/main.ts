import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { GeneralExceptionFilter } from './common/filters/general-exception.filter';
import { LogInterceptor } from './common/interceptors/log.interceptor';
import { CustomLogger } from './common/utils/custom-logger';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Set default logger to be the customized logger
  app.useLogger(new CustomLogger());

  // Add general interceptor for request logging
  app.useGlobalInterceptors(new LogInterceptor());

  // Add general purpose exception filter(error logging)
  app.useGlobalFilters(new GeneralExceptionFilter());

  // Add DTOs serializer transformation/valitations globally
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Add built-in validation pipe to purge incoming request data globally
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Add base prefix for routes
  app.setGlobalPrefix('/api', { exclude: ['/'] });

  // Setup developer web tools for non development environments
  const isDevelopmentEnvironment =
    process.env.NODE_ENV && !process.env.NODE_ENV.includes('prod');
  if (isDevelopmentEnvironment) {
    // Setup basic auth for the web tools(must be set before the tools routes)
    const webToolsRoutes = {
      swaggerRoute: '/swagger',
      // graphqlPlaygroundRoute: '/api/graphql',  // the basic auth middleware breaks communication with api(TODO: find a way to change playground UI URL)
    };
    Object.values(webToolsRoutes).forEach((route) => {
      app.use(
        route,
        basicAuth({
          challenge: true,
          users: { [process.env.DEVELOPER_USER]: process.env.DEVELOPER_PASS },
        }),
      );
    });

    // Setup swagger
    const swaggerDocumentConfig = new DocumentBuilder()
      .setTitle('media-collection')
      .setVersion('1.0')
      .setDescription('Practice template project on Nest.js')
      .addBearerAuth({ type: 'http', scheme: 'Bearer', bearerFormat: 'JWT' })
      .build();
    const swaggerDocument = SwaggerModule.createDocument(
      app,
      swaggerDocumentConfig,
    );
    SwaggerModule.setup(webToolsRoutes.swaggerRoute, app, swaggerDocument);
  }

  // Setup cors for all subdomains from specific client domain
  const allowedDomain = 'localhost';
  app.enableCors({
    origin: [
      new RegExp(
        '^https?:\\/\\/(.*).?[ALLOWED_DOMAIN](:\\d{4})?$'.replace(
          '[ALLOWED_DOMAIN]',
          allowedDomain,
        ),
      ),
    ],
    methods: ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT);
}
bootstrap();
