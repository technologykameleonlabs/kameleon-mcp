import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().uuid();

export function registerFinancialTools(server: McpServer) {
  // --- Financial Entries ---

  server.tool(
    "kameleon_financials_create_entry",
    "Create a financial entry for a project.",
    {
      projectId: uuid,
      categoryId: uuid.optional(),
      direction: z.enum(["expense", "revenue"]),
      bucket: z.enum(["budget", "plan", "committed", "actual"]),
      amount: z.number().min(0),
      currency: z.string().length(3),
      date: z.string(),
      description: z.string().optional(),
      externalRef: z.string().optional(),
      vendorName: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("financials.createEntry", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_list_entries",
    "List financial entries with filters.",
    {
      projectId: uuid.optional(),
      categoryId: uuid.optional(),
      direction: z.enum(["expense", "revenue"]).optional(),
      bucket: z.string().optional(),
      status: z.enum(["draft", "pending", "approved", "paid"]).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().optional(),
    },
    async (input) => {
      const data = await trpcQuery("financials.listEntries", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_get_entry",
    "Get a financial entry by ID.",
    { entryId: uuid },
    async (input) => {
      const data = await trpcQuery("financials.getEntry", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_update_entry",
    "Update a financial entry.",
    {
      entryId: uuid,
      categoryId: uuid.optional(),
      amount: z.number().min(0).optional(),
      date: z.string().optional(),
      description: z.string().optional(),
      externalRef: z.string().optional(),
      vendorName: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("financials.updateEntry", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_approve_entry",
    "Approve a financial entry.",
    { entryId: uuid },
    async (input) => {
      const data = await trpcMutation("financials.approveEntry", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_mark_paid",
    "Mark a financial entry as paid.",
    { entryId: uuid },
    async (input) => {
      const data = await trpcMutation("financials.markPaid", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_delete_entry",
    "Delete a financial entry.",
    { entryId: uuid },
    async (input) => {
      const data = await trpcMutation("financials.deleteEntry", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Categories ---

  server.tool(
    "kameleon_financials_create_category",
    "Create a financial category.",
    { name: z.string().min(1).max(100), code: z.string().max(20), direction: z.enum(["expense", "revenue"]) },
    async (input) => {
      const data = await trpcMutation("financials.createCategory", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_list_categories",
    "List financial categories.",
    { activeOnly: z.boolean().optional() },
    async (input) => {
      const data = await trpcQuery("financials.listCategories", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_update_category",
    "Update a financial category.",
    { categoryId: uuid, name: z.string().optional(), code: z.string().optional() },
    async (input) => {
      const data = await trpcMutation("financials.updateCategory", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_deactivate_category",
    "Deactivate a financial category.",
    { categoryId: uuid },
    async (input) => {
      const data = await trpcMutation("financials.deactivateCategory", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Summaries ---

  server.tool(
    "kameleon_financials_project_summary",
    "Get aggregated financial summary for a project.",
    { projectId: uuid },
    async (input) => {
      const data = await trpcQuery("financials.projectSummary", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_by_category",
    "Get financials grouped by category.",
    { projectId: uuid, bucket: z.enum(["budget", "plan", "committed", "actual"]).optional() },
    async (input) => {
      const data = await trpcQuery("financials.byCategory", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_financials_by_month",
    "Get financials grouped by month.",
    { projectId: uuid, year: z.number().min(2000).max(2100) },
    async (input) => {
      const data = await trpcQuery("financials.byMonth", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
