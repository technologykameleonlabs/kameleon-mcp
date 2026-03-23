import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerWorkItemTools } from "./tools/work-items.js";
import { registerTimeEntryTools } from "./tools/time-entries.js";
import { registerWorkflowTools } from "./tools/workflows.js";

const server = new McpServer({
  name: "kameleon",
  version: "1.0.0",
});

// Register all tool groups
registerAuthTools(server);
registerProjectTools(server);
registerWorkItemTools(server);
registerTimeEntryTools(server);
registerWorkflowTools(server);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
