import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().uuid();

export function registerProjectTools(server: McpServer) {
  // --- Projects CRUD ---

  server.tool(
    "kameleon_projects_list",
    "List projects with optional search, methodology filter, and pagination.",
    {
      search: z.string().optional(),
      methodologyId: uuid.optional(),
      includeArchived: z.boolean().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().optional(),
    },
    async (input) => {
      const data = await trpcQuery("projects.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_get",
    "Get a project by ID.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcQuery("projects.getById", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_create",
    "Create a new project.",
    {
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      codePrefix: z.string().min(2).max(10),
      methodologyId: uuid.optional(),
      currency: z.string().length(3).optional(),
      timezone: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("projects.create", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_update",
    "Update project details.",
    {
      projectId: uuid,
      name: z.string().optional(),
      description: z.string().optional(),
      methodologyId: uuid.optional(),
      currency: z.string().optional(),
      timezone: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("projects.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_archive",
    "Archive a project.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcMutation("projects.archive", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_delete",
    "Permanently delete a project.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcMutation("projects.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Members ---

  server.tool(
    "kameleon_projects_list_members",
    "List members of a project.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcQuery("projects.listMembers", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_add_member",
    "Add a member to a project.",
    { projectId: uuid, userId: uuid, roleId: uuid.optional() },
    async (input) => {
      const data = await trpcMutation("projects.addMember", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_remove_member",
    "Remove a member from a project.",
    { projectId: uuid, userId: uuid },
    async (input) => {
      const data = await trpcMutation("projects.removeMember", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Containers (phases, sprints, epics, etc.) ---

  server.tool(
    "kameleon_projects_list_containers",
    "List containers (phases, sprints, epics, milestones) in a project.",
    {
      projectId: uuid,
      containerType: z.string().optional(),
      parentId: uuid.optional(),
      isClosed: z.boolean().optional(),
    },
    async (input) => {
      const data = await trpcQuery("projects.listContainers", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_create_container",
    "Create a container (phase, sprint, epic, milestone, etc.) in a project.",
    {
      projectId: uuid,
      parentId: uuid.optional(),
      containerType: z.enum(["phase", "stage", "epic", "sprint", "board_column", "milestone", "custom"]),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      startPlan: z.string().optional(),
      endPlan: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("projects.createContainer", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_update_container",
    "Update a container.",
    {
      containerId: uuid,
      name: z.string().optional(),
      description: z.string().optional(),
      isClosed: z.boolean().optional(),
      startPlan: z.string().optional(),
      endPlan: z.string().optional(),
      startActual: z.string().optional(),
      endActual: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("projects.updateContainer", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_get_container_tree",
    "Get the hierarchical container tree of a project.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcQuery("projects.getContainerTree", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Additional Project Operations ---

  server.tool(
    "kameleon_projects_restore",
    "Restore an archived project.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcMutation("projects.restore", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_close_container",
    "Close a container.",
    { containerId: uuid },
    async (input) => {
      const data = await trpcMutation("projects.closeContainer", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_reorder_containers",
    "Reorder containers in a project.",
    { projectId: uuid, containerIds: z.array(uuid) },
    async (input) => {
      const data = await trpcMutation("projects.reorderContainers", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_delete_container",
    "Delete a container.",
    { containerId: uuid },
    async (input) => {
      const data = await trpcMutation("projects.deleteContainer", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_toggle_pin",
    "Toggle project pin status for the current user.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcMutation("projects.togglePin", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_change_color",
    "Change a project's display color.",
    { projectId: uuid, color: z.string() },
    async (input) => {
      const data = await trpcMutation("projects.changeColor", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_duplicate",
    "Duplicate a project (copies settings, not work items).",
    { projectId: uuid, newName: z.string().min(1).max(255), newCodePrefix: z.string().min(2).max(10) },
    async (input) => {
      const data = await trpcMutation("projects.duplicate", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_projects_get_stats",
    "Get project statistics (tasks, completion, overdue).",
    { projectId: uuid },
    async (input) => {
      const data = await trpcQuery("projects.getStats", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
