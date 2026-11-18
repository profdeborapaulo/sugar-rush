import * as THREE from 'three';
import {
  createCandyRoadTexture,
  createCheckeredGantryTexture,
  createCandyCaneStripeTexture,
  createPeppermintSwirlTexture,
  createTrackBannerTexture,
  createNameplateDecalTexture,
} from './ProceduralTextures.js';

export const sharedUnderTrackUniforms = {
  uTime: { value: 0.0 },
  uIntensity: { value: 1.0 },
  uGlowFieldTex: { value: null },
};

export function calibrateTrackCoasterGlb(_glbScene) {
  // Sugar Rush uses the procedural Candy Coaster Track directly
}

/**
 * Losslessly partitions a board-spanning track BufferGeometry into 6 spatial chunks
 * for efficient WebGL frustum culling in 1P Views 1 & 2.
 */
function splitTrackMeshIntoSpatialChunks(mesh) {
  if (!mesh || !mesh.isMesh || !mesh.geometry || mesh.userData._spatialChunked) return;
  const geo = mesh.geometry;
  const posAttr = geo.attributes.position;
  if (!posAttr) return;

  const indexAttr = geo.index;
  const triCount = indexAttr ? Math.floor(indexAttr.count / 3) : Math.floor(posAttr.count / 3);
  if (triCount < 2000) return;

  mesh.userData._spatialChunked = true;
  const buckets = [[], [], [], [], [], []];

  for (let t = 0; t < triCount; t++) {
    const i0 = indexAttr ? indexAttr.getX(t * 3 + 0) : t * 3 + 0;
    const i1 = indexAttr ? indexAttr.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = indexAttr ? indexAttr.getX(t * 3 + 2) : t * 3 + 2;

    const cx = (posAttr.getX(i0) + posAttr.getX(i1) + posAttr.getX(i2)) / 3.0;
    const cz = (posAttr.getZ(i0) + posAttr.getZ(i1) + posAttr.getZ(i2)) / 3.0;

    const col = cx < -0.14 ? 0 : cx < 0.14 ? 1 : 2;
    const row = cz < 0.01 ? 0 : 1;
    buckets[row * 3 + col].push(i0, i1, i2);
  }

  const nonEmptyBuckets = buckets.filter((b) => b.length > 0);
  if (nonEmptyBuckets.length <= 1) return;

  const attrNames = Object.keys(geo.attributes);
  const chunkGeos = [];

  for (const triIndices of nonEmptyBuckets) {
    const remap = new Int32Array(posAttr.count).fill(-1);
    const uniqueOrigVerts = [];
    const newIndices = new Uint32Array(triIndices.length);

    for (let k = 0; k < triIndices.length; k++) {
      const origV = triIndices[k];
      let mappedV = remap[origV];
      if (mappedV === -1) {
        mappedV = uniqueOrigVerts.length;
        remap[origV] = mappedV;
        uniqueOrigVerts.push(origV);
      }
      newIndices[k] = mappedV;
    }

    const vCount = uniqueOrigVerts.length;
    const subGeo = new THREE.BufferGeometry();

    for (const name of attrNames) {
      const srcAttr = geo.attributes[name];
      const itemSize = srcAttr.itemSize;
      const ArrayType = srcAttr.array.constructor;
      const dstArr = new ArrayType(vCount * itemSize);
      const srcArr = srcAttr.array;

      for (let v = 0; v < vCount; v++) {
        const srcBase = uniqueOrigVerts[v] * itemSize;
        const dstBase = v * itemSize;
        for (let c = 0; c < itemSize; c++) {
          dstArr[dstBase + c] = srcArr[srcBase + c];
        }
      }
      subGeo.setAttribute(name, new THREE.BufferAttribute(dstArr, itemSize, srcAttr.normalized));
    }

    subGeo.setIndex(
      vCount < 65535
        ? new THREE.Uint16BufferAttribute(new Uint16Array(newIndices), 1)
        : new THREE.Uint32BufferAttribute(newIndices, 1)
    );
    subGeo.computeBoundingBox();
    subGeo.computeBoundingSphere();
    chunkGeos.push(subGeo);
  }

  const oldGeo = mesh.geometry;
  mesh.geometry = chunkGeos[0];
  mesh.frustumCulled = true;

  const parent = mesh.parent;
  if (parent) {
    for (let idx = 1; idx < chunkGeos.length; idx++) {
      const sibling = new THREE.Mesh(chunkGeos[idx], mesh.material);
      sibling.name = `${mesh.name}_Chunk${idx}`;
      sibling.position.copy(mesh.position);
      sibling.quaternion.copy(mesh.quaternion);
      sibling.scale.copy(mesh.scale);
      sibling.castShadow = mesh.castShadow;
      sibling.receiveShadow = mesh.receiveShadow;
      sibling.frustumCulled = true;
      sibling.userData._spatialChunked = true;
      parent.add(sibling);
    }
  }
  oldGeo.dispose();
}

/**
 * Builds the Sugar Rush ("Corrida Doce") Candy Coaster Track:
 * - Rich dark-chocolate fudge roadway with rainbow sprinkle shoulders & strawberry/mint edge lines
 * - Strawberry-pink & marshmallow-white peppermint curbs with pastel mint guardrails
 * - Candy-cane striped coaster spine tubes & 72 frosted wafer/candy support columns
 * - Giant Sugar Rush Lollipop Start/Finish Gantry with 5 F1 Starting Light Pods
 * - Cotton-candy under-track neon glow strips & wafer-board light field
 */
