# Kameleon MCP Server

MCP Server para conectar **Claude Code** con la plataforma **Kameleon**. Permite gestionar proyectos, tareas, time entries y mas directamente desde tu terminal con Claude.

## Requisitos

- **Node.js** 18 o superior
- **Claude Code** instalado
- Una cuenta en **Kameleon Platform** (https://my.kameleonlabs.ai)

## Instalacion

### 1. Copia esta carpeta a tu maquina

Copia todo el contenido de `mcp_share` a una carpeta local. Por ejemplo:

```bash
# Si lo tienes en un repo:
git clone <repo-url>
cd kameleon-mcp

# O simplemente copia la carpeta
cp -r mcp_share ~/kameleon-mcp
```

### 2. Instala las dependencias

```bash
cd ~/kameleon-mcp
npm install
```

### 3. Configura tus credenciales

Edita el archivo `.mcp.json` en la raiz de la carpeta y reemplaza los valores:

```json
{
  "mcpServers": {
    "kameleon": {
      "command": "npx",
      "args": ["tsx", "./src/index.ts"],
      "env": {
        "KAMELEON_BASE_URL": "https://my.kameleonlabs.ai",
        "KAMELEON_SESSION_TOKEN": "<TU_SESSION_TOKEN>",
        "KAMELEON_TENANT_SLUG": "<TU_TENANT_SLUG>"
      }
    }
  }
}
```

| Variable | Como obtenerla |
|---|---|
| `KAMELEON_SESSION_TOKEN` | Inicia sesion en https://my.kameleonlabs.ai, abre DevTools (F12) > Application > Cookies > busca `kameleon-session` y copia el valor |
| `KAMELEON_TENANT_SLUG` | Es el subdominio de tu organizacion. Si tu URL es `miempresa.kameleonlabs.ai`, el slug es `miempresa` |

> **Alternativa:** Puedes dejar `KAMELEON_SESSION_TOKEN` vacio y usar la tool `kameleon_login` desde Claude Code con tu email y password para autenticarte.

### 4. Inicia Claude Code desde esa carpeta

```bash
cd ~/kameleon-mcp
claude
```

Claude Code detectara automaticamente el `.mcp.json` y cargara el MCP server.

### 5. Verifica que funciona

Dentro de Claude Code, escribe:

```
verifica mi sesion de kameleon
```

Deberia responder con tu nombre y email de Kameleon.

## Tools disponibles (47 total)

### Auth (3)
| Tool | Descripcion |
|---|---|
| `kameleon_login` | Autenticarse con email/password |
| `kameleon_get_current_user` | Ver usuario actual con memberships |
| `kameleon_check_session` | Verificar si la sesion es valida |

### Projects (13)
| Tool | Descripcion |
|---|---|
| `kameleon_projects_list` | Listar proyectos |
| `kameleon_projects_get` | Obtener un proyecto por ID |
| `kameleon_projects_create` | Crear un proyecto |
| `kameleon_projects_update` | Actualizar un proyecto |
| `kameleon_projects_archive` | Archivar un proyecto |
| `kameleon_projects_delete` | Eliminar un proyecto |
| `kameleon_projects_list_members` | Listar miembros de un proyecto |
| `kameleon_projects_add_member` | Agregar miembro a un proyecto |
| `kameleon_projects_remove_member` | Remover miembro de un proyecto |
| `kameleon_projects_list_containers` | Listar contenedores (sprints, fases, etc.) |
| `kameleon_projects_create_container` | Crear contenedor |
| `kameleon_projects_update_container` | Actualizar contenedor |
| `kameleon_projects_get_container_tree` | Ver arbol jerarquico de contenedores |

### Work Items (20)
| Tool | Descripcion |
|---|---|
| `kameleon_work_items_create` | Crear tarea/ticket/bug |
| `kameleon_work_items_list` | Listar work items con filtros |
| `kameleon_work_items_get` | Obtener work item por ID |
| `kameleon_work_items_get_by_key` | Obtener por clave (ej: `NEM-42`) |
| `kameleon_work_items_my_assigned` | Mis tareas asignadas |
| `kameleon_work_items_update` | Actualizar un work item |
| `kameleon_work_items_transition` | Cambiar estado de workflow |
| `kameleon_work_items_delete` | Eliminar work item |
| `kameleon_work_items_archive` | Archivar work item |
| `kameleon_work_items_search` | Buscar work items por titulo/clave |
| `kameleon_work_items_add_task` | Agregar subtarea |
| `kameleon_work_items_toggle_task` | Marcar/desmarcar subtarea |
| `kameleon_work_items_list_tasks` | Listar subtareas |
| `kameleon_work_items_remove_task` | Eliminar subtarea |
| `kameleon_work_items_list_comments` | Listar comentarios |
| `kameleon_work_items_add_comment` | Agregar comentario |
| `kameleon_work_items_delete_comment` | Eliminar comentario |
| `kameleon_work_items_add_link` | Crear dependencia entre work items |
| `kameleon_work_items_list_links` | Listar dependencias |
| `kameleon_work_items_get_workflow_config` | Ver configuracion de workflow del proyecto |

### Time Entries (7)
| Tool | Descripcion |
|---|---|
| `kameleon_time_entries_create` | Registrar tiempo |
| `kameleon_time_entries_list` | Listar entradas de tiempo |
| `kameleon_time_entries_my_entries` | Mis entradas de tiempo |
| `kameleon_time_entries_update` | Actualizar entrada |
| `kameleon_time_entries_delete` | Eliminar entrada |
| `kameleon_time_entries_submit` | Enviar para aprobacion |
| `kameleon_time_entries_project_summary` | Resumen de tiempo por proyecto |

### Workflows (4)
| Tool | Descripcion |
|---|---|
| `kameleon_workflows_list` | Listar workflows |
| `kameleon_workflows_get` | Ver workflow con estados y transiciones |
| `kameleon_workflows_list_work_item_types` | Listar tipos de work items (Task, Bug, Story, etc.) |
| `kameleon_workflows_list_methodologies` | Listar metodologias |

## Ejemplos de uso en Claude Code

```
# Listar tus proyectos
lista mis proyectos de kameleon

# Crear una tarea
crea una tarea "Implementar login con Google" en el proyecto Nemesis de tipo Task

# Ver mis tareas asignadas
que tareas tengo asignadas?

# Registrar tiempo
registra 2 horas de trabajo hoy en la tarea NEM-42

# Cambiar estado de una tarea
mueve la tarea NEM-42 a "In Progress"
```

## Estructura del proyecto

```
kameleon-mcp/
├── .mcp.json              # Configuracion del MCP server (editar con tus credenciales)
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts           # Entry point del MCP server
    ├── trpc-client.ts     # Cliente HTTP para la API tRPC
    └── tools/
        ├── auth.ts        # Tools de autenticacion
        ├── projects.ts    # Tools de proyectos
        ├── work-items.ts  # Tools de tareas/tickets
        ├── time-entries.ts # Tools de registro de tiempo
        └── workflows.ts   # Tools de workflows
```

## Troubleshooting

**El MCP no se conecta:**
- Verifica que corriste `npm install`
- Asegurate de que Node.js 18+ esta instalado (`node -v`)
- Revisa que el `.mcp.json` tenga la ruta correcta al `src/index.ts`

**Error de autenticacion:**
- Tu token de sesion puede haber expirado. Obtiene uno nuevo desde el browser o usa `kameleon_login`
- Verifica que el tenant slug sea correcto

**"Not found" errors:**
- Asegurate de que `KAMELEON_BASE_URL` sea `https://my.kameleonlabs.ai` (sin slash al final)
