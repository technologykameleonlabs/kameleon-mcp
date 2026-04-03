# Kameleon MCP Server

MCP Server para conectar **Claude Code** con la plataforma **Kameleon**. Permite gestionar proyectos, tareas, tiempo, finanzas, contactos y mas directamente desde tu terminal con Claude.

**152 tools** en 13 dominios.

---

## Requisitos

- **Node.js** 18 o superior → https://nodejs.org
- **Claude Code** instalado → `npm install -g @anthropic-ai/claude-code`
- Una cuenta en **Kameleon Platform** → https://my.kameleonlabs.ai

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/leokameleon/KameleonAppMCP.git kameleon-mcp
cd kameleon-mcp
```

> **Windows:**
> ```powershell
> git clone https://github.com/leokameleon/KameleonAppMCP.git kameleon-mcp
> cd kameleon-mcp
> ```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar credenciales

Crea un archivo `.mcp.json` en la raiz del proyecto copiando la plantilla:

```bash
# Linux / macOS
cp mcp_share/.mcp.json .mcp.json

# Windows
copy mcp_share\.mcp.json .mcp.json
```

Edita `.mcp.json` y reemplaza los valores:

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

| Variable | Como obtenerla | Ejemplo |
|---|---|---|
| `KAMELEON_SESSION_TOKEN` | Ver seccion abajo | `ab6b5d59...` (token largo) |
| `KAMELEON_TENANT_SLUG` | El subdominio de tu organizacion | Si tu URL es `miempresa.kameleonlabs.ai`, el slug es `miempresa` |
| `KAMELEON_BASE_URL` | Siempre este valor | `https://my.kameleonlabs.ai` |

### Obtener el Session Token

**Opcion A — Desde el browser (recomendado):**
1. Abre https://my.kameleonlabs.ai e inicia sesion
2. Abre DevTools (F12 en Windows/Linux, Cmd+Option+I en Mac)
3. Ve a **Application** → **Cookies** → `https://my.kameleonlabs.ai`
4. Busca la cookie `kameleon-session` y copia su valor

**Opcion B — Desde Claude Code:**
Deja `KAMELEON_SESSION_TOKEN` vacio en `.mcp.json` e inicia sesion desde Claude:
```
inicia sesion en kameleon con tu-email@empresa.com
```
Claude usara la tool `kameleon_login` para autenticarte y guardar el token.

> **Nota:** El token de sesion expira periodicamente. Si ves errores de autenticacion, renuevalo con cualquiera de los dos metodos.

### 4. Iniciar Claude Code desde la carpeta del proyecto

```bash
claude
```

Claude Code detectara automaticamente el `.mcp.json` y cargara el MCP server de Kameleon.

### 5. Verificar que funciona

Dentro de Claude Code, escribe:

```
verifica mi sesion de kameleon
```

Deberia responder con tu nombre y email. Listo!

---

## Ejemplos de uso

```
# Listar proyectos
lista mis proyectos de kameleon

# Ver mis tareas asignadas
que tareas tengo asignadas?

# Crear una tarea
crea una tarea "Implementar login con Google" en el proyecto Nemesis de tipo Task

# Registrar tiempo
registra 2 horas de trabajo hoy en la tarea NEM-42

# Cambiar estado de una tarea
mueve la tarea NEM-42 a "In Progress"

# Ver resumen financiero
dame el resumen financiero del proyecto Sourtrack

# Buscar un contacto
busca el contacto con email ejemplo@empresa.com

# Ver time entries pendientes de aprobacion
muéstrame los time entries pendientes de aprobacion

# Ver mi perfil
muéstrame mi perfil de Kameleon
```

---

## Tools disponibles (152 total)

### Auth (3)
| Tool | Descripcion |
|---|---|
| `kameleon_login` | Autenticarse con email/password |
| `kameleon_get_current_user` | Ver usuario actual con memberships |
| `kameleon_check_session` | Verificar si la sesion es valida |

