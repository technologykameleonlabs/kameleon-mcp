import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery } from "../trpc-client.js";

const uuid = z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i, "Invalid UUID format");

export function registerAuditTools(server: McpServer) {
  server.tool(
    "kameleon_audit_list",
    "List audit log events.",
    { limit: z.number().min(1).max(100).optional(), offset: z.number().optional() },
    async (input) => {
      const data = await trpcQuery("audit.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_audit_get",
    "Get an audit log event by ID.",
    { auditId: uuid },
    async (input) => {
      const data = await trpcQuery("audit.getById", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
