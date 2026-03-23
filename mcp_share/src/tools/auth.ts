import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcMutation, trpcQuery, setSessionToken } from "../trpc-client.js";

export function registerAuthTools(server: McpServer) {
  server.tool(
    "kameleon_login",
    "Authenticate with email/password. Returns session token (also sets it for subsequent calls). If MFA is enabled returns a challenge instead.",
    { email: z.string().email(), password: z.string() },
    async ({ email, password }) => {
      const data = await trpcMutation("auth.login", { email, password });
      // If we got a token back, store it
      if (typeof data === "object" && data !== null && "token" in data) {
        setSessionToken((data as any).token);
      }
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_get_current_user",
    "Get the current authenticated user with memberships and tenant info.",
    {},
    async () => {
      const data = await trpcQuery("auth.getCurrentUser");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "kameleon_check_session",
    "Check if the current session is valid.",
    {},
    async () => {
      const data = await trpcQuery("auth.checkSession");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
