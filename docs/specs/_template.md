# Spec — <Título>

| Campo | Valor |
| --- | --- |
| Estado | borrador \| aprobado \| implementado |
| ID | <PREFIJO>-xx (p. ej. BL-01) |
| Autor | |
| Fecha | AAAA-MM-DD |
| Relacionado | PRD §…, ADR-…, backlog BL-… |

## 1. Contexto

Por qué existe esto. Qué problema del operador o del sistema resuelve. Enlaza
el código actual relevante con rutas (`src/...:línea`).

## 2. Objetivo

Una frase: qué cambia para el usuario cuando esto está hecho.

## 3. Fuera de alcance

Lo que explícitamente no se hace (evita que el agente se expanda).

## 4. Requisitos

| ID | Requisito | Tipo |
| --- | --- | --- |
| R1 | | funcional / no funcional |

## 5. Diseño

- Datos: ¿toca `types.ts`? ¿contrato con backend? (actualiza `data-contract.md`)
- UI: componentes afectados, tokens usados, estados (connecting/live/error, vacío, sin WebGL).
- Controles: ¿nuevo método en `DataSource`? ¿implementado en mock y jharvis?

## 6. Criterios de aceptación

Formato Dado / Cuando / Entonces, cada uno verificable por un test.

- **AC-1** Dado …, cuando …, entonces …

## 7. Plan de pruebas

| AC | Tipo de test | Archivo |
| --- | --- | --- |
| AC-1 | unitario / componente / escena | `src/.../X.test.tsx` |

## 8. Riesgos y preguntas abiertas

- 
