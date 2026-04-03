import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().uuid();

export function registerTimeEntryTools(server: McpServer) {
  server.tool(
    "kameleon_time_entries_create",
    "Create a time entry for a project (optionally linked to a work item).",
    {
      projectId: uuid,
      workItemId: uuid.optional(),
      taskId: uuid.optional(),
      userId: uuid.optional(),
      description: z.string().optional(),
      date: z.string(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      durationMinutes: z.number().min(1),
      isBillable: z.boolean().optional(),
    },
    async (input) => {
      const data = await trpcMutation("timeEntries.create", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_list",
    "List time entries with optional filters.",
    {
      projectId: uuid.optional(),
      workItemId: uuid.optional(),
      userId: uuid.optional(),
      status: z.enum(["draft", "submitted", "approved", "rejected", "locked"]).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().optional(),
    },
    async (input) => {
      const data = await trpcQuery("timeEntries.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_my_entries",
    "Get time entries for the current user.",
    { dateFrom: z.string().optional(), dateTo: z.string().optional() },
    async (input) => {
      const data = await trpcQuery("timeEntries.myEntries", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_update",
    "Update a time entry.",
    {
      timeEntryId: uuid,
      description: z.string().optional(),
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      durationMinutes: z.number().min(1).optional(),
      isBillable: z.boolean().optional(),
    },
    async (input) => {
      const data = await trpcMutation("timeEntries.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_delete",
    "Delete a time entry.",
    { timeEntryId: uuid },
    async (input) => {
      const data = await trpcMutation("timeEntries.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_submit",
    "Submit a draft time entry for approval.",
    { timeEntryId: uuid },
    async (input) => {
      const data = await trpcMutation("timeEntries.submit", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_project_summary",
    "Get time tracking summary for a project.",
    {
      projectId: uuid,
      workItemId: uuid.optional(),
      userId: uuid.optional(),
    },
    async (input) => {
      const data = await trpcQuery("timeEntries.projectSummary", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Get by ID ---

  server.tool(
    "kameleon_time_entries_get",
    "Get a time entry by ID.",
    { timeEntryId: uuid },
    async (input) => {
      const data = await trpcQuery("timeEntries.getById", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Approval Flow ---

  server.tool(
    "kameleon_time_entries_approve",
    "Approve a submitted time entry.",
    { timeEntryId: uuid },
    async (input) => {
      const data = await trpcMutation("timeEntries.approve", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_reject",
    "Reject a submitted time entry.",
    { timeEntryId: uuid },
    async (input) => {
      const data = await trpcMutation("timeEntries.reject", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_resubmit",
    "Resubmit a rejected time entry.",
    { timeEntryId: uuid },
    async (input) => {
      const data = await trpcMutation("timeEntries.resubmit", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_pending_approval",
    "List time entries pending approval.",
    { projectId: uuid.optional() },
    async (input) => {
      const data = await trpcQuery("timeEntries.pendingApproval", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_time_entries_export",
    "Export time entries for a project.",
    {
      projectId: uuid,
      userId: uuid.optional(),
      status: z.array(z.string()).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    },
    async (input) => {
      const data = await trpcQuery("timeEntries.export", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