export function buildCoasterTrack(splineData) {
  const trackGroup = new THREE.Group();
  trackGroup.name = 'SugarRushCoasterTrackGroup';

  const samples = splineData.samples;
  const N = samples.length;
  const halfWidth = (splineData.track_width_m || 0.022) * 0.5;
  const curbWidth = splineData.curb_width_m || 0.0017;
  const railHeight = (splineData.rail_height_m || 0.0018) * 0.52;
  const deckThickness = 0.0018;

  const candyRoadTex = createCandyRoadTexture();
  candyRoadTex.repeat.set(1, 1); // Scaled via vCoord per cross-section below
  const gantryTex = createCheckeredGantryTexture();
  const candyCaneTex = createCandyCaneStripeTexture('#ff1880', '#fff7fb', '#ff7ac8');
  candyCaneTex.repeat.set(1, 36);
  const peppermintSwirlTex = createPeppermintSwirlTexture('#ff1880', '#ffffff', 12);

  const arcLen = new Float32Array(N + 1);
  for (let i = 0; i < N; i++) {
    const p0 = samples[i].position;
    const p1 = samples[(i + 1) % N].position;
    arcLen[i + 1] = arcLen[i] + Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
  }
  const totalTrackArcLen = Math.max(1e-4, arcLen[N]);

  // -------------------------------------------------------------------------
  // 1. CHOCOLATE FUDGE ROADBED RIBBON + CARAMEL WAFER UNDER-DECK
  // -------------------------------------------------------------------------
  const roadPositions = [];
  const roadNormals = [];
  const roadUvs = [];
  const roadIndices = [];

  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const pos = new THREE.Vector3(...s.position);
    const right = new THREE.Vector3(...s.right);
    const normal = new THREE.Vector3(...s.normal);

    const vCoord = (arcLen[i] / totalTrackArcLen) * 56.0;

    const pLeftTop = pos.clone().addScaledVector(right, -halfWidth);
    const pRightTop = pos.clone().addScaledVector(right, halfWidth);
    const pLeftBot = pLeftTop.clone().addScaledVector(normal, -deckThickness);
    const pRightBot = pRightTop.clone().addScaledVector(normal, -deckThickness);

    roadPositions.push(
      pLeftTop.x, pLeftTop.y, pLeftTop.z,
      pRightTop.x, pRightTop.y, pRightTop.z,
      pRightBot.x, pRightBot.y, pRightBot.z,
      pLeftBot.x, pLeftBot.y, pLeftBot.z
    );

    roadNormals.push(
      normal.x, normal.y, normal.z,
      normal.x, normal.y, normal.z,
      -normal.x, -normal.y, -normal.z,
      -normal.x, -normal.y, -normal.z
    );

    roadUvs.push(0, vCoord, 1, vCoord, 1, vCoord, 0, vCoord);

    if (i < N) {
      const base = i * 4;
      const next = (i + 1) * 4;
      roadIndices.push(base + 0, base + 1, next + 1);
      roadIndices.push(base + 0, next + 1, next + 0);
      roadIndices.push(base + 2, base + 3, next + 3);
      roadIndices.push(base + 2, next + 3, next + 2);
    }
  }

  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
  roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
  roadGeo.setIndex(roadIndices);

  const roadMat = new THREE.MeshPhysicalMaterial({
    map: candyRoadTex,
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.04,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
  });

  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.castShadow = true;
  roadMesh.receiveShadow = true;
  roadMesh.name = 'SugarRushCandyRoadbed';
  trackGroup.add(roadMesh);

  // -------------------------------------------------------------------------
  // 2. STRAWBERRY-PINK & MARSHMALLOW-WHITE PEPPERMINT CURBS + MINT GUARDRAILS
  // -------------------------------------------------------------------------
  const curbPositions = [];
  const curbNormals = [];
  const curbColors = [];
  const curbIndices = [];

  const pinkCurbColor = new THREE.Color(0xff1880);
  const whiteCurbColor = new THREE.Color(0xffcfe8);
  const mintRailColor = new THREE.Color(0xff66c2);

  let cVertOffset = 0;
  for (let i = 0; i < N; i++) {
    const s0 = samples[i];
    const s1 = samples[(i + 1) % N];

    const p0 = new THREE.Vector3(...s0.position);
    const r0 = new THREE.Vector3(...s0.right);
    const n0 = new THREE.Vector3(...s0.normal);

    const p1 = new THREE.Vector3(...s1.position);
    const r1 = new THREE.Vector3(...s1.right);
    const n1 = new THREE.Vector3(...s1.normal);

    const isPink = i % 2 === 0;
    const col = isPink ? pinkCurbColor : whiteCurbColor;

    for (const side of [-1, 1]) {
      const innerDist = side * (halfWidth - 0.0012);
      const outerDist = side * (halfWidth + 0.0005);

      const v0Inner = p0.clone().addScaledVector(r0, innerDist).addScaledVector(n0, 0.00012);
      const v0Outer = p0.clone().addScaledVector(r0, outerDist).addScaledVector(n0, 0.00022);
      const v1Inner = p1.clone().addScaledVector(r1, innerDist).addScaledVector(n1, 0.00012);
      const v1Outer = p1.clone().addScaledVector(r1, outerDist).addScaledVector(n1, 0.00022);

      const v0RailTop = v0Outer.clone().addScaledVector(n0, railHeight);
      const v1RailTop = v1Outer.clone().addScaledVector(n1, railHeight);

      curbPositions.push(
        v0Inner.x, v0Inner.y, v0Inner.z,
        v0Outer.x, v0Outer.y, v0Outer.z,
        v1Outer.x, v1Outer.y, v1Outer.z,
        v1Inner.x, v1Inner.y, v1Inner.z,
        v0RailTop.x, v0RailTop.y, v0RailTop.z,
        v1RailTop.x, v1RailTop.y, v1RailTop.z
      );

      for (let k = 0; k < 4; k++) {
        curbNormals.push(n0.x, n0.y, n0.z);
        curbColors.push(col.r, col.g, col.b);
      }
      for (let k = 0; k < 2; k++) {
        curbNormals.push(-side * r0.x, -side * r0.y, -side * r0.z);
        curbColors.push(mintRailColor.r, mintRailColor.g, mintRailColor.b);
      }

      if (side === 1) {
        curbIndices.push(cVertOffset + 0, cVertOffset + 1, cVertOffset + 2);
        curbIndices.push(cVertOffset + 0, cVertOffset + 2, cVertOffset + 3);
        curbIndices.push(cVertOffset + 1, cVertOffset + 4, cVertOffset + 5);
        curbIndices.push(cVertOffset + 1, cVertOffset + 5, cVertOffset + 2);
      } else {
        curbIndices.push(cVertOffset + 1, cVertOffset + 0, cVertOffset + 3);
        curbIndices.push(cVertOffset + 1, cVertOffset + 3, cVertOffset + 2);
        curbIndices.push(cVertOffset + 4, cVertOffset + 1, cVertOffset + 2);
        curbIndices.push(cVertOffset + 4, cVertOffset + 2, cVertOffset + 5);
      }
      cVertOffset += 6;
    }
  }

  const curbGeo = new THREE.BufferGeometry();
  curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbPositions, 3));
  curbGeo.setAttribute('normal', new THREE.Float32BufferAttribute(curbNormals, 3));
  curbGeo.setAttribute('color', new THREE.Float32BufferAttribute(curbColors, 3));
  curbGeo.setIndex(curbIndices);

  const curbMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.34,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.castShadow = true;
  curbMesh.receiveShadow = true;
  trackGroup.add(curbMesh);

  // -------------------------------------------------------------------------
  // 3. TWIN CANDY-CANE SPINE RAILS UNDERNEATH THE DECK
  // -------------------------------------------------------------------------
  const spinePtsLeft = [];
  const spinePtsRight = [];
  for (let i = 0; i < N; i += 2) {
    const s = samples[i];
    const p = new THREE.Vector3(...s.position);
    const r = new THREE.Vector3(...s.right);
    const n = new THREE.Vector3(...s.normal);
    spinePtsLeft.push(p.clone().addScaledVector(r, -0.0065).addScaledVector(n, -0.0032));
    spinePtsRight.push(p.clone().addScaledVector(r, 0.0065).addScaledVector(n, -0.0032));
  }
  const curveLeft = new THREE.CatmullRomCurve3(spinePtsLeft, true);
  const curveRight = new THREE.CatmullRomCurve3(spinePtsRight, true);

  const candySpineMat = new THREE.MeshStandardMaterial({
    map: candyCaneTex,
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.05,
  });

  const tubeLeft = new THREE.Mesh(
    new THREE.TubeGeometry(curveLeft, 360, 0.0011, 8, true),
    candySpineMat
  );
  const tubeRight = new THREE.Mesh(
    new THREE.TubeGeometry(curveRight, 360, 0.0011, 8, true),
    candySpineMat
  );
  tubeLeft.castShadow = true;
  tubeRight.castShadow = true;
  trackGroup.add(tubeLeft, tubeRight);

  // -------------------------------------------------------------------------
  // 4. 72 PEPPERMINT & WAFER LATTICE SUPPORT COLUMNS
  // -------------------------------------------------------------------------
  const columnStep = 10;
  const numColumns = Math.floor(N / columnStep);

  function getUnderlyingSupportElevation(x, z, trackY) {
    // Tiered Cake Platform in Sector 1 (around [-0.36, -0.07], top at Y = 0.156)
    if (x < -0.23 && x > -0.49 && z < 0.04 && z > -0.18 && trackY > 0.145) {
      return 0.156;
    }
    // Frosted Donut Pad in Sector 5 (around [0.325, 0.135], top at Y = 0.003)
    if (x > 0.155 && x < 0.495 && z > 0.002 && z < 0.268) {
      return 0.003;
    }
    return 0.0;
  }

  const frostedStrutMat = new THREE.MeshStandardMaterial({
    color: 0xffd6ec,
    roughness: 0.34,
    metalness: 0.04,
  });
  const pinkRingMat = new THREE.MeshStandardMaterial({
    color: 0xff1f8a,
    roughness: 0.28,
    metalness: 0.05,
  });
  const chocoFootpadMat = new THREE.MeshStandardMaterial({
    color: 0x5c2d1f,
    roughness: 0.62,
    metalness: 0.04,
  });

  const maxChords = numColumns * 4;
  const chordGeo = new THREE.CylinderGeometry(0.00085, 0.00085, 1.0, 8);
  const chordInstanced = new THREE.InstancedMesh(chordGeo, frostedStrutMat, maxChords);
  chordInstanced.castShadow = true;
  chordInstanced.receiveShadow = true;

  const footpadGeo = new THREE.CylinderGeometry(0.0048, 0.0055, 0.0022, 14);
  const footpadInstanced = new THREE.InstancedMesh(footpadGeo, chocoFootpadMat, numColumns);
  footpadInstanced.receiveShadow = true;

  const saddleGeo = new THREE.BoxGeometry(0.024, 0.0022, 0.0055);
  const saddleInstanced = new THREE.InstancedMesh(saddleGeo, pinkRingMat, numColumns);
  saddleInstanced.castShadow = true;

  const ringGeo = new THREE.BoxGeometry(0.0072, 0.001, 0.0072);
  const ringInstanced = new THREE.InstancedMesh(ringGeo, pinkRingMat, numColumns * 6);

  const dummy = new THREE.Object3D();
  let chordIdx = 0;
  let footIdx = 0;
  let saddleIdx = 0;
  let ringIdx = 0;

  const trussHalfSpan = 0.0031;
  const chordOffsets = [
    [-trussHalfSpan, -trussHalfSpan],
    [trussHalfSpan, -trussHalfSpan],
    [trussHalfSpan, trussHalfSpan],
    [-trussHalfSpan, trussHalfSpan],
  ];

  for (let c = 0; c < numColumns; c++) {
    const s = samples[c * columnStep];
    const topPos = new THREE.Vector3(...s.position);
    const tangent = new THREE.Vector3(...s.tangent);

    const attachY = topPos.y - 0.0032;
    const baseY = getUnderlyingSupportElevation(topPos.x, topPos.z, topPos.y);
    const colHeight = Math.max(0.006, attachY - baseY);
    const midY = baseY + colHeight * 0.5;

    dummy.position.set(topPos.x, attachY, topPos.z);
    const yaw = Math.atan2(tangent.x, tangent.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    saddleInstanced.setMatrixAt(saddleIdx++, dummy.matrix);

    dummy.position.set(topPos.x, baseY + 0.0011, topPos.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    footpadInstanced.setMatrixAt(footIdx++, dummy.matrix);

    for (const [ox, oz] of chordOffsets) {
      dummy.position.set(topPos.x + ox, midY, topPos.z + oz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, colHeight, 1);
      dummy.updateMatrix();
      chordInstanced.setMatrixAt(chordIdx++, dummy.matrix);
    }

    const numRings = Math.min(6, Math.max(2, Math.floor(colHeight / 0.024)));
    for (let r = 0; r < numRings; r++) {
      const ry = baseY + ((r + 0.5) / numRings) * colHeight;
      dummy.position.set(topPos.x, ry, topPos.z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ringInstanced.setMatrixAt(ringIdx++, dummy.matrix);
    }
  }

  chordInstanced.count = chordIdx;
  footpadInstanced.count = footIdx;
  saddleInstanced.count = saddleIdx;
  ringInstanced.count = ringIdx;
  chordInstanced.instanceMatrix.needsUpdate = true;
  footpadInstanced.instanceMatrix.needsUpdate = true;
  saddleInstanced.instanceMatrix.needsUpdate = true;
  ringInstanced.instanceMatrix.needsUpdate = true;

  trackGroup.add(chordInstanced, footpadInstanced, saddleInstanced, ringInstanced);

  // -------------------------------------------------------------------------
  // 5. SUGAR RUSH CANDY-CANE & LOLLIPOP START/FINISH PORTAL GANTRY
  // -------------------------------------------------------------------------
  const gantryGroup = new THREE.Group();
  gantryGroup.name = 'StartFinishGantry';
  gantryGroup.position.set(0.0183, 0.035, 0.255);

  const gantryStickMat = new THREE.MeshStandardMaterial({
    map: createCandyCaneStripeTexture('#ff1880', '#ffffff', '#ff70c8'),
    roughness: 0.22,
  });
  const lollipopDiscMat = new THREE.MeshStandardMaterial({
    map: peppermintSwirlTex,
    roughness: 0.18,
    metalness: 0.04,
  });

  for (const gz of [-0.018, 0.018]) {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0020, 0.0024, 0.030, 14),
      gantryStickMat
    );
    tower.position.set(0, 0.015, gz);
    tower.castShadow = true;
    gantryGroup.add(tower);

    // Giant Swirling Peppermint Lollipop on top of each gantry pillar
    const lolli = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0068, 0.0068, 0.0022, 24),
      lollipopDiscMat
    );
    lolli.rotation.z = Math.PI / 2;
    lolli.position.set(0, 0.035, gz);
    gantryGroup.add(lolli);
  }

  const signBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.0048, 0.0082, 0.040),
    new THREE.MeshStandardMaterial({ color: 0x4b1332, roughness: 0.35, metalness: 0.12 })
  );
  signBox.position.set(0, 0.024, 0);
  signBox.castShadow = true;
  gantryGroup.add(signBox);

  const signFaceMat = new THREE.MeshStandardMaterial({
    map: gantryTex,
    emissiveMap: gantryTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.65,
    roughness: 0.22,
  });
  for (const [sx, rotY] of [
    [0.0026, Math.PI / 2],
    [-0.0026, -Math.PI / 2],
  ]) {
    const signFace = new THREE.Mesh(new THREE.PlaneGeometry(0.036, 0.0072), signFaceMat);
    signFace.position.set(sx, 0.024, 0);
    signFace.rotation.y = rotY;
    gantryGroup.add(signFace);
  }

  // Starting LED housings (dark smoked bezels; dynamic red pods appear during countdown)
  for (let l = -2; l <= 2; l++) {
    const ledHousing = new THREE.Mesh(
      new THREE.SphereGeometry(0.00082, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x240a18 })
    );
    ledHousing.position.set(0.0024, 0.0188, l * 0.0038);
    gantryGroup.add(ledHousing);
  }

  const startStripe = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0038, 0.021),
    new THREE.MeshBasicMaterial({ map: gantryTex })
  );
  startStripe.rotation.x = -Math.PI / 2;
  startStripe.position.set(0, 0.0006, 0);
  gantryGroup.add(startStripe);

  trackGroup.add(gantryGroup);

  // -------------------------------------------------------------------------
  // 5B. "profdeborapaulo" TRACKSIDE CANDY BILLBOARDS, HALFWAY ARCH & ROAD DECAL
  // -------------------------------------------------------------------------
  const bannerGroup = new THREE.Group();
  bannerGroup.name = 'ProfDeboraPauloTrackBanners';

  const bannerPostMat = new THREE.MeshStandardMaterial({
    map: createCandyCaneStripeTexture('#ff1880', '#ffffff', '#ff70c8'),
    roughness: 0.24,
  });
  const bannerTextures = [
    createTrackBannerTexture('profdeborapaulo', 'SUGAR RUSH · CORRIDA DOCE', 0),
    createTrackBannerTexture('profdeborapaulo', 'PISTA DA VANELLOPE · TURBO', 1),
    createTrackBannerTexture('profdeborapaulo', 'CANDY GRAND PRIX · ROSA', 2),
  ];

  // Trackside lollipop-mounted billboards placed cleanly outside the guardrail
  const billboardSpots = [
    { idx: 668, side: 1, variant: 0 },
    { idx: 120, side: -1, variant: 1 },
    { idx: 280, side: 1, variant: 2 },
    { idx: 525, side: -1, variant: 0 },
  ];

  for (const spot of billboardSpots) {
    const s = samples[spot.idx % N];
    const p = new THREE.Vector3(...s.position);
    const r = new THREE.Vector3(...s.right).normalize();
    const n = new THREE.Vector3(...s.normal).normalize();
    const t = new THREE.Vector3(...s.tangent).normalize();

    const postBase = p
      .clone()
      .addScaledVector(r, spot.side * (halfWidth + curbWidth + 0.011));

    const boardHolder = new THREE.Group();
    boardHolder.position.copy(postBase);

    const postMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0012, 0.0015, 0.017, 10),
      bannerPostMat
    );
    postMesh.position.copy(n.clone().multiplyScalar(0.0075));
    postMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    postMesh.castShadow = true;
    boardHolder.add(postMesh);

    const tex = bannerTextures[spot.variant % bannerTextures.length];
    const faceMat = new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.48,
      roughness: 0.22,
      side: THREE.DoubleSide,
    });
    const boardW = 0.032;
    const boardH = 0.010;
    const signFrame = new THREE.Mesh(
      new THREE.BoxGeometry(boardW + 0.0018, boardH + 0.0016, 0.0012),
      pinkRingMat
    );
    const signFace = new THREE.Mesh(new THREE.PlaneGeometry(boardW, boardH), faceMat);
    signFace.position.z = 0.0007;
    const signBack = new THREE.Mesh(new THREE.PlaneGeometry(boardW, boardH), faceMat);
    signBack.position.z = -0.0007;
    signBack.rotation.y = Math.PI;

    const signAssembly = new THREE.Group();
    signAssembly.add(signFrame, signFace, signBack);
    signAssembly.position.copy(n.clone().multiplyScalar(0.0165));

    // Angle billboard toward oncoming driver (-tangent + slight inward angle toward track)
    signAssembly.up.copy(n);
    signAssembly.lookAt(
      postBase
        .clone()
        .addScaledVector(n, 0.0165)
        .addScaledVector(t, -0.08)
        .addScaledVector(r, -spot.side * 0.035)
    );

    boardHolder.add(signAssembly);
    bannerGroup.add(boardHolder);
  }

  // Overhead Halfway Candy Portal Arch with "profdeborapaulo" at sample 360
  const archSample = samples[Math.min(360, N - 1)];
  if (archSample) {
    const ap = new THREE.Vector3(...archSample.position);
    const ar = new THREE.Vector3(...archSample.right).normalize();
    const an = new THREE.Vector3(...archSample.normal).normalize();
    const at = new THREE.Vector3(...archSample.tangent).normalize();

    const archHolder = new THREE.Group();
    archHolder.position.copy(ap);
    const basisMat = new THREE.Matrix4().makeBasis(ar, an, at);
    archHolder.quaternion.setFromRotationMatrix(basisMat);

    const spanHalf = halfWidth + curbWidth + 0.0045;
    for (const sx of [-spanHalf, spanHalf]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0014, 0.0017, 0.025, 12),
        bannerPostMat
      );
      col.position.set(sx, 0.0125, 0);
      col.castShadow = true;
      archHolder.add(col);

      const lolliTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0045, 0.0016, 20),
        lollipopDiscMat
      );
      lolliTop.rotation.x = Math.PI / 2;
      lolliTop.position.set(sx, 0.0265, 0);
      archHolder.add(lolliTop);
    }

    const archTex = bannerTextures[0];
    const archFaceMat = new THREE.MeshStandardMaterial({
      map: archTex,
      emissiveMap: archTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.55,
      roughness: 0.22,
    });
    const archBar = new THREE.Mesh(
      new THREE.BoxGeometry(spanHalf * 2.08, 0.0085, 0.0024),
      pinkRingMat
    );
    archBar.position.set(0, 0.0215, 0);
    archHolder.add(archBar);

    for (const [sz, ry] of [
      [-0.0013, Math.PI],
      [0.0013, 0],
    ]) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(spanHalf * 1.95, 0.0076), archFaceMat);
      f.position.set(0, 0.0215, sz);
      f.rotation.y = ry;
      archHolder.add(f);
    }
    bannerGroup.add(archHolder);
  }

  // Painted Pink "profdeborapaulo" Roadway Strip right past Start/Finish (samples 654..660)
  const decalTex = createNameplateDecalTexture('profdeborapaulo', {
    bgTop: '#ff1f8a',
    bgBottom: '#c20c68',
    borderCol: '#ffffff',
    outlineCol: '#380622',
    accentCol: '#ff99d8',
  });
  const decalStart = 653;
  const decalSteps = 8;
  const dPos = [];
  const dNorm = [];
  const dUv = [];
  const dIdx = [];
  for (let k = 0; k <= decalSteps; k++) {
    const s = samples[(decalStart + k) % N];
    const p = new THREE.Vector3(...s.position);
    const r = new THREE.Vector3(...s.right).normalize();
    const n = new THREE.Vector3(...s.normal).normalize();
    const halfDecalW = halfWidth * 0.78;
    const pL = p.clone().addScaledVector(r, -halfDecalW).addScaledVector(n, 0.00024);
    const pR = p.clone().addScaledVector(r, halfDecalW).addScaledVector(n, 0.00024);
    dPos.push(pL.x, pL.y, pL.z, pR.x, pR.y, pR.z);
    dNorm.push(n.x, n.y, n.z, n.x, n.y, n.z);
    const v = k / decalSteps;
    dUv.push(0, v, 1, v);
    if (k < decalSteps) {
      const b = k * 2;
      dIdx.push(b, b + 1, b + 3, b, b + 3, b + 2);
    }
  }
  const decalGeo = new THREE.BufferGeometry();
  decalGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
  decalGeo.setAttribute('normal', new THREE.Float32BufferAttribute(dNorm, 3));
  decalGeo.setAttribute('uv', new THREE.Float32BufferAttribute(dUv, 2));
  decalGeo.setIndex(dIdx);
  const decalMesh = new THREE.Mesh(
    decalGeo,
    new THREE.MeshStandardMaterial({
      map: decalTex,
      emissiveMap: decalTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.25,
      roughness: 0.28,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  decalMesh.receiveShadow = true;
  bannerGroup.add(decalMesh);

  trackGroup.add(bannerGroup);

  // -------------------------------------------------------------------------
  // 6. SUGAR RUSH COTTON-CANDY UNDER-TRACK NEON STRIPS & WAFER LIGHT FIELD
  // -------------------------------------------------------------------------
  const underTrackLedGroup = new THREE.Group();
  underTrackLedGroup.name = 'UnderTrackLedAndGlowGroup';

  const ledStripPositions = [];
  const ledStripUvs = [];
  const ledStripIndices = [];
  const outerEdgeDist = halfWidth + curbWidth * 1.02;
  const innerBellyDist = halfWidth * 0.58;

  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const p = new THREE.Vector3(...s.position);
    const r = new THREE.Vector3(...s.right);
    const n = new THREE.Vector3(...s.normal);
    const vNorm = arcLen[i] / totalTrackArcLen;

    const vL0 = p.clone().addScaledVector(r, -outerEdgeDist).addScaledVector(n, 0.0003);
    const vL1 = p.clone().addScaledVector(r, -outerEdgeDist * 0.92).addScaledVector(n, -0.0022);
    const vL2 = p.clone().addScaledVector(r, -innerBellyDist).addScaledVector(n, -0.0026);

    const vR0 = p.clone().addScaledVector(r, innerBellyDist).addScaledVector(n, -0.0026);
    const vR1 = p.clone().addScaledVector(r, outerEdgeDist * 0.92).addScaledVector(n, -0.0022);
    const vR2 = p.clone().addScaledVector(r, outerEdgeDist).addScaledVector(n, 0.0003);

    ledStripPositions.push(
      vL0.x, vL0.y, vL0.z,
      vL1.x, vL1.y, vL1.z,
      vL2.x, vL2.y, vL2.z,
      vR0.x, vR0.y, vR0.z,
      vR1.x, vR1.y, vR1.z,
      vR2.x, vR2.y, vR2.z
    );

    ledStripUvs.push(
      0.0, vNorm,
      0.5, vNorm,
      1.0, vNorm,
      1.0, vNorm,
      0.5, vNorm,
      0.0, vNorm
    );

    if (i < N) {
      const b = i * 6;
      const nx = (i + 1) * 6;
      ledStripIndices.push(b + 0, b + 1, nx + 1, b + 0, nx + 1, nx + 0);
      ledStripIndices.push(b + 1, b + 2, nx + 2, b + 1, nx + 2, nx + 1);
      ledStripIndices.push(b + 3, b + 4, nx + 4, b + 3, nx + 4, nx + 3);
      ledStripIndices.push(b + 4, b + 5, nx + 5, b + 4, nx + 5, nx + 4);
    }
  }

  const ledStripGeo = new THREE.BufferGeometry();
  ledStripGeo.setAttribute('position', new THREE.Float32BufferAttribute(ledStripPositions, 3));
  ledStripGeo.setAttribute('uv', new THREE.Float32BufferAttribute(ledStripUvs, 2));
  ledStripGeo.setIndex(ledStripIndices);
  ledStripGeo.computeBoundingBox();
  ledStripGeo.computeBoundingSphere();

  const ledStripMat = new THREE.ShaderMaterial({
    uniforms: sharedUnderTrackUniforms,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;

      vec3 evalTrackLedPalette(float phaseNorm, float timeSec) {
        float p = fract(phaseNorm - timeSec * 0.06 + 0.08);
        float seg = p * 4.0;
        int idx = int(floor(seg));
        float f = smoothstep(0.0, 1.0, fract(seg));
        vec3 cPink   = vec3(1.00, 0.08, 0.54); // Hot Magenta Pink (#ff148a)
        vec3 cMint   = vec3(1.00, 0.44, 0.78); // Bubblegum Pink (#ff70c7)
        vec3 cLemon  = vec3(0.42, 0.98, 0.80); // Vanellope Mint (#6bfad0)
        vec3 cGrape  = vec3(0.92, 0.18, 0.96); // Electric Orchid Pink (#eb2ef5)
        if (idx == 0) return mix(cPink, cMint, f);
        if (idx == 1) return mix(cMint, cLemon, f);
        if (idx == 2) return mix(cLemon, cGrape, f);
        return mix(cGrape, cPink, f);
      }

      void main() {
        if (uIntensity <= 0.001) discard;
        vec3 baseCol = evalTrackLedPalette(vUv.y * 2.0, uTime);
        float core = exp(-pow((vUv.x - 0.5) * 2.2, 2.0));
        vec3 col = mix(baseCol, vec3(1.0, 0.96, 0.99), core * 0.34) * (1.05 + 0.35 * core);
        float alpha = clamp((0.82 + 0.18 * core) * min(1.3, uIntensity), 0.0, 0.96);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const ledStripMesh = new THREE.Mesh(ledStripGeo, ledStripMat);
  ledStripMesh.name = 'UnderTrackLedRibbonMesh';
  ledStripMesh.castShadow = false;
  ledStripMesh.receiveShadow = false;
  underTrackLedGroup.add(ledStripMesh);
  splitTrackMeshIntoSpatialChunks(ledStripMesh);

  // Baked 2D Gaussian Light-Field on the Wafer Circuit Board & Frosted Donut Pad
  const fieldW = 256;
  const fieldH = 128;
  const xMin = -0.58;
  const xSpan = 1.16;
  const zMin = -0.34;
  const zSpan = 0.68;

  const sumWArr = new Float32Array(fieldW * fieldH);
  const sumSinArr = new Float32Array(fieldW * fieldH);
  const sumCosArr = new Float32Array(fieldW * fieldH);

  for (let i = 0; i < N; i++) {
    const smp = samples[i];
    const sx = smp.position[0];
    const sy = smp.position[1];
    const sz = smp.position[2];
    const phase = (arcLen[i] / totalTrackArcLen) * Math.PI * 2.0 * 2.0;
    const sinP = Math.sin(phase);
    const cosP = Math.cos(phase);

    const h = Math.max(0.0, sy);
    const sigma = h < 0.048 ? 0.032 : 0.046;
    const invTwoSigmaSq = 1.0 / (2.0 * sigma * sigma);
    const invTwoPhaseSigmaSq = 1.0 / (2.0 * 0.019 * 0.019);
    const heightWeight = 1.0 / (1.0 + h * 2.8);
    const radius = sigma * 3.0;

    const ix0 = Math.max(0, Math.floor(((sx - radius - xMin) / xSpan) * fieldW));
    const ix1 = Math.min(fieldW - 1, Math.ceil(((sx + radius - xMin) / xSpan) * fieldW));
    const iz0 = Math.max(0, Math.floor(((sz - radius - zMin) / zSpan) * fieldH));
    const iz1 = Math.min(fieldH - 1, Math.ceil(((sz + radius - zMin) / zSpan) * fieldH));

    for (let iz = iz0; iz <= iz1; iz++) {
      const wz = zMin + ((iz + 0.5) / fieldH) * zSpan;
      const dz = wz - sz;
      const dz2 = dz * dz;
      const rowOffset = iz * fieldW;
      for (let ix = ix0; ix <= ix1; ix++) {
        const wx = xMin + ((ix + 0.5) / fieldW) * xSpan;
        const dx = wx - sx;
        const d2 = dx * dx + dz2;
        if (d2 > radius * radius) continue;
        const w = Math.exp(-d2 * invTwoSigmaSq) * heightWeight;
        const wPhase = Math.exp(-d2 * invTwoPhaseSigmaSq) * heightWeight;
        const idx = rowOffset + ix;
        sumWArr[idx] += w;
        sumSinArr[idx] += wPhase * sinP;
        sumCosArr[idx] += wPhase * cosP;
      }
    }
  }

  const fieldBytes = new Uint8Array(fieldW * fieldH * 4);
  for (let idx = 0; idx < fieldW * fieldH; idx++) {
    const wTotal = sumWArr[idx];
    const normW = 1.0 - Math.exp(-wTotal * 0.088);
    let sNorm = 0.0;
    let cNorm = 1.0;
    if (wTotal > 1e-5) {
      const mag = Math.hypot(sumSinArr[idx], sumCosArr[idx]) || 1.0;
      sNorm = sumSinArr[idx] / mag;
      cNorm = sumCosArr[idx] / mag;
    }
    const bIdx = idx * 4;
    fieldBytes[bIdx + 0] = Math.min(255, Math.max(0, Math.round(normW * 255)));
    fieldBytes[bIdx + 1] = Math.min(255, Math.max(0, Math.round((sNorm * 0.5 + 0.5) * 255)));
    fieldBytes[bIdx + 2] = Math.min(255, Math.max(0, Math.round((cNorm * 0.5 + 0.5) * 255)));
    fieldBytes[bIdx + 3] = 255;
  }

  const glowFieldTex = new THREE.DataTexture(fieldBytes, fieldW, fieldH, THREE.RGBAFormat);
  glowFieldTex.magFilter = THREE.LinearFilter;
  glowFieldTex.minFilter = THREE.LinearFilter;
  glowFieldTex.wrapS = THREE.ClampToEdgeWrapping;
  glowFieldTex.wrapT = THREE.ClampToEdgeWrapping;
  glowFieldTex.flipY = false;
  glowFieldTex.needsUpdate = true;
  sharedUnderTrackUniforms.uGlowFieldTex.value = glowFieldTex;

  const quadVerts = new Float32Array([
    -0.58, 0.0005, -0.34,
     0.54, 0.0005, -0.34,
     0.54, 0.0005,  0.30,
    -0.58, 0.0005,  0.30,
     0.156, 0.0034, 0.003,
     0.494, 0.0034, 0.003,
     0.494, 0.0034, 0.267,
     0.156, 0.0034, 0.267,
  ]);
  const quadSurfaceIds = new Float32Array([0, 0, 0, 0, 1, 1, 1, 1]);
  const quadIndices = [0, 2, 1, 0, 3, 2, 4, 6, 5, 4, 7, 6];

  const deskGlowGeo = new THREE.BufferGeometry();
  deskGlowGeo.setAttribute('position', new THREE.BufferAttribute(quadVerts, 3));
  deskGlowGeo.setAttribute('aSurfaceId', new THREE.BufferAttribute(quadSurfaceIds, 1));
  deskGlowGeo.setIndex(quadIndices);
  deskGlowGeo.computeBoundingBox();
  deskGlowGeo.computeBoundingSphere();

  const deskGlowMat = new THREE.ShaderMaterial({
    uniforms: sharedUnderTrackUniforms,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    vertexShader: /* glsl */ `
      attribute float aSurfaceId;
      varying vec3 vWorldPos;
      varying float vSurfaceId;
      void main() {
        vSurfaceId = aSurfaceId;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform sampler2D uGlowFieldTex;
      varying vec3 vWorldPos;
      varying float vSurfaceId;

      vec3 evalTrackLedPalette(float phaseNorm, float timeSec) {
        float p = fract(phaseNorm - timeSec * 0.06 + 0.08);
        float seg = p * 4.0;
        int idx = int(floor(seg));
        float f = smoothstep(0.0, 1.0, fract(seg));
        vec3 cPink   = vec3(1.00, 0.08, 0.54);
        vec3 cMint   = vec3(1.00, 0.44, 0.78);
        vec3 cLemon  = vec3(0.42, 0.98, 0.80);
        vec3 cGrape  = vec3(0.92, 0.18, 0.96);
        if (idx == 0) return mix(cPink, cMint, f);
        if (idx == 1) return mix(cMint, cLemon, f);
        if (idx == 2) return mix(cLemon, cGrape, f);
        return mix(cGrape, cPink, f);
      }

      void main() {
        if (uIntensity <= 0.001) discard;
        if (vSurfaceId < 0.5) {
          if (vWorldPos.x > 0.155 && vWorldPos.x < 0.495 && vWorldPos.z > 0.0025 && vWorldPos.z < 0.2675) {
            discard;
          }
        }
        vec2 fieldUv = vec2((vWorldPos.x - (-0.58)) / 1.16, (vWorldPos.z - (-0.34)) / 0.68);
        if (fieldUv.x < 0.0 || fieldUv.x > 1.0 || fieldUv.y < 0.0 || fieldUv.y > 1.0) discard;

        vec4 field = texture2D(uGlowFieldTex, fieldUv);
        float weight = field.r;
        if (weight < 0.01) discard;

        float sinP = field.g * 2.0 - 1.0;
        float cosP = field.b * 2.0 - 1.0;
        float sNorm = atan(sinP, cosP) / 6.2831853 + 0.5;

        float edgeMaskX = smoothstep(-0.57, -0.51, vWorldPos.x) * (1.0 - smoothstep(0.49, 0.535, vWorldPos.x));
        float edgeMaskZ = smoothstep(-0.33, -0.28, vWorldPos.z) * (1.0 - smoothstep(0.26, 0.298, vWorldPos.z));

        vec3 col = evalTrackLedPalette(sNorm, uTime);
        float glowStrength = pow(weight, 1.12) * edgeMaskX * edgeMaskZ * 0.24 * uIntensity;
        if (glowStrength < 0.003) discard;
        gl_FragColor = vec4(col * glowStrength, 1.0);
      }
    `,
  });

  const deskGlowMesh = new THREE.Mesh(deskGlowGeo, deskGlowMat);
  deskGlowMesh.name = 'UnderTrackDeskGlowMesh';
  deskGlowMesh.castShadow = false;
  deskGlowMesh.receiveShadow = false;
  underTrackLedGroup.add(deskGlowMesh);

  // Formula 1 5-Light Start Gantry Red LED Pods at Sample 646
  const f1GlowCanvas = document.createElement('canvas');
  f1GlowCanvas.width = 64;
  f1GlowCanvas.height = 64;
  const f1GlowCtx = f1GlowCanvas.getContext('2d');
  const f1RadGrad = f1GlowCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
  f1RadGrad.addColorStop(0.0, 'rgba(255, 60, 100, 0.95)');
  f1RadGrad.addColorStop(0.35, 'rgba(255, 16, 62, 0.65)');
  f1RadGrad.addColorStop(0.72, 'rgba(220, 0, 48, 0.22)');
  f1RadGrad.addColorStop(1.0, 'rgba(180, 0, 20, 0.0)');
  f1GlowCtx.fillStyle = f1RadGrad;
  f1GlowCtx.fillRect(0, 0, 64, 64);
  const f1GlowTex = new THREE.CanvasTexture(f1GlowCanvas);

  const f1RedLensGeo = new THREE.BoxGeometry(0.00164, 0.00162, 0.00092);
  const f1RedLensMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.45, 0.08, 0.18),
    toneMapped: false,
  });
  const f1HaloSpriteMat = new THREE.SpriteMaterial({
    map: f1GlowTex,
    color: 0xff1a52,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });

  const f1StartLightPods = [];
  const gSample = samples[646] || samples[0];
  const gCenter = new THREE.Vector3(...gSample.position);
  const gRightHoriz = new THREE.Vector3(gSample.right[0], 0, gSample.right[2]).normalize();
  const gUpVec = new THREE.Vector3(0, 1, 0);

  const f1PodOffsetsRightToLeft = [0.0064, 0.0032, 0.0, -0.0032, -0.0064];
  for (let idx = 0; idx < 5; idx++) {
    const uPod = f1PodOffsetsRightToLeft[idx];
    const podGroup = new THREE.Group();
    podGroup.position
      .copy(gCenter)
      .addScaledVector(gRightHoriz, uPod)
      .addScaledVector(gUpVec, 0.012775);

    const lensMesh = new THREE.Mesh(f1RedLensGeo, f1RedLensMat);
    podGroup.add(lensMesh);

    const haloSprite = new THREE.Sprite(f1HaloSpriteMat);
    haloSprite.scale.set(0.0054, 0.0054, 1.0);
    haloSprite.position.set(0.00086, 0, 0);
    podGroup.add(haloSprite);

    podGroup.visible = false;
    underTrackLedGroup.add(podGroup);
    f1StartLightPods.push(podGroup);
  }

  function setF1StartLights(litCount = 0) {
    const count = Math.max(0, Math.min(5, Math.floor(litCount)));
    for (let i = 0; i < f1StartLightPods.length; i++) {
      f1StartLightPods[i].visible = i < count;
    }
  }

  function updateUnderTrackLed(elapsedTime = 0.0, intensity = 1.0) {
    sharedUnderTrackUniforms.uTime.value = elapsedTime;
    sharedUnderTrackUniforms.uIntensity.value = intensity;
    underTrackLedGroup.visible = intensity > 0.005;
  }

  // Spline Debug Group (Toggled in Tweaker)
  const debugGroup = new THREE.Group();
  debugGroup.name = 'SplineDebugOverlay';
  debugGroup.visible = false;

  const centerLinePoints = samples.map((s) =>
    new THREE.Vector3(...s.position).add(new THREE.Vector3(0, 0.002, 0))
  );
  centerLinePoints.push(centerLinePoints[0].clone());
  const centerLineGeo = new THREE.BufferGeometry().setFromPoints(centerLinePoints);
  debugGroup.add(
    new THREE.Line(centerLineGeo, new THREE.LineBasicMaterial({ color: 0xff4da6 }))
  );

  trackGroup.add(debugGroup);

  return {
    trackGroup,
    underTrackLedGroup,
    updateUnderTrackLed,
    setF1StartLights,
    roadGeo,
    debugGroup,
    calibrateTrackCoasterGlb,
  };
}
