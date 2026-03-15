import { Controller, Get } from "@nestjs/common";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get()
  async list() {
    const data = await this.tenants.list();
    return { data };
  }
}
