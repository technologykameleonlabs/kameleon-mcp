# Kameleon MCP Server

MCP Server que conecta **Claude Code** con la plataforma **Kameleon**. Permite gestionar proyectos, tareas, tiempo, finanzas, contactos y más directamente desde tu asistente de IA.

**152 tools** · 13 dominios · publicado en [npm](https://www.npmjs.com/package/kameleon-mcp)

---

## Requisitos

- **Node.js** 18 o superior → https://nodejs.org
- **Claude Code** → https://claude.ai/code
- Una cuenta en **Kameleon Platform** → https://my.kameleonlabs.ai

---

## Instalación

No hay nada que clonar ni instalar. Solo creá el archivo `.mcp.json` en tu proyecto con la siguiente configuración:

```json
{
  "mcpServers": {
    "kameleon": {
      "command": "npx",
      "args": ["-y", "kameleon-mcp"],
      "env": {
        "KAMELEON_BASE_URL": "https://my.kameleonlabs.ai",
        "KAMELEON_SESSION_TOKEN": "<TU_SESSION_TOKEN>",
        "KAMELEON_TENANT_SLUG": "<TU_TENANT_SLUG>"
      }
    }
  }
}
```

Abrí Claude Code — el servidor se descarga y conecta automáticamente.

---

## Variables de entorno

| Variable | Descripción | Cómo obtenerla |
|---|---|---|
| `KAMELEON_BASE_URL` | URL base de la API | `https://my.kameleonlabs.ai` |
| `KAMELEON_SESSION_TOKEN` | Token de sesión | DevTools (F12) → Application → Cookies → `kameleon-session`, o dejalo vacío y usá `kameleon_login` desde Claude |
| `KAMELEON_TENANT_SLUG` | Slug de tu organización | El subdominio de tu cuenta. Si tu URL es `empresa.kameleonlabs.ai`, el slug es `empresa` |

---

## Verificar la instalación

Una vez abierto Claude Code, escribí:

```
verifica mi sesión de kameleon
```

Debería responder con tu nombre y email.

---

## Ejemplos de uso

```
lista mis proyectos
qué tareas tengo asignadas?
crea una tarea "Implementar login" en el proyecto Nemesis de tipo Task
registra 2 horas de trabajo hoy en la tarea NEM-42
mueve la tarea NEM-42 a "In Progress"
dame el resumen financiero del proyecto Sourtrack
```

---

## Tools disponibles (152 total)

| Dominio | Tools |
|---|---|
| Auth | 3 |
| Projects | 21 |
| Work Items | 34 |
| Time Entries | 13 |
| Workflows | 18 |
| Financials | 14 |
| Contacts | 20 |
| Membership | 5 |
| RBAC | 8 |
| Tenant | 4 |
| Audit | 2 |
| Profile | 3 |
| User Groups | 7 |

---

## Actualización

Las actualizaciones son automáticas — `npx` siempre descarga la última versión publicada. No necesitás hacer nada.

---

## Troubleshooting

**Las tools no aparecen:** Reiniciá Claude Code después de crear o editar el `.mcp.json`.

**Error "Unauthorized":** Tu token expiró. Sacá uno nuevo desde el browser o usá `kameleon_login` desde Claude.

**Error "Tenant not found":** Verificá que `KAMELEON_TENANT_SLUG` sea correcto.
