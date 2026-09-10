import * as THREE from 'three'
import type { SceneBuild } from './sceneRuntime'

/**
 * ANIMATION_12 — "JHARVIS Core 2040 Simulation", ported from the Stitch export.
 *
 * Geometry, radii, opacities and rotation rates are kept exactly as authored.
 * Light intensities are scaled up because three.js moved to physically based
 * lighting units after r155; the original r125 values would render near-black.
 */
export function buildJharvisCore(scene: THREE.Scene): SceneBuild {
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
  camera.position.z = 5.2

  const group = new THREE.Group()
  scene.add(group)

  const cyanLight = new THREE.PointLight(0x00f2fe, 45, 20)
  cyanLight.position.set(0, 0, 2)
  scene.add(cyanLight)

  const ambientLight = new THREE.AmbientLight(0x06182b, 2.4)
  scene.add(ambientLight)

  // 1. Central quantum nucleus
  const coreGeo = new THREE.IcosahedronGeometry(0.65, 3)
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x00e5ff,
    emissive: 0x005577,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
  })
  const coreMesh = new THREE.Mesh(coreGeo, coreMat)
  group.add(coreMesh)

  const innerGlowGeo = new THREE.SphereGeometry(0.38, 32, 32)
  const innerGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
  const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat)
  group.add(innerGlow)

  // 2. Orbital precision rings
  const ringGroup = new THREE.Group()
  group.add(ringGroup)

  const ringGeo1 = new THREE.RingGeometry(1.05, 1.09, 64)
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.45 })
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
  ringGroup.add(ring1)

  const ringGeo2 = new THREE.RingGeometry(1.4, 1.43, 64)
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x0088ff, wireframe: true, transparent: true, opacity: 0.5 })
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
  ringGroup.add(ring2)

  const ringGeo3 = new THREE.TorusGeometry(1.75, 0.018, 16, 90)
  const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.35 })
  const ring3 = new THREE.Mesh(ringGeo3, ringMat3)
  ringGroup.add(ring3)

  const ringGeo4 = new THREE.RingGeometry(2.1, 2.12, 80)
  const ringMat4 = new THREE.MeshBasicMaterial({
    color: 0x00a8ff,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  })
  const ring4 = new THREE.Mesh(ringGeo4, ringMat4)
  ringGroup.add(ring4)

  // 3. Orbital data particles
  const particleCount = 450
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i += 1) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    const r = 1.1 + Math.random() * 1.5
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.05,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  group.add(particles)

  const geometries = [coreGeo, innerGlowGeo, ringGeo1, ringGeo2, ringGeo3, ringGeo4, particleGeo]
  const materials = [coreMat, innerGlowMat, ringMat1, ringMat2, ringMat3, ringMat4, particleMat]

  return {
    camera,

    update(time, pointer) {
      const pulse = 1 + Math.sin(time * 3.2) * 0.06
      coreMesh.scale.setScalar(pulse)
      const glowPulse = 1 + Math.sin(time * 6) * 0.04
      innerGlow.scale.setScalar(glowPulse)

      ring1.rotation.z = time * 0.45
      ring2.rotation.z = -time * 0.35
      ring2.rotation.x = Math.sin(time * 0.4) * 0.4
      ring3.rotation.y = time * 0.25
      ring3.rotation.x = time * 0.2
      ring4.rotation.z = time * 0.15

      particles.rotation.y = time * 0.12
      particles.rotation.x = Math.sin(time * 0.1) * 0.1

      const targetRotY = pointer.x * 0.75
      const targetRotX = -pointer.y * 0.55
      group.rotation.y += (targetRotY - group.rotation.y) * 0.05
      group.rotation.x += (targetRotX - group.rotation.x) * 0.05
    },

    dispose() {
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      scene.remove(group, cyanLight, ambientLight)
    },
  }
}
