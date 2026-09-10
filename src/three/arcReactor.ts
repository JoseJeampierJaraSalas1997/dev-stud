import * as THREE from 'three'
import type { SceneBuild } from './sceneRuntime'

/**
 * ANIMATION_2 — "Arc Reactor 3D Hologram", ported from the Stitch export.
 *
 * As with the core scene, geometry and motion are unchanged and only the light
 * intensities are rescaled for three.js's physically based lighting.
 */
export function buildArcReactor(scene: THREE.Scene): SceneBuild {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
  camera.position.z = 4.8

  const ambientLight = new THREE.AmbientLight(0x00f0ff, 1.6)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x00f0ff, 60, 20)
  pointLight.position.set(0, 0, 2)
  scene.add(pointLight)

  const amberLight = new THREE.PointLight(0xffb703, 34, 15)
  amberLight.position.set(0, 0, -2)
  scene.add(amberLight)

  const group = new THREE.Group()
  scene.add(group)

  // 1. Central glowing core
  const coreGeo = new THREE.SphereGeometry(0.55, 32, 32)
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x00a8ff,
    emissiveIntensity: 0.9,
    shininess: 100,
    wireframe: true,
  })
  const coreMesh = new THREE.Mesh(coreGeo, coreMat)
  group.add(coreMesh)

  const innerCoreGeo = new THREE.SphereGeometry(0.35, 16, 16)
  const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat)
  group.add(innerCore)

  // 2. Segmented concentric tech rings
  const ring1Geo = new THREE.TorusGeometry(1.0, 0.04, 16, 60)
  const ring1Mat = new THREE.MeshPhongMaterial({ color: 0x00f0ff, emissive: 0x0077b6, shininess: 90 })
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
  group.add(ring1)

  const ring2Geo = new THREE.TorusGeometry(1.35, 0.05, 16, 80)
  const ring2Mat = new THREE.MeshPhongMaterial({ color: 0xffb703, emissive: 0xd48b00, shininess: 100 })
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
  group.add(ring2)

  const ring3Geo = new THREE.TorusGeometry(1.7, 0.03, 16, 100)
  const ring3Mat = new THREE.MeshPhongMaterial({ color: 0x00f0ff, wireframe: true })
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat)
  group.add(ring3)

  // 3. Radial magnetic coils
  const coilCount = 10
  const coilGroup = new THREE.Group()
  const coilGeo = new THREE.BoxGeometry(0.14, 0.3, 0.18)
  const coilMat = new THREE.MeshPhongMaterial({ color: 0x1a2b3c, emissive: 0x00f0ff, emissiveIntensity: 0.4 })
  for (let i = 0; i < coilCount; i += 1) {
    const angle = (i / coilCount) * Math.PI * 2
    const coil = new THREE.Mesh(coilGeo, coilMat)
    coil.position.x = Math.cos(angle) * 1.15
    coil.position.y = Math.sin(angle) * 1.15
    coil.rotation.z = angle + Math.PI / 2
    coilGroup.add(coil)
  }
  group.add(coilGroup)

  // 4. Holographic particle cloud
  const particleCount = 280
  const particlesGeo = new THREE.BufferGeometry()
  const particlePos = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount * 3; i += 3) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    const r = 1.6 + Math.random() * 0.9
    particlePos[i] = r * Math.sin(phi) * Math.cos(theta)
    particlePos[i + 1] = r * Math.sin(phi) * Math.sin(theta)
    particlePos[i + 2] = r * Math.cos(phi)
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.045, transparent: true, opacity: 0.8 })
  const particleSystem = new THREE.Points(particlesGeo, particlesMat)
  group.add(particleSystem)

  const geometries = [coreGeo, innerCoreGeo, ring1Geo, ring2Geo, ring3Geo, coilGeo, particlesGeo]
  const materials = [coreMat, innerCoreMat, ring1Mat, ring2Mat, ring3Mat, coilMat, particlesMat]

  return {
    camera,

    update(time, pointer) {
      const pulse = 1 + Math.sin(time * 4) * 0.08
      coreMesh.scale.setScalar(pulse)
      innerCore.scale.setScalar(1)

      ring1.rotation.z = time * 0.8
      ring2.rotation.z = -time * 0.5
      ring2.rotation.x = Math.sin(time * 0.5) * 0.35
      ring3.rotation.z = time * 0.3
      ring3.rotation.y = Math.cos(time * 0.4) * 0.4
      coilGroup.rotation.z = time * 0.4

      particleSystem.rotation.y = time * 0.15
      particleSystem.rotation.x = time * 0.08

      const targetRotY = pointer.x * 0.8
      const targetRotX = -pointer.y * 0.6
      group.rotation.y += (targetRotY - group.rotation.y) * 0.05
      group.rotation.x += (targetRotX - group.rotation.x) * 0.05
    },

    dispose() {
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      scene.remove(group, ambientLight, pointLight, amberLight)
    },
  }
}