### Projects (21)
| Tool | Descripcion |
|---|---|
| `kameleon_projects_list` | Listar proyectos |
| `kameleon_projects_get` | Obtener un proyecto por ID |
| `kameleon_projects_create` | Crear un proyecto |
| `kameleon_projects_update` | Actualizar un proyecto |
| `kameleon_projects_archive` | Archivar un proyecto |
| `kameleon_projects_restore` | Restaurar un proyecto archivado |
| `kameleon_projects_delete` | Eliminar un proyecto |
| `kameleon_projects_duplicate` | Duplicar un proyecto |
| `kameleon_projects_toggle_pin` | Fijar/desfijar un proyecto |
| `kameleon_projects_change_color` | Cambiar el color del proyecto |
| `kameleon_projects_get_stats` | Obtener estadisticas del proyecto |
| `kameleon_projects_list_members` | Listar miembros de un proyecto |
| `kameleon_projects_add_member` | Agregar miembro a un proyecto |
| `kameleon_projects_remove_member` | Remover miembro de un proyecto |
| `kameleon_projects_list_containers` | Listar contenedores (sprints, fases) |
| `kameleon_projects_create_container` | Crear contenedor |
| `kameleon_projects_update_container` | Actualizar contenedor |
| `kameleon_projects_close_container` | Cerrar contenedor |
| `kameleon_projects_delete_container` | Eliminar contenedor |
| `kameleon_projects_reorder_containers` | Reordenar contenedores |
| `kameleon_projects_get_container_tree` | Ver arbol jerarquico de contenedores |

### Work Items (34)
| Tool | Descripcion |
|---|---|
| `kameleon_work_items_create` | Crear tarea/ticket/bug |
| `kameleon_work_items_list` | Listar work items con filtros |
| `kameleon_work_items_get` | Obtener work item por ID |
| `kameleon_work_items_get_by_key` | Obtener por clave (ej: `NEM-42`) |
| `kameleon_work_items_my_assigned` | Mis tareas asignadas |
| `kameleon_work_items_search` | Buscar work items por titulo/clave |
| `kameleon_work_items_update` | Actualizar un work item |
| `kameleon_work_items_transition` | Cambiar estado de workflow |
| `kameleon_work_items_archive` | Archivar work item |
| `kameleon_work_items_restore` | Restaurar work item archivado |
| `kameleon_work_items_delete` | Eliminar work item |
| `kameleon_work_items_get_workflow_config` | Ver configuracion de workflow del proyecto |
| `kameleon_work_items_add_task` | Agregar subtarea |
| `kameleon_work_items_toggle_task` | Marcar/desmarcar subtarea |
| `kameleon_work_items_list_tasks` | Listar subtareas |
| `kameleon_work_items_remove_task` | Eliminar subtarea |
| `kameleon_work_items_list_comments` | Listar comentarios |
| `kameleon_work_items_add_comment` | Agregar comentario |
| `kameleon_work_items_delete_comment` | Eliminar comentario |
| `kameleon_work_items_add_link` | Crear dependencia entre work items |
| `kameleon_work_items_list_links` | Listar dependencias |
| `kameleon_work_items_remove_link` | Eliminar dependencia |
| `kameleon_work_items_watch` | Suscribirse a notificaciones de un work item |
| `kameleon_work_items_unwatch` | Cancelar suscripcion |
| `kameleon_work_items_add_watcher` | Agregar watcher a un work item |
| `kameleon_work_items_list_watchers` | Listar watchers |
| `kameleon_work_items_remove_watcher` | Remover watcher |
| `kameleon_work_items_list_attachments` | Listar adjuntos |
| `kameleon_work_items_add_attachment` | Agregar adjunto (por URL) |
| `kameleon_work_items_delete_attachment` | Eliminar adjunto |
| `kameleon_work_items_add_financial` | Asociar entrada financiera a work item |
| `kameleon_work_items_list_financials` | Listar entradas financieras del work item |
| `kameleon_work_items_delete_financial` | Desvincular entrada financiera |
| `kameleon_work_items_get_financial_summary` | Resumen financiero del work item |

### Time Entries (13)
| Tool | Descripcion |
|---|---|
| `kameleon_time_entries_create` | Registrar tiempo |
| `kameleon_time_entries_list` | Listar entradas de tiempo con filtros |
| `kameleon_time_entries_get` | Obtener una entrada de tiempo por ID |
| `kameleon_time_entries_my_entries` | Mis entradas de tiempo |
| `kameleon_time_entries_update` | Actualizar entrada de tiempo |
| `kameleon_time_entries_delete` | Eliminar entrada de tiempo |
| `kameleon_time_entries_submit` | Enviar para aprobacion |
| `kameleon_time_entries_approve` | Aprobar entradas de tiempo |
| `kameleon_time_entries_reject` | Rechazar entradas de tiempo |
| `kameleon_time_entries_resubmit` | Reenviar entradas rechazadas |
| `kameleon_time_entries_pending_approval` | Ver entradas pendientes de aprobacion |
| `kameleon_time_entries_project_summary` | Resumen de tiempo por proyecto |
| `kameleon_time_entries_export` | Exportar entradas de tiempo |

