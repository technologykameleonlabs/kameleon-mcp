import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().uuid();

export function registerUserGroupTools(server: McpServer) {
  server.tool(
    "kameleon_user_groups_list",
    "List user groups.",
    {},
    async () => {
      const data = await trpcQuery("userGroups.list");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_user_groups_create",
    "Create a user group.",
    { name: z.string().min(1).max(100), description: z.string().optional() },
    async (input) => {
      const data = await trpcMutation("userGroups.create", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_user_groups_update",
    "Update a user group.",
    { groupId: uuid, name: z.string().optional(), description: z.string().optional() },
    async (input) => {
      const data = await trpcMutation("userGroups.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_user_groups_delete",
    "Delete a user group.",
    { groupId: uuid },
    async (input) => {
      const data = await trpcMutation("userGroups.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_user_groups_add_member",
    "Add a member to a user group.",
    { groupId: uuid, userId: uuid },
    async (input) => {
      const data = await trpcMutation("userGroups.addMember", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_user_groups_remove_member",
    "Remove a member from a user group.",
    { groupId: uuid, userId: uuid },
    async (input) => {
      const data = await trpcMutation("userGroups.removeMember", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_user_groups_list_members",
    "List members of a user group.",
    { groupId: uuid },
    async (input) => {
      const data = await trpcQuery("userGroups.listMembers", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
