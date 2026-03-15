/**
 * Re-export Agent Message Bus SDK from @amb-app/sdk for backward compatibility.
 * Scripts and examples can keep importing from "@/lib/sdk" or "../lib/sdk".
 */
export {
  MessageBusClient,
  MessageBusError,
  createClient,
} from "@amb-app/sdk";
export type { CreateClientOptions } from "@amb-app/sdk";
export * from "@amb-app/sdk";
