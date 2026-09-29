# Estrategia de pruebas

Stack: Vitest 4 + jsdom + Testing Library (`src/test/setup.ts` carga jest-dom).

## Pirámide

| Nivel | Qué | Ejemplo existente |
| --- | --- | --- |
| Unitario | Funciones puras (`walk`, `clampPct`, `cn`) | `mockSource.test.ts`, `cn.test.ts` |
| Fuente | Contrato `DataSource`: frames, subscribe/dispose, controles | `mockSource.test.ts` |
| Hooks | Selectores y re-render con fuente inyectada | `hooks.test.tsx` |
| Componente | Render + interacción con fuente falsa | `MeterBar.test.tsx` |
| Ruta | Pantalla completa monta sin errores | `routes.test.tsx` |
| Escena 3D | Builders construyen y liberan sin WebGL; runtime con renderer falso | `scenes.test.ts`, `sceneRuntime.test.ts` |
| E2E (pendiente) | Playwright sobre mock | `BL-09` |

## Patrones

**Fuente falsa para componentes**

```tsx
const source = { ...createMockSource({ intervalMs: 60_000 }), setMode: vi.fn() }
render(<JharvisProvider source={source}><TopBar /></JharvisProvider>)
await user.click(screen.getByRole('button', { name: 'SUPERVISED' }))
expect(source.setMode).toHaveBeenCalledWith('SUPERVISED')
```

**Adaptador jharvis:** `vi.stubGlobal('fetch', vi.fn())` y temporizadores falsos
(`vi.useFakeTimers()`) para poll y reconexión.

**Escenas:** pasa `createRenderer` falso a `mountScene` y `reducedMotion: true`
para un frame determinista.

## Reglas

- Un test por criterio de aceptación; nómbralo con su ID (`it('CC-05 …')`).
- Busca por rol/etiqueta accesible, no por clase CSS.
- Sin `Math.random` no controlado en aserciones: inyecta intervalos largos o mockea.
- Dispose siempre las fuentes creadas en el test.
