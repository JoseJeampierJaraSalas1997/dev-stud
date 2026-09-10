import * as THREE from 'three'

export interface SceneBuild {
  camera: THREE.PerspectiveCamera
  /** Called once per frame. `pointer` components are in -1..1 container space. */
  update: (elapsed: number, pointer: { x: number; y: number }) => void
  /** Release every geometry and material this build created. */
  dispose: () => void
}

/**
 * Builds an object graph into a scene. Kept free of renderer and DOM concerns
 * so the graphs can be built and disposed in a test without WebGL.
 */
export type SceneBuilder = (scene: THREE.Scene) => SceneBuild

export interface SceneRuntime {
  dispose: () => void
}

/** The slice of WebGLRenderer the runtime actually drives. */
export interface MinimalRenderer {
  domElement: HTMLCanvasElement
  setSize: (width: number, height: number) => void
  setPixelRatio: (ratio: number) => void
  render: (scene: THREE.Scene, camera: THREE.Camera) => void
  dispose: () => void
}

export interface MountOptions {
  /** Injected in tests; defaults to a real WebGLRenderer. */
  createRenderer?: () => MinimalRenderer
  /** Overrides the media query; defaults to the live user preference. */
  reducedMotion?: boolean
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/**
 * Mount a scene builder into a container element.
 *
 * Beyond the original Stitch behaviour this adds two things a real page needs:
 * the loop stops while the canvas is scrolled out of view, and reduced-motion
 * users get a single static frame instead of a permanent animation.
 */
export function mountScene(
  container: HTMLElement,
  build: SceneBuilder,
  options: MountOptions = {},
): SceneRuntime {
  const scene = new THREE.Scene()

  let renderer: MinimalRenderer
  try {
    renderer = options.createRenderer
      ? options.createRenderer()
      : new THREE.WebGLRenderer({ alpha: true, antialias: true })
  } catch {
    // No WebGL (headless test, blocked context). The panel keeps its overlays.
    return { dispose: () => {} }
  }

  const built = build(scene)
  const { camera } = built

  const initialWidth = container.clientWidth || 800
  const initialHeight = container.clientHeight || 500

  renderer.setSize(initialWidth, initialHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  camera.aspect = initialWidth / initialHeight
  camera.updateProjectionMatrix()
  container.appendChild(renderer.domElement)

  const pointer = { x: 0, y: 0 }
  const clock = new THREE.Clock()
  let frameId: number | undefined
  let visible = true
  const reduced = options.reducedMotion ?? prefersReducedMotion()

  function onPointerMove(event: PointerEvent | TouchEvent) {
    const touch = 'touches' in event ? event.touches[0] : undefined
    const clientX = touch ? touch.clientX : (event as PointerEvent).clientX
    const clientY = touch ? touch.clientY : (event as PointerEvent).clientY
    const rect = container.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1)
  }

  function resize() {
    const width = container.clientWidth || initialWidth
    const height = container.clientHeight || initialHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    if (reduced || !visible) renderer.render(scene, camera)
  }

  function renderFrame() {
    built.update(clock.getElapsedTime(), pointer)
    renderer.render(scene, camera)
  }

  function loop() {
    frameId = requestAnimationFrame(loop)
    renderFrame()
  }

  function play() {
    if (frameId !== undefined || reduced) return
    frameId = requestAnimationFrame(loop)
  }

  function stop() {
    if (frameId === undefined) return
    cancelAnimationFrame(frameId)
    frameId = undefined
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('touchmove', onPointerMove, { passive: true })

  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : undefined
  resizeObserver?.observe(container)
  if (!resizeObserver) window.addEventListener('resize', resize)

  let intersectionObserver: IntersectionObserver | undefined
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting)
        if (visible) play()
        else stop()
      },
      { threshold: 0.01 },
    )
    intersectionObserver.observe(container)
  }

  if (reduced) renderFrame()
  else play()

  return {
    dispose() {
      stop()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('resize', resize)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      built.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