### Workflows (18)
| Tool | Descripcion |
|---|---|
| `kameleon_workflows_list` | Listar workflows |
| `kameleon_workflows_get` | Ver workflow con estados y transiciones |
| `kameleon_workflows_create` | Crear workflow |
| `kameleon_workflows_update` | Actualizar workflow |
| `kameleon_workflows_delete` | Eliminar workflow |
| `kameleon_workflows_duplicate` | Duplicar workflow |
| `kameleon_workflows_add_state` | Agregar estado al workflow |
| `kameleon_workflows_update_state` | Actualizar estado |
| `kameleon_workflows_delete_state` | Eliminar estado |
| `kameleon_workflows_reorder_states` | Reordenar estados |
| `kameleon_workflows_add_transition` | Agregar transicion entre estados |
| `kameleon_workflows_delete_transition` | Eliminar transicion |
| `kameleon_workflows_generate_all_transitions` | Generar todas las transiciones posibles |
| `kameleon_workflows_list_work_item_types` | Listar tipos de work items (Task, Bug, Story, etc.) |
| `kameleon_workflows_create_work_item_type` | Crear tipo de work item |
| `kameleon_workflows_list_methodologies` | Listar metodologias (Kanban, Scrum, etc.) |
| `kameleon_workflows_get_methodology` | Obtener metodologia por ID |
| `kameleon_workflows_duplicate_methodology` | Duplicar metodologia |

### Financials (14)
| Tool | Descripcion |
|---|---|
| `kameleon_financials_create_entry` | Crear entrada financiera |
| `kameleon_financials_list_entries` | Listar entradas financieras con filtros |
| `kameleon_financials_get_entry` | Obtener entrada financiera por ID |
| `kameleon_financials_update_entry` | Actualizar entrada financiera |
| `kameleon_financials_approve_entry` | Aprobar entrada financiera |
| `kameleon_financials_mark_paid` | Marcar entrada como pagada |
| `kameleon_financials_delete_entry` | Eliminar entrada financiera |
| `kameleon_financials_create_category` | Crear categoria financiera |
| `kameleon_financials_list_categories` | Listar categorias financieras |
| `kameleon_financials_update_category` | Actualizar categoria |
| `kameleon_financials_deactivate_category` | Desactivar categoria |
| `kameleon_financials_project_summary` | Resumen financiero por proyecto |
| `kameleon_financials_by_category` | Resumen financiero por categoria |
| `kameleon_financials_by_month` | Resumen financiero por mes |

### Contacts (20)
| Tool | Descripcion |
|---|---|
| `kameleon_contacts_create` | Crear contacto |
| `kameleon_contacts_list` | Listar contactos con filtros |
| `kameleon_contacts_get` | Obtener contacto por ID |
| `kameleon_contacts_update` | Actualizar contacto |
| `kameleon_contacts_archive` | Archivar contacto |
| `kameleon_contacts_restore` | Restaurar contacto archivado |
| `kameleon_contacts_delete` | Eliminar contacto |
| `kameleon_contacts_tags_create` | Crear tag para contactos |
| `kameleon_contacts_tags_list` | Listar tags disponibles |
| `kameleon_contacts_tags_update` | Actualizar tag |
| `kameleon_contacts_tags_delete` | Eliminar tag |
| `kameleon_contacts_tags_assign` | Asignar tag a contacto |
| `kameleon_contacts_tags_remove` | Remover tag de contacto |
| `kameleon_contacts_addresses_add` | Agregar direccion a contacto |
| `kameleon_contacts_addresses_update` | Actualizar direccion |
| `kameleon_contacts_addresses_delete` | Eliminar direccion |
| `kameleon_contacts_notes_add` | Agregar nota a contacto |
| `kameleon_contacts_notes_list` | Listar notas del contacto |
| `kameleon_contacts_notes_update` | Actualizar nota |
| `kameleon_contacts_notes_delete` | Eliminar nota |

### Membership (5)
| Tool | Descripcion |
|---|---|
| `kameleon_membership_invite` | Invitar usuario a la organizacion |
| `kameleon_membership_list` | Listar miembros de la organizacion |
| `kameleon_membership_update_status` | Activar/desactivar miembro |
| `kameleon_membership_assign_role` | Asignar rol a miembro |
| `kameleon_membership_set_password` | Establecer contrasena de miembro |

