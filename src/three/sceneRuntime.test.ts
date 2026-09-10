import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { mountScene, type MinimalRenderer } from './sceneRuntime'
import { buildArcReactor } from './arcReactor'

function stubRenderer() {
  const canvas = document.createElement('canvas')
  const renderer: MinimalRenderer = {
    domElement: canvas,
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  }
  return renderer
}

function mountIn(reducedMotion: boolean) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const renderer = stubRenderer()
  const raf = vi.spyOn(globalThis, 'requestAnimationFrame')
  const runtime = mountScene(container, buildArcReactor, {
    createRenderer: () => renderer,
    reducedMotion,
  })
  return { container, renderer, raf, runtime }
}

describe('mountScene', () => {
  it('renders one static frame and starts no loop when motion is reduced', () => {
    const { renderer, raf, runtime, container } = mountIn(true)

    expect(renderer.render).toHaveBeenCalledTimes(1)
    expect(raf).not.toHaveBeenCalled()

    runtime.dispose()
    raf.mockRestore()
    container.remove()
  })

  it('drives an animation loop when motion is allowed', () => {
    const { raf, runtime, container } = mountIn(false)

    expect(raf).toHaveBeenCalled()

    runtime.dispose()
    raf.mockRestore()
    container.remove()
  })

  it('attaches the canvas and removes it again on dispose', () => {
    const { container, renderer, runtime, raf } = mountIn(true)

    expect(container.contains(renderer.domElement)).toBe(true)

    runtime.dispose()
    expect(container.contains(renderer.domElement)).toBe(false)
    expect(renderer.dispose).toHaveBeenCalled()

    raf.mockRestore()
    container.remove()
  })

  it('cancels the frame it scheduled so no loop survives unmount', () => {
    const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame')
    const { runtime, raf, container } = mountIn(false)

    runtime.dispose()
    expect(cancel).toHaveBeenCalled()

    cancel.mockRestore()
    raf.mockRestore()
    container.remove()
  })

  it('detaches its window listeners on dispose', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { runtime, raf, container } = mountIn(true)

    runtime.dispose()
    const removed = remove.mock.calls.map((call) => call[0])
    expect(removed).toContain('pointermove')
    expect(removed).toContain('touchmove')

    remove.mockRestore()
    raf.mockRestore()
    container.remove()
  })

  it('degrades to a no-op when no WebGL context can be created', () => {
    const container = document.createElement('div')
    const scene = new THREE.Scene()
    void scene
    const runtime = mountScene(container, buildArcReactor, {
      createRenderer: () => {
        throw new Error('no WebGL')
      },
    })

    expect(container.children).toHaveLength(0)
    expect(() => runtime.dispose()).not.toThrow()
  })
})
