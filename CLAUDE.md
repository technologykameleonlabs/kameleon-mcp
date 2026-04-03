# Kameleon MCP Server

## Qué es esto
MCP server en TypeScript que conecta Claude Code con la API tRPC de Kameleon Platform.
- **152 tools** en 13 dominios
- Se distribuye a PMs y desarrolladores via `mcp_share/`
- GitHub: https://github.com/leokameleon/KameleonAppMCP
- **Estado actual: estabilización** — no agregar tools nuevas hasta nuevo aviso

## Arquitectura

```
src/index.ts          → entry point, registra todos los tool groups
src/trpc-client.ts    → wrapper HTTP para tRPC (sin SDK de tRPC)
src/tools/*.ts        → un archivo por dominio de la API
mcp_share/            → copia distribuible (sincronizar con npm run sync)
docs/openapi.json     → OpenAPI spec de la API (actualizar con /refresh-openapi)
API.md                → referencia completa de la API tRPC (2559 líneas)
```

## Convención de nombres
Todas las tools deben ser: `kameleon_[dominio]_[acción]`

Ejemplos:
- `kameleon_projects_list`
- `kameleon_work_items_create`
- `kameleon_time_entries_submit`

## Patrón canónico para una tool

Ver `src/tools/auth.ts` como referencia mínima. Estructura básica:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { trpcQuery, trpcMutation } from "../trpc-client.js";

const uuid = z.string().uuid();

export function registerXyzTools(server: McpServer) {
  server.tool(
    "kameleon_xyz_action",
    "Descripción clara de qué hace esta tool.",
    {
      param1: z.string(),
      param2: uuid.optional(),
    },
    async ({ param1, param2 }) => {
      const data = await trpcMutation("xyz.action", { param1, param2 });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
```

## trpcQuery vs trpcMutation

| Función | Cuándo usarla | HTTP |
|---|---|---|
| `trpcQuery(proc, input?)` | Lecturas (list, get, search) | GET |
| `trpcMutation(proc, input)` | Escrituras (create, update, delete, submit) | POST |

**Siempre** retornar: `{ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }`

## Variables de entorno (en .mcp.json local, gitignoreado)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `KAMELEON_BASE_URL` | URL base de la API | `https://my.kameleonlabs.ai` |
| `KAMELEON_SESSION_TOKEN` | Token de sesión | obtenido via `kameleon_login` |
| `KAMELEON_TENANT_SLUG` | Slug del tenant | `kameleon-labs` |

## Routers out-of-scope (no implementar)
`superadmin`, `billing`, `adminBilling`, `oauth`, `backup`, `jobs` — son concerns de infraestructura, no relevantes para PMs/developers.

## Skills disponibles (en .claude/skills/)

| Skill | Descripción |
|---|---|
| `/sync-share` | Sincroniza `src/` → `mcp_share/src/` |
| `/release` | Build → sync → version bump → tag → push |
| `/refresh-openapi` | Re-fetchea el spec de OpenAPI |
| `/validate-tools` | Verifica que las tools existentes usan parámetros correctos |

## Tools por dominio (152 total)

| Dominio | Archivo | Tools |
|---|---|---|
| Auth | `tools/auth.ts` | 3 |
| Projects | `tools/projects.ts` | 21 |
| Work Items | `tools/work-items.ts` | 34 |
| Time Entries | `tools/time-entries.ts` | 13 |
| Workflows | `tools/workflows.ts` | 18 |
| Financials | `tools/financials.ts` | 14 |
| Contacts | `tools/contacts.ts` | 20 |
| Membership | `tools/membership.ts` | 5 |
| RBAC | `tools/rbac.ts` | 8 |
| Tenant | `tools/tenant.ts` | 4 |
| Audit | `tools/audit.ts` | 2 |
| Profile | `tools/profile.ts` | 3 |
| User Groups | `tools/user-groups.ts` | 7 |

## Branching strategy

- `master` — stable, released. Solo via PR. Tagged con semver.
- `feature/[kebab]` — nuevas tools/capacidades
- `fix/[kebab]` — bugs en tools existentes
- `chore/[kebab]` — docs, sync, CI, non-functional

Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`

## Versioning (semver)
- `patch` (x.x.N) → bug fix en comportamiento de tool existente
- `minor` (x.N.0) → tools nuevas (backward compatible)
- `major` (N.0.0) → cambio en nombres/schemas de tools, o eliminación
