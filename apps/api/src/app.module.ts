import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
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
  ],
})
export class AppModule {}
