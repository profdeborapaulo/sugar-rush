import * as THREE from 'three';
import {
  createFrostingSprinkleTexture,
  createPeppermintSwirlTexture,
  createCandyCaneStripeTexture,
  createWaferGroundTextures,
} from './ProceduralTextures.js';

/**
 * Builds the Open Outdoor Sugar Rush ("Corrida Doce") Candy Kingdom Horizon:
 * - Pastel Cotton-Candy Sky Dome Shader (sky cyan zenith -> cotton-candy pink -> warm cream horizon)
 * - Rolling Pastel Mint & Strawberry Frosting Hills outside the circuit pedestal
 * - Glossy Chocolate-Caramel River Moat & Wafer Biscuit Pedestal Supports
 * - Distant Ice-Cream Cone Mountains, Candy-Cane Arches, Giant Lollipops & Marshmallow Clouds
 * Preserves exact return contract expected by main.js.
 */
export function buildRoomEnvironment(scene, settings = {}) {
  const roomRoot = new THREE.Group();
  roomRoot.name = 'SugarRushCandyKingdomRoot';

  const proceduralRoomGroup = new THREE.Group();
  proceduralRoomGroup.name = 'CandyKingdomOutdoorHorizon';
  roomRoot.add(proceduralRoomGroup);

  const roomContactAoGroup = new THREE.Group();
  roomContactAoGroup.name = 'CandyKingdomFloorShadows';
  roomRoot.add(roomContactAoGroup);

  const trackedMaterials = {
    filamentMaterials: [],
    facadeMaterials: [],
  };

  // -------------------------------------------------------------------------
  // 1. COTTON-CANDY SKY DOME (Seamless outdoor Candy Kingdom backdrop)
  // -------------------------------------------------------------------------
  const skyDomeGeo = new THREE.SphereGeometry(5.8, 36, 22);
  const skyDomeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uZenithCol: { value: new THREE.Color(0x78dcff) },
      uMidCol: { value: new THREE.Color(0xffc6ec) },
      uHorizonCol: { value: new THREE.Color(0xfff1dc) },
      uGroundCol: { value: new THREE.Color(0xffb5dd) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenithCol;
      uniform vec3 uMidCol;
      uniform vec3 uHorizonCol;
      uniform vec3 uGroundCol;
      varying vec3 vDir;
      void main() {
        float h = vDir.y;
        vec3 col;
        if (h >= 0.0) {
          vec3 lowMix = mix(uHorizonCol, uMidCol, smoothstep(0.0, 0.28, h));
          col = mix(lowMix, uZenithCol, smoothstep(0.22, 0.82, h));
        } else {
          col = mix(uHorizonCol, uGroundCol, smoothstep(0.0, -0.35, h));
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
  skyDome.name = 'CandySkyDome';
  proceduralRoomGroup.add(skyDome);

  // -------------------------------------------------------------------------
  // 2. ROLLING MINT & STRAWBERRY FROSTING HILLS GROUND (Y = -0.73)
  // -------------------------------------------------------------------------
  const mintTerrainTex = createFrostingSprinkleTexture('#98f7d8', '#d4ffef', [
    '#ff5cb3',
    '#ffe34d',
    '#ffffff',
  ]);
  mintTerrainTex.repeat.set(6, 6);

  const groundGeo = new THREE.PlaneGeometry(11.5, 11.5, 64, 64);
  groundGeo.rotateX(-Math.PI / 2);
  const gPos = groundGeo.attributes.position;
  for (let i = 0; i < gPos.count; i++) {
    const gx = gPos.getX(i);
    const gz = gPos.getZ(i);
    const dist = Math.hypot(gx, gz);
    // Keep center valley flat around pedestal & chocolate moat, roll gently into hills further out
    const hillMask = THREE.MathUtils.smoothstep(dist, 0.95, 2.8);
    const h =
      hillMask *
      (0.16 * Math.sin(gx * 1.45 + 0.4) * Math.cos(gz * 1.35) +
        0.12 * Math.sin(dist * 1.8 - 1.1) +
        0.14);
    gPos.setY(i, -0.73 + h);
  }
  groundGeo.computeVertexNormals();

  const groundMesh = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({
      map: mintTerrainTex,
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.02,
    })
  );
  groundMesh.receiveShadow = true;
  groundMesh.name = 'FrostingHillsGround';
  proceduralRoomGroup.add(groundMesh);

  // -------------------------------------------------------------------------
  // 3. CHOCOLATE-CARAMEL MOAT & WAFER PEDESTAL LEGS UNDER CIRCUIT BOARD
  // -------------------------------------------------------------------------
  const chocolateRiverMat = new THREE.MeshPhysicalMaterial({
    color: 0x4d2218,
    roughness: 0.14,
    metalness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const moatMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.68, 1.02, 56),
    chocolateRiverMat
  );
  moatMesh.rotation.x = -Math.PI / 2;
  moatMesh.position.y = -0.722;
  moatMesh.receiveShadow = true;
  proceduralRoomGroup.add(moatMesh);

  const { colorTex: waferTex } = createWaferGroundTextures();
  const pedestalMat = new THREE.MeshStandardMaterial({
    map: waferTex,
    roughness: 0.68,
    metalness: 0.02,
  });
  const candyCaneTex = createCandyCaneStripeTexture('#ff3b9a', '#ffffff', '#6ef5c8');
  candyCaneTex.repeat.set(1, 10);
  const candyCaneMat = new THREE.MeshStandardMaterial({
    map: candyCaneTex,
    roughness: 0.25,
  });

  // Central chocolate-wafer pedestal & 4 candy-cane corner legs supporting the board
  const centerPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.30, 0.70, 24),
    pedestalMat
  );
  centerPedestal.position.set(0, -0.38, 0);
  proceduralRoomGroup.add(centerPedestal);

  for (const [lx, lz] of [
    [-0.46, -0.24],
    [0.46, -0.24],
    [-0.46, 0.24],
    [0.46, 0.24],
  ]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.036, 0.70, 14),
      candyCaneMat
    );
    leg.position.set(lx, -0.38, lz);
    proceduralRoomGroup.add(leg);
  }

  // -------------------------------------------------------------------------
  // 4. DISTANT SUGAR RUSH CANDY LANDMARKS (Ice Cream Mountains, Lollipops, Clouds)
  // -------------------------------------------------------------------------
  const pinkFrostingMat = new THREE.MeshStandardMaterial({
    map: createFrostingSprinkleTexture('#ff62b5', '#ffb0db', ['#ffffff', '#ffe34d', '#6ef5c8']),
    roughness: 0.45,
  });
  const lemonIcingMat = new THREE.MeshStandardMaterial({
    color: 0xffe670,
    roughness: 0.42,
  });
  const marshmallowMat = new THREE.MeshStandardMaterial({
    color: 0xfff8fc,
    roughness: 0.48,
  });
  const peppermintTex = createPeppermintSwirlTexture('#ff2970', '#ffffff', 10);
  const peppermintMat = new THREE.MeshStandardMaterial({
    map: peppermintTex,
    roughness: 0.22,
  });

  // Distant Ice-Cream Cone Mountains around the horizon (r ~ 2.4m .. 3.8m)
  const mountainSpecs = [
    { x: -2.4, z: -2.2, r: 0.62, h: 1.55, capMat: pinkFrostingMat },
    { x: 0.1, z: -2.9, r: 0.78, h: 1.85, capMat: marshmallowMat },
    { x: 2.5, z: -2.1, r: 0.66, h: 1.62, capMat: pinkFrostingMat },
    { x: -3.1, z: 0.4, r: 0.65, h: 1.48, capMat: lemonIcingMat },
    { x: 3.1, z: 0.6, r: 0.68, h: 1.52, capMat: marshmallowMat },
    { x: -2.1, z: 2.7, r: 0.72, h: 1.68, capMat: pinkFrostingMat },
    { x: 2.2, z: 2.6, r: 0.70, h: 1.60, capMat: lemonIcingMat },
  ];
  for (const mt of mountainSpecs) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(mt.r, mt.h, 24),
      pedestalMat
    );
    cone.position.set(mt.x, -0.73 + mt.h * 0.5, mt.z);
    proceduralRoomGroup.add(cone);

    const frostingCap = new THREE.Mesh(
      new THREE.SphereGeometry(mt.r * 0.44, 18, 12),
      mt.capMat
    );
    frostingCap.position.set(mt.x, -0.73 + mt.h * 0.90, mt.z);
    proceduralRoomGroup.add(frostingCap);
  }

  // Giant Peppermint Lollipop Trees surrounding the valley (outside track perimeter r > 1.15m)
  const lollipopRing = [
    { x: -1.18, z: -0.95, h: 0.85, r: 0.16, rotY: 0.35 },
    { x: -1.35, z: 0.25, h: 0.92, r: 0.18, rotY: 1.1 },
    { x: -0.92, z: 1.18, h: 0.78, r: 0.15, rotY: -0.4 },
    { x: 0.98, z: 1.22, h: 0.88, r: 0.17, rotY: 0.6 },
    { x: 1.38, z: 0.12, h: 0.95, r: 0.19, rotY: 1.4 },
    { x: 1.18, z: -1.05, h: 0.84, r: 0.16, rotY: -0.3 },
    { x: -0.55, z: -1.32, h: 0.90, r: 0.17, rotY: 0.15 },
    { x: 0.58, z: -1.28, h: 0.86, r: 0.16, rotY: -0.2 },
  ];
  for (const l of lollipopRing) {
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.020, l.h, 12),
      marshmallowMat
    );
    stick.position.set(l.x, -0.73 + l.h * 0.5, l.z);
    proceduralRoomGroup.add(stick);

    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(l.r, l.r, 0.042, 24),
      peppermintMat
    );
    head.rotation.x = Math.PI / 2;
    head.rotation.z = l.rotY;
    head.position.set(l.x, -0.73 + l.h + l.r * 0.72, l.z);
    proceduralRoomGroup.add(head);
  }

  // Candy-Cane Archways in the distance
  const archPositions = [
    { x: -1.65, z: -1.55, rotY: 0.7 },
    { x: 1.72, z: -1.48, rotY: -0.65 },
  ];
  for (const a of archPositions) {
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.34, 0, 0),
      new THREE.Vector3(-0.34, 0.65, 0),
      new THREE.Vector3(0, 0.96, 0),
      new THREE.Vector3(0.34, 0.65, 0),
      new THREE.Vector3(0.34, 0, 0),
    ]);
    const archMesh = new THREE.Mesh(
      new THREE.TubeGeometry(archCurve, 32, 0.045, 12, false),
      candyCaneMat
    );
    archMesh.position.set(a.x, -0.73, a.z);
    archMesh.rotation.y = a.rotY;
    proceduralRoomGroup.add(archMesh);
  }

  // Fluffy 3D Marshmallow Clouds floating in the Cotton-Candy Sky
  const cloudSpots = [
    { x: -1.8, y: 1.15, z: -2.4, s: 1.2 },
    { x: 0.4, y: 1.35, z: -2.8, s: 1.4 },
    { x: 2.1, y: 1.10, z: -2.1, s: 1.1 },
    { x: -2.4, y: 1.22, z: 1.2, s: 1.15 },
    { x: 2.3, y: 1.25, z: 1.4, s: 1.25 },
  ];
  for (const cs of cloudSpots) {
    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(cs.x, cs.y, cs.z);
    cloudGroup.scale.setScalar(cs.s);
    for (const [cx, cy, cz, cr] of [
      [0, 0.05, 0, 0.22],
      [-0.18, 0.0, 0.03, 0.16],
      [0.19, 0.01, -0.02, 0.17],
      [0.04, 0.12, -0.05, 0.15],
    ]) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(cr, 14, 10), marshmallowMat);
      puff.position.set(cx, cy, cz);
      cloudGroup.add(puff);
    }
    proceduralRoomGroup.add(cloudGroup);
  }

  // Soft Ground Shadow under Central Pedestal
  const aoDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 32),
    new THREE.MeshBasicMaterial({
      color: 0x5c2440,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
  );
  aoDisc.rotation.x = -Math.PI / 2;
  aoDisc.position.set(0, -0.725, 0);
  roomContactAoGroup.add(aoDisc);

  // Kept light references for full compatibility with main.js
  const edisonPointLight = new THREE.PointLight(0xffb8e6, 0.35, 3.2, 1.4);
  edisonPointLight.position.set(-0.24, 0.45, 2.10);
  edisonPointLight.castShadow = false;
  roomRoot.add(edisonPointLight);

  const roomBounceLight = new THREE.PointLight(0x88f7dc, 0.40, 2.4, 1.5);
  roomBounceLight.position.set(-0.85, 0.28, 0.12);
  roomBounceLight.castShadow = false;
  roomRoot.add(roomBounceLight);

  function updateRoomLighting(sunScale = 1.35, lampScale = 1.0) {
    edisonPointLight.intensity = 0.25 * Math.max(0.4, lampScale);
    roomBounceLight.intensity = 0.28 * Math.max(0.4, sunScale);
  }

  updateRoomLighting(settings.sunIntensity ?? 1.35, settings.lampIntensity ?? 1.0);

  if (scene) {
    scene.add(roomRoot);
  }

  return {
    roomRoot,
    proceduralRoomGroup,
    roomContactAoGroup,
    edisonPointLight,
    roomBounceLight,
    calibrateRoomEnvironmentGlb: (_glbScene) => {},
    updateRoomLighting,
  };
}
