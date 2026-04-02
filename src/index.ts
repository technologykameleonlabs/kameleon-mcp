import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerWorkItemTools } from "./tools/work-items.js";
import { registerTimeEntryTools } from "./tools/time-entries.js";
import { registerWorkflowTools } from "./tools/workflows.js";
import { registerFinancialTools } from "./tools/financials.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerMembershipTools } from "./tools/membership.js";
import { registerRbacTools } from "./tools/rbac.js";
import { registerTenantTools } from "./tools/tenant.js";
import { registerAuditTools } from "./tools/audit.js";
import { registerProfileTools } from "./tools/profile.js";
import { registerUserGroupTools } from "./tools/user-groups.js";

const server = new McpServer({
  name: "kameleon",
  version: "2.0.0",
});

// Register all tool groups
registerAuthTools(server);
registerProjectTools(server);
registerWorkItemTools(server);
registerTimeEntryTools(server);
registerWorkflowTools(server);
registerFinancialTools(server);
registerContactTools(server);
registerMembershipTools(server);
registerRbacTools(server);
registerTenantTools(server);
registerAuditTools(server);
registerProfileTools(server);
registerUserGroupTools(server);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
