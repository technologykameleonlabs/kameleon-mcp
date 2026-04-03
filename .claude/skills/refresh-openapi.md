# refresh-openapi

Re-fetchea el OpenAPI spec de Kameleon y lo guarda en `docs/openapi.json`.

## Pasos

### 1. Verificar que hay un session token disponible

Leer el token de `C:/Users/AllTech/Projects/KameleonAppMCP/.mcp.json`:
```bash
grep KAMELEON_SESSION_TOKEN .mcp.json
```

Si el archivo no existe o el token está vacío, pedir al usuario que use `kameleon_login` primero o que pegue su token de sesión.

### 2. Hacer el fetch del spec

```bash
curl -s \
  -H "Authorization: Bearer <TOKEN>" \
  https://my.kameleonlabs.ai/docs/openapi.json \
  -o docs/openapi.json
```

Si el curl falla (código HTTP no 200), informar que el token puede haber expirado.

### 3. Verificar que el spec es válido

```bash
node -e "const s = JSON.parse(require('fs').readFileSync('docs/openapi.json','utf8')); console.log('paths:', Object.keys(s.paths).length, '| version:', s.info.version)"
```

Reportar al usuario:
- Número de paths/endpoints en el spec
- Versión del spec (`info.version`)
- Fecha del fetch

### 4. Informar al usuario

Mostrar resumen y sugerir commitear si el spec cambió:
```bash
git diff --stat docs/openapi.json
```

## Notas
- El token de sesión expira. Si el fetch devuelve un HTML de login, el token está vencido.
- Para obtener un token nuevo: usar `kameleon_login` con email/password
- El archivo `docs/openapi.json` SÍ debe commitearse (es documentación, no credencial)
