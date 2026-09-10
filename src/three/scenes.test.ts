import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { buildJharvisCore } from './jharvisCore'
import { buildArcReactor } from './arcReactor'

/**
 * These graphs are built without a renderer, so they can be exercised in
 * jsdom. The leak this guards against is real: the original Stitch scripts
 * dispose only some of their geometries and none of their materials.
 */
const BUILDERS = [
  ['jharvis core', buildJharvisCore],
  ['arc reactor', buildArcReactor],
] as const

describe.each(BUILDERS)('%s scene', (_name, build) => {
  it('disposes every geometry and material it created', () => {
    const scene = new THREE.Scene()
    const built = build(scene)

    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.geometry) geometries.add(mesh.geometry)
      if (mesh.material) {
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          materials.add(material)
        }
      }
    })

    expect(geometries.size).toBeGreaterThan(0)
    expect(materials.size).toBeGreaterThan(0)

    const disposed = new Set<unknown>()
    for (const resource of [...geometries, ...materials]) {
      resource.addEventListener('dispose', () => disposed.add(resource))
    }

    built.dispose()

    const leaked = [...geometries, ...materials].filter((resource) => !disposed.has(resource))
    expect(leaked).toHaveLength(0)
  })

  it('advances without throwing and tracks the pointer', () => {
    const scene = new THREE.Scene()
    const built = build(scene)

    expect(() => built.update(0, { x: 0, y: 0 })).not.toThrow()
    for (let frame = 1; frame < 120; frame += 1) {
      built.update(frame / 60, { x: 1, y: -1 })
    }

    // The group lerps toward the pointer target, so rotation must have moved.
    const group = scene.children.find((child) => child.type === 'Group')
    expect(group).toBeDefined()
    expect(Math.abs(group!.rotation.y)).toBeGreaterThan(0)

    built.dispose()
  })

  it('removes its objects from the scene on dispose', () => {
    const scene = new THREE.Scene()
    const built = build(scene)
    expect(scene.children.length).toBeGreaterThan(0)
    built.dispose()
    expect(scene.children).toHaveLength(0)
  })
})