### RBAC — Roles y Permisos (8)
| Tool | Descripcion |
|---|---|
| `kameleon_rbac_create_role` | Crear rol personalizado |
| `kameleon_rbac_list_roles` | Listar roles disponibles |
| `kameleon_rbac_get_role` | Obtener rol por ID |
| `kameleon_rbac_update_role` | Actualizar rol |
| `kameleon_rbac_delete_role` | Eliminar rol |
| `kameleon_rbac_assign_permissions` | Asignar permisos a un rol |
| `kameleon_rbac_list_permissions` | Listar todos los permisos disponibles |
| `kameleon_rbac_get_my_permissions` | Ver mis permisos actuales |

### Tenant (4)
| Tool | Descripcion |
|---|---|
| `kameleon_tenant_get_current` | Obtener informacion del tenant actual |
| `kameleon_tenant_list_my_tenants` | Listar tenants a los que pertenezco |
| `kameleon_tenant_update_info` | Actualizar informacion del tenant |
| `kameleon_tenant_check_availability` | Verificar disponibilidad de un slug |

### Audit (2)
| Tool | Descripcion |
|---|---|
| `kameleon_audit_list` | Listar eventos de auditoria con filtros |
| `kameleon_audit_get` | Obtener evento de auditoria por ID |

### Profile (3)
| Tool | Descripcion |
|---|---|
| `kameleon_profile_get` | Ver mi perfil |
| `kameleon_profile_update` | Actualizar mi perfil |
| `kameleon_profile_change_password` | Cambiar mi contrasena |

### User Groups (7)
| Tool | Descripcion |
|---|---|
| `kameleon_user_groups_list` | Listar grupos de usuarios |
| `kameleon_user_groups_create` | Crear grupo |
| `kameleon_user_groups_update` | Actualizar grupo |
| `kameleon_user_groups_delete` | Eliminar grupo |
| `kameleon_user_groups_list_members` | Listar miembros del grupo |
| `kameleon_user_groups_add_member` | Agregar miembro al grupo |
| `kameleon_user_groups_remove_member` | Remover miembro del grupo |

---

## Estructura del proyecto

```
kameleon-mcp/
├── .mcp.json              # Tu configuracion con credenciales (NO commitear)
├── mcp_share/
│   └── .mcp.json          # Plantilla sin credenciales (referencia)
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts           # Entry point del MCP server
    ├── trpc-client.ts     # Cliente HTTP para la API tRPC
    └── tools/
        ├── auth.ts        # Autenticacion (3 tools)
        ├── projects.ts    # Proyectos (21 tools)
        ├── work-items.ts  # Tareas/tickets (34 tools)
        ├── time-entries.ts # Tiempo (13 tools)
        ├── workflows.ts   # Workflows (18 tools)
        ├── financials.ts  # Finanzas (14 tools)
        ├── contacts.ts    # Contactos (20 tools)
        ├── membership.ts  # Membresias (5 tools)
        ├── rbac.ts        # Roles y permisos (8 tools)
        ├── tenant.ts      # Tenant (4 tools)
        ├── audit.ts       # Auditoria (2 tools)
        ├── profile.ts     # Perfil (3 tools)
        └── user-groups.ts # Grupos de usuarios (7 tools)
```

---

## Troubleshooting

**El MCP no se conecta en Claude Code:**
- Verifica que corriste `npm install` en la carpeta del proyecto
- Asegurate de tener Node.js 18+ instalado: `node -v`
- Verifica que el archivo `.mcp.json` exista en la raiz (no dentro de `mcp_share/`)
- Asegurate de lanzar `claude` desde la carpeta raiz del proyecto

**Error "Unauthorized" o "Invalid session":**
- Tu token de sesion expiro. Renovalo:
  - **Opcion A:** Saca un nuevo token del browser (DevTools → Cookies → `kameleon-session`)
  - **Opcion B:** Usa `kameleon_login` desde Claude: `inicia sesion en kameleon`
- Verifica que el token en `.mcp.json` no tiene espacios ni saltos de linea

**Error "Tenant not found":**
- Verifica que `KAMELEON_TENANT_SLUG` sea correcto
- El slug es el subdominio: si tu URL es `empresa.kameleonlabs.ai`, el slug es `empresa`

**"Not found" en operaciones:**
- Verifica que `KAMELEON_BASE_URL` sea exactamente `https://my.kameleonlabs.ai` (sin slash al final)

**Las tools no aparecen en Claude:**
- Reinicia Claude Code despues de editar `.mcp.json`
- Verifica que no haya errores de JSON en `.mcp.json`: https://jsonlint.com

**El MCP se conecta pero devuelve errores raros:**
- Puede ser que el token sea de otro tenant. Verifica que el `KAMELEON_TENANT_SLUG` coincide con el tenant del token.
