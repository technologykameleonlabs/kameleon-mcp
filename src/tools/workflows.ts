import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().uuid();

export function registerWorkflowTools(server: McpServer) {
  server.tool(
    "kameleon_workflows_list",
    "List all workflows for the tenant.",
    { includeSystem: z.boolean().optional() },
    async (input) => {
      const data = await trpcQuery("workflows.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_get",
    "Get a workflow with its states and transitions.",
    { id: uuid },
    async (input) => {
      const data = await trpcQuery("workflows.getById", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_list_work_item_types",
    "List work item types available in the tenant. Use this to get the typeId needed when creating work items.",
    {},
    async () => {
      const data = await trpcQuery("workflows.listWorkItemTypes");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_list_methodologies",
    "List methodologies available in the tenant.",
    {},
    async () => {
      const data = await trpcQuery("workflows.listMethodologies");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Workflow CRUD ---

  server.tool(
    "kameleon_workflows_create",
    "Create a workflow.",
    { name: z.string().min(1).max(100), description: z.string().max(500).optional() },
    async (input) => {
      const data = await trpcMutation("workflows.create", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_update",
    "Update a workflow.",
    { id: uuid, name: z.string().min(1).max(100).optional(), description: z.string().max(500).optional() },
    async (input) => {
      const data = await trpcMutation("workflows.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_delete",
    "Delete a workflow.",
    { id: uuid },
    async (input) => {
      const data = await trpcMutation("workflows.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_duplicate",
    "Duplicate a workflow (copies states and transitions).",
    { workflowId: uuid, newName: z.string().min(1).max(100) },
    async (input) => {
      const data = await trpcMutation("workflows.duplicate", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- States ---

  server.tool(
    "kameleon_workflows_add_state",
    "Add a state to a workflow.",
    {
      workflowId: uuid,
      name: z.string().min(1).max(100),
      category: z.enum(["open", "in_progress", "done", "cancelled"]),
      orderIndex: z.number().optional(),
      isInitial: z.boolean().optional(),
      isTerminal: z.boolean().optional(),
      color: z.string().max(7).optional(),
    },
    async (input) => {
      const data = await trpcMutation("workflows.addState", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_update_state",
    "Update a workflow state.",
    {
      stateId: uuid,
      name: z.string().min(1).max(100).optional(),
      category: z.enum(["open", "in_progress", "done", "cancelled"]).optional(),
      orderIndex: z.number().optional(),
      isInitial: z.boolean().optional(),
      isTerminal: z.boolean().optional(),
      color: z.string().max(7).optional(),
    },
    async (input) => {
      const data = await trpcMutation("workflows.updateState", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_delete_state",
    "Delete a workflow state.",
    { stateId: uuid },
    async (input) => {
      const data = await trpcMutation("workflows.deleteState", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_reorder_states",
    "Reorder workflow states.",
    { workflowId: uuid, stateIds: z.array(uuid) },
    async (input) => {
      const data = await trpcMutation("workflows.reorderStates", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Transitions ---

  server.tool(
    "kameleon_workflows_add_transition",
    "Add a transition between workflow states.",
    {
      workflowId: uuid,
      fromStateId: uuid,
      toStateId: uuid,
      name: z.string().max(100).optional(),
      permissionKey: z.string().max(100).optional(),
    },
    async (input) => {
      const data = await trpcMutation("workflows.addTransition", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_delete_transition",
    "Delete a workflow transition.",
    { transitionId: uuid },
    async (input) => {
      const data = await trpcMutation("workflows.deleteTransition", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_generate_all_transitions",
    "Auto-generate transitions between all states in a workflow.",
    { workflowId: uuid },
    async (input) => {
      const data = await trpcMutation("workflows.generateAllTransitions", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Work Item Types ---

  server.tool(
    "kameleon_workflows_create_work_item_type",
    "Create a work item type.",
    { name: z.string().min(1).max(100), icon: z.string().max(50).optional(), color: z.string().max(7).optional(), workflowId: uuid.optional() },
    async (input) => {
      const data = await trpcMutation("workflows.createWorkItemType", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Methodologies ---

  server.tool(
    "kameleon_workflows_get_methodology",
    "Get a methodology by ID.",
    { id: uuid },
    async (input) => {
      const data = await trpcQuery("workflows.getMethodology", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_workflows_duplicate_methodology",
    "Duplicate a methodology for customization.",
    { methodologyId: uuid, newName: z.string().min(1).max(100) },
    async (input) => {
      const data = await trpcMutation("workflows.duplicateMethodology", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
