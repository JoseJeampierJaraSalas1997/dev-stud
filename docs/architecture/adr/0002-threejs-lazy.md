# ADR-0002 — three.js en chunk diferido y runtime propio

- **Estado:** aceptado
- **Fecha:** 2026-09-02

## Contexto

three.js pesa ~600 kB. Las escenas de Stitch venían como scripts imperativos.
React Three Fiber añadiría otra dependencia y otra capa de abstracción para
dos escenas relativamente simples.

## Decisión

three.js puro. Las escenas son *builders* puros `(scene) => { camera, update,
dispose }` montados por `mountScene` vía `useThreeScene`. Los componentes que
las contienen se cargan con `React.lazy` y un `SceneFallback`.

## Consecuencias

- Positivas: la telemetría pinta antes que el 3D; builders testeables sin WebGL;
  control fino de pausa (viewport) y reduced-motion.
- Negativas: sin ecosistema declarativo de R3F; más código de ciclo de vida.
- Obliga a: toda escena nueva libera sus recursos en `dispose()` y se carga lazy.
