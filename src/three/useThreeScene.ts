import { useEffect, useRef } from 'react'
import { mountScene, type SceneBuilder } from './sceneRuntime'

/**
 * Attach the returned ref to a sized element; the scene lives and dies with it.
 * The builder is held in a ref, synced in an effect rather than during render,
 * so an inline arrow does not tear the scene down on every parent render.
 */
export function useThreeScene(build: SceneBuilder) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buildRef = useRef(build)

  useEffect(() => {
    buildRef.current = build
  }, [build])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const runtime = mountScene(container, buildRef.current)
    return () => runtime.dispose()
  }, [])

  return containerRef
}
