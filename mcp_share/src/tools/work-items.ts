import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().uuid();

export function registerWorkItemTools(server: McpServer) {
  server.tool(
    "kameleon_work_items_create",
    "Create a work item (task/ticket/bug) in a project. Requires projectId and typeId (get types from kameleon_workflows_list_work_item_types).",
    {
      projectId: uuid,
      typeId: uuid,
      stateId: uuid.optional(),
      containerId: uuid.optional(),
      parentId: uuid.optional(),
      title: z.string().min(1).max(500),
      description: z.string().optional(),
      priority: z.number().min(0).max(10).optional(),
      severity: z.number().min(0).max(10).optional(),
      assigneeId: uuid.optional(),
      reporterId: uuid.optional(),
      estimateMinutes: z.number().optional(),
      dueDate: z.string().optional(),
      startPlan: z.string().optional(),
      endPlan: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("workItems.create", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_list",
    "List work items in a project with optional filters.",
    {
      projectId: uuid,
      containerId: uuid.optional(),
      typeId: uuid.optional(),
      stateId: uuid.optional(),
      assigneeId: uuid.optional(),
      search: z.string().optional(),
      includeArchived: z.boolean().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().optional(),
    },
    async (input) => {
      const data = await trpcQuery("workItems.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_get",
    "Get a work item by ID.",
    { workItemId: uuid },
    async (input) => {
      const data = await trpcQuery("workItems.getById", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_get_by_key",
    "Get a work item by its key (e.g. 'PROJ-123').",
    { key: z.string(), projectId: uuid },
    async (input) => {
      const data = await trpcQuery("workItems.getByKey", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_my_assigned",
    "Get work items assigned to the current user across all projects.",
    { limit: z.number().min(1).max(20).optional() },
    async (input) => {
      const data = await trpcQuery("workItems.myAssignedItems", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_update",
    "Update a work item.",
    {
      workItemId: uuid,
      title: z.string().optional(),
      description: z.string().optional(),
      typeId: uuid.optional(),
      stateId: uuid.optional(),
      priority: z.number().optional(),
      severity: z.number().optional(),
      containerId: uuid.optional(),
      assigneeId: uuid.optional(),
      estimateMinutes: z.number().optional(),
      dueDate: z.string().optional(),
      startPlan: z.string().optional(),
      endPlan: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("workItems.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_transition",
    "Transition a work item to a new workflow state.",
    { workItemId: uuid, toStateId: uuid },
    async (input) => {
      const data = await trpcMutation("workItems.transition", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_delete",
    "Permanently delete a work item.",
    { workItemId: uuid },
    async (input) => {
      const data = await trpcMutation("workItems.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_archive",
    "Archive a work item.",
    { workItemId: uuid },
    async (input) => {
      const data = await trpcMutation("workItems.archive", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_search",
    "Search work items by title/key in a project (max 10 results).",
    { projectId: uuid, search: z.string(), excludeIds: z.array(uuid).optional() },
    async (input) => {
      const data = await trpcQuery("workItems.searchWorkItems", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Subtasks ---

  server.tool(
    "kameleon_work_items_add_task",
    "Add a subtask to a work item.",
    { workItemId: uuid, title: z.string().min(1).max(500), assigneeId: uuid.optional(), dueDate: z.string().optional() },
    async (input) => {
      const data = await trpcMutation("workItems.addTask", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_toggle_task",
    "Toggle a subtask completion.",
    { taskId: uuid, isDone: z.boolean() },
    async (input) => {
      const data = await trpcMutation("workItems.toggleTask", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_list_tasks",
    "List subtasks for a work item.",
    { workItemId: uuid },
    async (input) => {
      const data = await trpcQuery("workItems.listTasks", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_remove_task",
    "Remove a subtask.",
    { taskId: uuid },
    async (input) => {
      const data = await trpcMutation("workItems.removeTask", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Comments ---

  server.tool(
    "kameleon_work_items_list_comments",
    "List comments on a work item.",
    { workItemId: uuid },
    async (input) => {
      const data = await trpcQuery("workItems.listComments", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_add_comment",
    "Add a comment to a work item.",
    { workItemId: uuid, content: z.string().min(1).max(5000) },
    async (input) => {
      const data = await trpcMutation("workItems.addComment", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_delete_comment",
    "Delete a comment.",
    { commentId: uuid },
    async (input) => {
      const data = await trpcMutation("workItems.deleteComment", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Links ---

  server.tool(
    "kameleon_work_items_add_link",
    "Create a dependency link between two work items.",
    {
      fromWorkItemId: uuid,
      toWorkItemId: uuid,
      linkType: z.enum(["blocks", "is_blocked", "relates_to", "duplicates", "parent_of", "child_of"]),
    },
    async (input) => {
      const data = await trpcMutation("workItems.addLink", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_work_items_list_links",
    "List links for a work item.",
    { workItemId: uuid },
    async (input) => {
      const data = await trpcQuery("workItems.listLinks", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Workflow Config ---

  server.tool(
    "kameleon_work_items_get_workflow_config",
    "Get workflow config (types, states, transitions) for a project. Essential for knowing which typeId/stateId to use when creating work items.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcQuery("workItems.getProjectWorkflowConfig", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
