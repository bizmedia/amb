import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ProjectTokensAdminController } from "./project-tokens-admin.controller";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, ProjectTokensAdminController],
  providers: [AuthService],
})
export class AuthModule {}
