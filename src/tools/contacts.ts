import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i, "Invalid UUID format");

export function registerContactTools(server: McpServer) {
  // --- Contacts CRUD ---

  server.tool(
    "kameleon_contacts_create",
    "Create a new contact.",
    {
      name: z.string().min(1).max(255),
      displayName: z.string().optional(),
      type: z.enum(["individual", "company"]).optional(),
      parentId: uuid.optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      website: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      taxId: z.string().optional(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      internalNote: z.string().optional(),
    },
    async (input) => {
      const data = await trpcMutation("contacts.create", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_update",
    "Update a contact.",
    {
      contactId: uuid,
      name: z.string().optional(),
      displayName: z.string().optional(),
      type: z.enum(["individual", "company"]).optional(),
      parentId: uuid.optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      website: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      taxId: z.string().optional(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      internalNote: z.string().optional(),
      isActive: z.boolean().optional(),
    },
    async (input) => {
      const data = await trpcMutation("contacts.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_archive",
    "Archive a contact.",
    { contactId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.archive", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_restore",
    "Restore an archived contact.",
    { contactId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.restore", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_delete",
    "Permanently delete a contact.",
    { contactId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_get",
    "Get a contact by ID.",
    { contactId: uuid },
    async (input) => {
      const data = await trpcQuery("contacts.getById", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_list",
    "List contacts with filters.",
    {
      type: z.enum(["individual", "company"]).optional(),
      isActive: z.boolean().optional(),
      tagIds: z.array(uuid).optional(),
      parentId: uuid.optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().optional(),
    },
    async (input) => {
      const data = await trpcQuery("contacts.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Tags ---

  server.tool(
    "kameleon_contacts_tags_list",
    "List all contact tags.",
    {},
    async () => {
      const data = await trpcQuery("contacts.tags.list");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_tags_create",
    "Create a contact tag.",
    { name: z.string().min(1).max(50), color: z.string().optional() },
    async (input) => {
      const data = await trpcMutation("contacts.tags.create", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_tags_update",
    "Update a contact tag.",
    { tagId: uuid, name: z.string().min(1).max(50), color: z.string().optional() },
    async (input) => {
      const data = await trpcMutation("contacts.tags.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_tags_delete",
    "Delete a contact tag.",
    { tagId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.tags.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_tags_assign",
    "Assign a tag to a contact.",
    { contactId: uuid, tagId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.tags.assign", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_tags_remove",
    "Remove a tag from a contact.",
    { contactId: uuid, tagId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.tags.remove", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Addresses ---

  server.tool(
    "kameleon_contacts_addresses_add",
    "Add an address to a contact.",
    {
      contactId: uuid,
      type: z.enum(["invoice", "delivery", "other"]),
      label: z.string().optional(),
      street: z.string().optional(),
      street2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      isDefault: z.boolean().optional(),
    },
    async (input) => {
      const data = await trpcMutation("contacts.addresses.add", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_addresses_update",
    "Update a contact address.",
    {
      addressId: uuid,
      contactId: uuid,
      type: z.enum(["invoice", "delivery", "other"]).optional(),
      label: z.string().optional(),
      street: z.string().optional(),
      street2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      isDefault: z.boolean().optional(),
    },
    async (input) => {
      const data = await trpcMutation("contacts.addresses.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_addresses_delete",
    "Delete a contact address.",
    { addressId: uuid, contactId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.addresses.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Notes ---

  server.tool(
    "kameleon_contacts_notes_list",
    "List notes for a contact.",
    { contactId: uuid },
    async (input) => {
      const data = await trpcQuery("contacts.notes.list", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_notes_add",
    "Add a note to a contact.",
    { contactId: uuid, content: z.string(), isPinned: z.boolean().optional() },
    async (input) => {
      const data = await trpcMutation("contacts.notes.add", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_notes_update",
    "Update a contact note.",
    { noteId: uuid, contactId: uuid, content: z.string().optional(), isPinned: z.boolean().optional() },
    async (input) => {
      const data = await trpcMutation("contacts.notes.update", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_contacts_notes_delete",
    "Delete a contact note.",
    { noteId: uuid, contactId: uuid },
    async (input) => {
      const data = await trpcMutation("contacts.notes.delete", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
