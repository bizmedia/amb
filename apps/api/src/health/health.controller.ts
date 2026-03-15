import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/public.decorator";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  async getHealth() {
    return { data: await this.health.check() };
  }
}
