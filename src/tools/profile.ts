import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

export function registerProfileTools(server: McpServer) {
  server.tool(
    "kameleon_profile_get",
    "Get the current user's profile.",
    {},
    async () => {
      const data = await trpcQuery("profile.get");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_profile_update",
    "Update the current user's profile.",
    { name: z.string().min(1).max(255).optional(), avatarUrl: z.string().optional(), timezone: z.string().optional() },
    async (input) => {
      const data = await trpcMutation("profile.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_profile_change_password",
    "Change the current user's password.",
    { currentPassword: z.string(), newPassword: z.string().min(8) },
    async (input) => {
      const data = await trpcMutation("profile.changePassword", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
