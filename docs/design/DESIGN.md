# DESIGN.md — Arc Telemetry HUD

Resumen compacto para generadores de UI (Stitch, v0, agentes). Para el detalle
ver `design-system.md`.

## Carácter
HUD táctico futurista, estilo terminal de Iron Man / JARVIS. Oscuro, denso,
preciso. Paneles con esquinas en corchete, reglas de 1 px, etiquetas en
MAYÚSCULAS con guiones bajos, datos en monoespaciada. Brillo cian sobre azul
noche. Nada de sombras suaves ni esquinas muy redondeadas en desktop.

## Colores
- Fondo: #0d141d · Superficies: #080f18, #151c26, #19202a, #242a34, #2e353f
- Texto: #dce3f0 · Texto secundario: #b9cacb · Contorno: #849495 / #3b494b
- Primario (acción, núcleo): #00f0ff · Texto primario: #dbfcff
- Ámbar (SOLO crítico/prioridad): #fbb400
- Éxito (estados OK): #00ffaa
- Error: #ffb4ab sobre #93000a

## Tipografía
- Titulares y cifras: Space Grotesk (48/28/22/18 px)
- Cuerpo y etiquetas: JetBrains Mono (15/13/11 px cuerpo; 12/10/9 px etiquetas, tracking amplio)

## Espaciado
- Desktop: rejilla de 4 px, gutters de 8 px, 12 columnas (3 · 6 · 3).
- Mobile: 390 px, márgenes 16–24 px, bloques apilados con 24 px de separación.

## Movimiento
Scanline en paneles vivos, radar al escuchar, flicker sutil, anillos lentos.
Respetar reduced-motion.

## Componentes
Panel con cabecera (título · id · estado), barras de medición, chips de estado,
puntos de estado, sparklines, espectro, botones tácticos, núcleo 3D central.
