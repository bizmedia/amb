import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectsModule } from "./projects/projects.module";
import { AgentsModule } from "./agents/agents.module";
import { ThreadsModule } from "./threads/threads.module";
import { MessagesModule } from "./messages/messages.module";
import { IssuesModule } from "./issues/issues.module";
import { DlqModule } from "./dlq/dlq.module";
import { JwtAuthGuard } from "./common/jwt-auth.guard";
import { AuthModule } from "./auth/auth.module";
import { RateLimitGuard } from "./common/rate-limit.guard";
import { TenantsModule } from "./tenants/tenants.module";
import { ObservabilityModule } from "./observability/observability.module";
import { ObservabilityInterceptor } from "./observability/observability.interceptor";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    AgentsModule,
    ThreadsModule,
    MessagesModule,
    IssuesModule,
    DlqModule,
    AuthModule,
    TenantsModule,
    ObservabilityModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ObservabilityInterceptor,
    },
  ],
})
export class AppModule {}
