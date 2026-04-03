# Kameleon MCP Server

MCP Server para conectar **Claude Code** con la plataforma **Kameleon**. Permite gestionar proyectos, tareas, tiempo, finanzas, contactos y más directamente desde tu terminal con Claude.

**152 tools** en 13 dominios.

---

## Requisitos

- **Node.js** 18 o superior → https://nodejs.org
- **Claude Code** instalado → https://claude.ai/code
- Una cuenta en **Kameleon Platform** → https://my.kameleonlabs.ai

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/leokameleon/KameleonAppMCP.git kameleon-mcp
cd kameleon-mcp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar credenciales

Crear el archivo `.mcp.json` en la raíz del proyecto:

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

| Variable | Cómo obtenerla |
|---|---|
| `KAMELEON_SESSION_TOKEN` | Opción A: DevTools (F12) → Application → Cookies → `kameleon-session` · Opción B: dejarlo vacío y usar `kameleon_login` desde Claude |
| `KAMELEON_TENANT_SLUG` | El subdominio de tu organización. Si tu URL es `empresa.kameleonlabs.ai`, el slug es `empresa` |

### 4. Iniciar Claude Code

```bash
claude
```

Claude Code detectará automáticamente el `.mcp.json` y cargará el servidor.

### 5. Verificar

Escribí en Claude:
```
verifica mi sesión de kameleon
```

Debería responder con tu nombre y email. ¡Listo!

---

## Ejemplos de uso

```
lista mis proyectos de kameleon
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

Ver la lista completa en [mcp_share/README.md](mcp_share/README.md).

---

## Troubleshooting

**El MCP no se conecta:** Verificá que corriste `npm install` y que el archivo `.mcp.json` existe en la raíz.

**Error "Unauthorized":** Tu token expiró. Sacá uno nuevo desde el browser o usá `kameleon_login` desde Claude.

**Error "Tenant not found":** Verificá que `KAMELEON_TENANT_SLUG` sea correcto (el subdominio de tu organización).

**Las tools no aparecen:** Reiniciá Claude Code después de crear/editar el `.mcp.json`.
