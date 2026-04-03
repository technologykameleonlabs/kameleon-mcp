# validate-tools

Verifica que las tools existentes usan parámetros y procedure names correctos según el OpenAPI spec.
OBJETIVO: estabilidad, NO identificar gaps de cobertura.

## Pasos

### 1. Listar todas las tools registradas

Para cada archivo en `src/tools/*.ts`, extraer los nombres de tools:
```bash
grep -n '"kameleon_' src/tools/*.ts | grep 'server\.tool' -A1
```

O más directo:
```bash
grep -h '"kameleon_[a-z_]*"' src/tools/*.ts | grep -o '"kameleon_[a-z_]*"' | sort
```

Generar una tabla por dominio con conteo.

### 2. Verificar procedure names contra el spec

Para cada tool, verificar que el tRPC procedure que llama (`trpcQuery("xyz.abc")` o `trpcMutation("xyz.abc")`) existe en `docs/openapi.json`.

Leer el spec:
```bash
node -e "
const spec = JSON.parse(require('fs').readFileSync('docs/openapi.json','utf8'));
const paths = Object.keys(spec.paths);
console.log(paths.slice(0, 20).join('\n'));
"
```

Comparar con los procedures usados en `src/tools/*.ts`:
```bash
grep -h 'trpc\(Query\|Mutation\)(' src/tools/*.ts | grep -o '"[a-z.]*"' | sort | uniq
```

### 3. Verificar parámetros Zod vs spec

Para las tools más críticas (work-items, projects, time-entries), revisar manualmente que:
- Los campos requeridos en el spec estén marcados como `.required` o no `.optional()` en Zod
- Los tipos coincidan (string, number, boolean, uuid)
- Los campos opcionales tengan `.optional()` en el schema Zod

### 4. Reportar discrepancias

Output esperado por dominio:
```
✅ auth (3 tools) — OK
✅ projects (21 tools) — OK
⚠️ work-items (34 tools) — revisar: kameleon_work_items_update usa campo "status" que no existe en spec
❌ time-entries (13 tools) — error: procedure "timeEntries.submitAll" no existe en API
```

### 5. Routers ignorados intencionalmente

No reportar ausencia de tools para estos routers (out-of-scope):
- `superadmin`, `billing`, `adminBilling`, `oauth`, `backup`, `jobs`
- `health`, `modules`, `mfa`, `passwordReset`, `masterdata`

## Notas
- El objetivo es verificar correctitud, NO ampliar cobertura
- Las discrepancias deben documentarse como issues en GitHub para follow-up
- Si un procedure no existe en el spec pero la tool funciona en práctica, puede ser que el spec esté desactualizado → ejecutar `/refresh-openapi` primero
