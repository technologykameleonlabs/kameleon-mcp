import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i, "Invalid UUID format");

export function registerRbacTools(server: McpServer) {
  server.tool(
    "kameleon_rbac_create_role",
    "Create a new custom role in the tenant.",
    { name: z.string().min(1).max(100), description: z.string().max(500).optional() },
    async (input) => {
      const data = await trpcMutation("rbac.createRole", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_rbac_update_role",
    "Update a role's name/description.",
    { roleId: uuid, name: z.string().min(1).max(100).optional(), description: z.string().max(500).optional() },
    async (input) => {
      const data = await trpcMutation("rbac.updateRole", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_rbac_delete_role",
    "Delete a role. Cannot delete system roles.",
    { roleId: uuid },
    async (input) => {
      const data = await trpcMutation("rbac.deleteRole", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_rbac_list_roles",
    "List all roles in the tenant with assigned permissions.",
    {},
    async () => {
      const data = await trpcQuery("rbac.listRoles");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_rbac_get_role",
    "Get a specific role by ID with assigned permissions.",
    { roleId: uuid },
    async (input) => {
      const data = await trpcQuery("rbac.getRole", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_rbac_assign_permissions",
    "Assign permissions to a role (replaces existing).",
    { roleId: uuid, permissions: z.array(z.object({ permissionId: uuid, scope: z.enum(["all", "own", "team"]) })) },
    async (input) => {
      const data = await trpcMutation("rbac.assignPermissions", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_rbac_list_permissions",
    "List all permissions in the platform catalog.",
    {},
    async () => {
      const data = await trpcQuery("rbac.listPermissions");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_rbac_get_my_permissions",
    "Return the current user's effective permissions and SuperAdmin status.",
    {},
    async () => {
      const data = await trpcQuery("rbac.getMyPermissions");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
