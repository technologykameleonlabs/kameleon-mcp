import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i, "Invalid UUID format");

export function registerMembershipTools(server: McpServer) {
  server.tool(
    "kameleon_membership_invite",
    "Invite a user to the tenant.",
    { email: z.string(), name: z.string().min(1).max(255), roleId: uuid.optional() },
    async (input) => {
      const data = await trpcMutation("membership.invite", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_membership_list",
    "List memberships with optional status filter.",
    { status: z.string().optional(), limit: z.number().min(1).max(100).optional(), offset: z.number().optional() },
    async (input) => {
      const data = await trpcQuery("membership.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_membership_update_status",
    "Update a membership's status (activate, suspend, reactivate).",
    { membershipId: uuid, status: z.string() },
    async (input) => {
      const data = await trpcMutation("membership.updateStatus", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_membership_assign_role",
    "Assign a role to a membership.",
    { membershipId: uuid, roleId: uuid },
    async (input) => {
      const data = await trpcMutation("membership.assignRole", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_membership_set_password",
    "Admin password reset for a tenant member.",
    { userId: uuid, newPassword: z.string().min(8) },
    async (input) => {
      const data = await trpcMutation("membership.setMemberPassword", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
