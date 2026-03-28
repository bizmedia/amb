import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("AMB API")
    .setDescription("Agent Message Bus API")
    .setVersion("1.0")
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, swaggerDocument, {
    jsonDocumentUrl: "api/docs-json",
  });

  const port = process.env.PORT ?? 3334;
  await app.listen(port);
  console.log(`AMB API listening on http://localhost:${port}/api`);
  console.log(`AMB Swagger UI listening on http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
