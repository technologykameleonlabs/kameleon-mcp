import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

export function registerTenantTools(server: McpServer) {
  server.tool(
    "kameleon_tenant_get_current",
    "Return current tenant info including subscription and enabled modules.",
    {},
    async () => {
      const data = await trpcQuery("tenant.getCurrent");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_tenant_list_my_tenants",
    "List all tenants the current user belongs to.",
    {},
    async () => {
      const data = await trpcQuery("tenant.listMyTenants");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_tenant_update_info",
    "Update the tenant's name and/or slug.",
    { name: z.string().min(1).max(255).optional(), slug: z.string().min(2).max(63).optional() },
    async (input) => {
      const data = await trpcMutation("tenant.updateTenantInfo", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_tenant_check_availability",
    "Check if a tenant name or slug is available.",
    { name: z.string().min(1).max(255).optional(), slug: z.string().min(2).max(63).optional() },
    async (input) => {
      const data = await trpcQuery("tenant.checkTenantAvailability", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
