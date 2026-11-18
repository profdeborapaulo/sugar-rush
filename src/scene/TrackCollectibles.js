import * as THREE from 'three';

/**
 * Creates glowing Sugar Rush Star-Candy / Lemon-Strawberry Crystal collectibles
 * randomly scattered along the 3D coaster track (+50 points and +25% nitro each).
 */
export function createTrackCollectibles(splineData, physics) {
  const group = new THREE.Group();
  group.name = 'TrackCollectiblesGroup';

  const totalLength = physics.totalLength || splineData.total_length_m || 3.6074;
  const startFinishArc = physics.startFinishArc ?? 0.0;
  const itemCount = 20;
  const respawnDuration = 10.0;
  const pickupRadius = 0.0078;
  const pickupRadiusSq = pickupRadius * pickupRadius;

  // Shared procedural pastel pink-mint floor glow texture
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 64;
  glowCanvas.height = 64;
  const gCtx = glowCanvas.getContext('2d');
  const grad = gCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0.0, 'rgba(255, 236, 130, 0.96)');
  grad.addColorStop(0.38, 'rgba(255, 85, 175, 0.60)');
  grad.addColorStop(0.75, 'rgba(110, 245, 200, 0.22)');
  grad.addColorStop(1.0, 'rgba(110, 245, 200, 0.0)');
  gCtx.fillStyle = grad;
  gCtx.fillRect(0, 0, 64, 64);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;

  // Sugar-Star Candy Crystal geometry + Mint Halo Ring
  const coreGeo = new THREE.OctahedronGeometry(0.00145, 0);
  const capGeo = new THREE.ConeGeometry(0.00072, 0.00085, 6);
  const ringGeo = new THREE.TorusGeometry(0.00215, 0.00022, 8, 24);
  const floorGlowGeo = new THREE.PlaneGeometry(0.0066, 0.0066);

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffe866,
    emissive: new THREE.Color(0xffb830),
    emissiveIntensity: 1.85,
    roughness: 0.14,
    metalness: 0.12,
    toneMapped: false,
  });

  const capMat = new THREE.MeshStandardMaterial({
    color: 0xff4da6,
    emissive: new THREE.Color(0xff2e97),
    emissiveIntensity: 0.95,
    roughness: 0.20,
    metalness: 0.20,
  });

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x6ef5c8,
    emissive: new THREE.Color(0x3af0bc),
    emissiveIntensity: 1.55,
    roughness: 0.18,
    metalness: 0.25,
    toneMapped: false,
  });

  const floorGlowMat = new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    opacity: 0.90,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -6,
    polygonOffsetUnits: -6,
  });

  const shockwaveCount = 8;
  const shockwaveGeo = new THREE.RingGeometry(0.0016, 0.0025, 24);
  const shockwaves = [];
  for (let i = 0; i < shockwaveCount; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xff4da6 : 0x6ef5c8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(shockwaveGeo, mat);
    mesh.visible = false;
    group.add(mesh);
    shockwaves.push({ mesh, mat, age: 99, maxAge: 0.38 });
  }
  let nextShockwaveIdx = 0;

  const _upVec = new THREE.Vector3(0, 1, 0);
  const _rotMat = new THREE.Matrix4();
  const _leftVec = new THREE.Vector3();
  const _frameOut = {
    index: 0,
    sector: 1,
    position: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    right: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    bankDeg: 0,
    signedCurvature: 0,
    slope: 0,
  };

  function spawnShockwave(pos, normal) {
    const sw = shockwaves[nextShockwaveIdx % shockwaveCount];
    nextShockwaveIdx++;
    sw.age = 0.0;
    sw.mesh.position.copy(pos);
    sw.mesh.quaternion.setFromUnitVectors(_upVec, normal);
    sw.mesh.rotateX(-Math.PI / 2);
    sw.mesh.scale.setScalar(1.0);
    sw.mat.opacity = 1.0;
    sw.mesh.visible = true;
  }

  const items = [];
  for (let i = 0; i < itemCount; i++) {
    const itemGroup = new THREE.Group();
    itemGroup.name = `SugarCandyStar_${i}`;

    const bodyPivot = new THREE.Group();
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    bodyPivot.add(coreMesh);

    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = 0.00145;
    bodyPivot.add(topCap);

    const botCap = new THREE.Mesh(capGeo, capMat);
    botCap.position.y = -0.00145;
    botCap.rotation.x = Math.PI;
    bodyPivot.add(botCap);

    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = 0.58;
    orbitRing.rotation.z = 0.32;
    bodyPivot.add(orbitRing);

    itemGroup.add(bodyPivot);

    const floorGlow = new THREE.Mesh(floorGlowGeo, floorGlowMat);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -0.0022;
    itemGroup.add(floorGlow);

    group.add(itemGroup);

    items.push({
      id: i,
      s: 0,
      lateralOffset: 0,
      collected: false,
      respawnTimer: 0,
      spawnScale: 1.0,
      phase: Math.random() * Math.PI * 2,
      basePosition: new THREE.Vector3(),
      normal: new THREE.Vector3(0, 1, 0),
      tangent: new THREE.Vector3(1, 0, 0),
      right: new THREE.Vector3(0, 0, 1),
      baseQuat: new THREE.Quaternion(),
      worldPos: new THREE.Vector3(),
      group: itemGroup,
      bodyPivot,
      orbitRing,
    });
  }

  function wrappedArcDist(a, b) {
    const d = Math.abs(a - b) % totalLength;
    return Math.min(d, totalLength - d);
  }

  function randomize() {
    const placedS = [];
    const minSpacing = (totalLength / itemCount) * 0.62;
    const gridSafeRadius = 0.095;

    for (let i = 0; i < itemCount; i++) {
      let chosenS = ((i + 0.5) / itemCount) * totalLength;
      for (let attempt = 0; attempt < 28; attempt++) {
        const candidate = Math.random() * totalLength;
        if (wrappedArcDist(candidate, startFinishArc) < gridSafeRadius) continue;
        let tooClose = false;
        for (let j = 0; j < placedS.length; j++) {
          if (wrappedArcDist(candidate, placedS[j]) < minSpacing) {
            tooClose = true;
            break;
          }
        }
        if (!tooClose) {
          chosenS = candidate;
          break;
        }
      }
      if (wrappedArcDist(chosenS, startFinishArc) < gridSafeRadius) {
        chosenS = (startFinishArc + gridSafeRadius + 0.04 + i * 0.05) % totalLength;
      }

      placedS.push(chosenS);
      const lat = (Math.random() * 2 - 1) * 0.0052;

      const frame = physics.sampleTrackAtArcLength(chosenS, _frameOut);
      const item = items[i];
      item.s = chosenS;
      item.lateralOffset = lat;
      item.collected = false;
      item.respawnTimer = 0.0;
      item.spawnScale = 1.0;

      item.basePosition
        .copy(frame.position)
        .addScaledVector(frame.right, lat)
        .addScaledVector(frame.normal, 0.0028);
      item.normal.copy(frame.normal);
      item.tangent.copy(frame.tangent);
      item.right.copy(frame.right);

      _leftVec.crossVectors(frame.normal, frame.tangent).normalize();
      _rotMat.makeBasis(_leftVec, frame.normal, frame.tangent);
      item.baseQuat.setFromRotationMatrix(_rotMat);

      item.worldPos.copy(item.basePosition);
      item.group.position.copy(item.basePosition);
      item.group.quaternion.copy(item.baseQuat);
      item.group.scale.setScalar(1.0);
      item.group.visible = true;
    }
  }

  randomize();

  function update(dt, elapsedTime, kartState, onCollect) {
    const clampedDt = Math.min(dt, 0.05);

    for (let i = 0; i < shockwaveCount; i++) {
      const sw = shockwaves[i];
      if (sw.age < sw.maxAge) {
        sw.age += clampedDt;
        const u = Math.min(1.0, sw.age / sw.maxAge);
        sw.mesh.scale.setScalar(1.0 + u * 4.2);
        sw.mat.opacity = (1.0 - u) * 0.95;
        if (u >= 1.0) {
          sw.mesh.visible = false;
        }
      }
    }

    const canCollect =
      kartState &&
      !kartState.countdownLocked &&
      !kartState.raceFinished &&
      !kartState.autopilot;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.collected) {
        item.respawnTimer -= clampedDt;
        if (item.respawnTimer <= 0.0) {
          item.collected = false;
          item.spawnScale = 0.05;
          item.group.visible = true;
        } else {
          continue;
        }
      }

      if (item.spawnScale < 1.0) {
        item.spawnScale = Math.min(1.0, item.spawnScale + clampedDt * 4.5);
      }

      const bob = Math.sin(elapsedTime * 4.0 + item.phase) * 0.00045;
      item.worldPos.copy(item.basePosition).addScaledVector(item.normal, bob);
      item.group.position.copy(item.worldPos);
      item.group.scale.setScalar(item.spawnScale);

      item.bodyPivot.rotation.y = elapsedTime * 2.4 + item.phase;
      item.orbitRing.rotation.z = elapsedTime * 4.2 + item.phase;
      item.orbitRing.rotation.x = 0.55 + Math.sin(elapsedTime * 2.2 + item.phase) * 0.35;

      if (canCollect) {
        const distSq = item.worldPos.distanceToSquared(kartState.position);
        if (distSq <= pickupRadiusSq) {
          item.collected = true;
          item.respawnTimer = respawnDuration;
          item.group.visible = false;
          spawnShockwave(item.worldPos, item.normal);
          if (onCollect) {
            onCollect(item);
          }
        }
      }
    }
  }

  return {
    group,
    items,
    randomize,
    update,
  };
}
