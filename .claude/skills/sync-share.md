# sync-share

Sincroniza `src/` → `mcp_share/src/` para mantener el paquete distribuible actualizado.

## Pasos

1. Ejecutar `npm run sync` desde la raíz del proyecto:
   ```bash
   cd C:/Users/AllTech/Projects/KameleonAppMCP && npm run sync
   ```

2. Revisar el output del script:
   - Verificar que dice "Sync complete!"
   - Verificar que el conteo de tools es correcto (debe ser ~152)
   - Si hay errores de seguridad (token real, path absoluto), corregirlos antes de continuar

3. Verificar que `mcp_share/src/index.ts` tiene las 13 imports y la version correcta:
   ```bash
   head -20 mcp_share/src/index.ts
   ```

4. Mostrar el diff de los cambios (NO hacer commit automático — el usuario debe revisarlos):
   ```bash
   git diff --stat mcp_share/
   ```

5. Informar al usuario qué cambió y pedirle que revise antes de commitear.

## Notas
- Este comando NUNCA hace commit automático — solo sincroniza archivos
- Si el script falla con error de seguridad, revisar `mcp_share/.mcp.json`
- Después de sync exitoso, el usuario puede correr `npm run build` desde `mcp_share/` para verificar que compila
