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

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    AgentsModule,
    ThreadsModule,
    MessagesModule,
    IssuesModule,
    DlqModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
