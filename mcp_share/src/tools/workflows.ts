import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery } from "../trpc-client.js";

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
}
