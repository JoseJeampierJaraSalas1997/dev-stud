# Documentación — JHARVIS OS

Documentación pensada para que humanos **y agentes de IA** puedan construir sobre
el proyecto sin tener que reconstruir el contexto leyendo todo el código.

| Documento | Para qué sirve |
| --- | --- |
| [product/PRD.md](product/PRD.md) | Visión, usuarios, objetivos, alcance y roadmap |
| [architecture/overview.md](architecture/overview.md) | Capas, flujo de datos, invariantes, puntos de extensión |
| [architecture/adr/](architecture/adr/) | Decisiones de arquitectura (ADR) numeradas |
| [specs/data-contract.md](specs/data-contract.md) | Contrato HTTP/WS con el backend jharvis |
| [specs/command-center.md](specs/command-center.md) | Spec de la pantalla `/` |
| [specs/reactor-hud.md](specs/reactor-hud.md) | Spec de la pantalla `/hud` |
| [specs/backlog.md](specs/backlog.md) | Brechas conocidas y trabajo pendiente priorizado |
| [specs/_template.md](specs/_template.md) | Plantilla para nuevas specs |
| [design/design-system.md](design/design-system.md) | Tokens, tipografía, color semántico, movimiento, primitivas |
| [design/DESIGN.md](design/DESIGN.md) | Resumen compacto del sistema de diseño para generadores (Stitch, v0…) |
| [process/ai-workflow.md](process/ai-workflow.md) | Cómo trabajar con agentes: ciclo spec-driven, DoD, prompts |
| [process/testing.md](process/testing.md) | Estrategia y patrones de prueba |

Reglas de mantenimiento:

- La spec se actualiza **en el mismo PR** que cambia el comportamiento.
- `src/data/types.ts` manda sobre `data-contract.md`; si divergen, el doc está mal.
- Cada decisión que restrinja opciones futuras deja un ADR.
