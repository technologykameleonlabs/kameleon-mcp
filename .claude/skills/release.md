# release

Guía el proceso completo de release: build → sync → version bump → tag → push.

## Pasos

### 1. Verificar que el build compila
```bash
cd C:/Users/AllTech/Projects/KameleonAppMCP && npm run build
```
Si hay errores de TypeScript, detener y corregirlos primero.

### 2. Sincronizar mcp_share
```bash
npm run sync
```
Verificar que el output es exitoso.

### 3. Preguntar al usuario el tipo de bump
Mostrar las opciones:
- `patch` (x.x.N) → bug fix en behavior de tool existente
- `minor` (x.N.0) → nueva funcionalidad, backward compatible
- `major` (N.0.0) → breaking change (renombrar tools, cambiar schemas)

Leer la versión actual de `package.json` y calcular la nueva.

### 4. Actualizar versiones en los 3 archivos

**package.json** (raíz):
```json
"version": "X.X.X"
```

**mcp_share/package.json**:
```json
"version": "X.X.X"
```

**src/index.ts** — ya queda sincronizado después del `npm run sync` si se ejecutó en paso 2.

### 5. Re-ejecutar sync para propagar la nueva version a mcp_share
```bash
npm run sync
```

### 6. Commit con mensaje convencional
```bash
git add -A
git commit -m "chore: release vX.X.X"
```

### 7. Tag semántico
```bash
git tag vX.X.X
```

### 8. Preguntar si push
Preguntar: "¿Quieres hacer push a origin y crear un GitHub Release?"
- Si sí: `git push origin master && git push origin vX.X.X`
- Si no: informar que los cambios están solo local

## Notas
- Siempre ejecutar `npm run build` antes de crear el tag
- Si el build falla, NO crear el tag
- El mensaje de commit debe incluir la versión exacta
