import * as THREE from 'three';
import {
  createWaferGroundTextures,
  createFrostingSprinkleTexture,
  createPeppermintSwirlTexture,
  createCandyCaneStripeTexture,
  createMonitorScreenTexture,
  createTrackBannerTexture,
} from './ProceduralTextures.js';

export function createNightWindowTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffc9eb';
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Builds the Sugar Rush ("Corrida Doce") Candy Circuit Board & Landmarks
 * occupying the exact safe zones under and around the 720-sample coaster spline:
 * - Golden Wafer-Biscuit Circuit Board (1.10 x 0.60m, top Y = 0) with frosted rim
 * - Sector 1: Tiered Strawberry & Mint Wafer Cake Platform (flat top at Y = 0.156m)
 * - Cat Helix: Frosted Cupcake & Gummy Bear Monument ([-0.166, 0, -0.108])
 * - Arcade Backdrop: Sugar Rush Candy Arcade Screen ([0.010, 0, -0.245])
 * - Valley Center: Giant Swirling Peppermint Lollipop Arch ([-0.025, 0, -0.045])
 * - Sector 4 Spiral: Caramel-Cola & Soft-Serve Candy Volcano Spire ([0.355, 0, -0.095])
 * - Front Straight: Chocolate Bar & Pastel Macaron Candy Bridge ([-0.161, 0, 0.135])
 * - Sector 5 Pad: Frosted Strawberry Donut Pad ([0.325, 0.0015, 0.135]) + Gumdrop Sundae
 */
export function buildProceduralDeskDiorama(_manifest = {}) {
  const root = new THREE.Group();
  root.name = 'SugarRushCircuitDiorama';

  const { colorTex: waferColorTex, bumpTex: waferBumpTex } = createWaferGroundTextures();
  const pinkFrostingTex = createFrostingSprinkleTexture('#ff1e8a', '#ff7ac8', [
    '#ffffff',
    '#ffb8e6',
    '#6ef5c8',
    '#ffe34d',
  ]);
  const bubblegumFrostingTex = createFrostingSprinkleTexture('#ff70c8', '#ffc4ea', [
    '#ff1488',
    '#ffffff',
    '#ffe34d',
    '#6ef5c8',
  ]);
  const mintFrostingTex = createFrostingSprinkleTexture('#6ef5c8', '#c4ffec', [
    '#ff1e8a',
    '#ffe34d',
    '#ffffff',
    '#ff70c8',
  ]);
  const peppermintTex = createPeppermintSwirlTexture('#ff1880', '#ffffff', 12);
  const candyCaneTex = createCandyCaneStripeTexture('#ff1880', '#fff9fc', '#ff7ac8');
  candyCaneTex.repeat.set(1, 5);
  const arcadeScreenTex = createMonitorScreenTexture();

  const waferMat = new THREE.MeshStandardMaterial({
    map: waferColorTex,
    bumpMap: waferBumpTex,
    bumpScale: 0.0025,
    roughness: 0.66,
    metalness: 0.02,
  });

  const pinkIcingMat = new THREE.MeshPhysicalMaterial({
    map: pinkFrostingTex,
    roughness: 0.22,
    metalness: 0.04,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });

  const bubblegumIcingMat = new THREE.MeshPhysicalMaterial({
    map: bubblegumFrostingTex,
    roughness: 0.22,
    metalness: 0.04,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });

  const mintIcingMat = new THREE.MeshPhysicalMaterial({
    map: mintFrostingTex,
    roughness: 0.24,
    metalness: 0.04,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
  });

  const chocolateMat = new THREE.MeshStandardMaterial({
    color: 0x4b241b,
    roughness: 0.48,
    metalness: 0.06,
  });

  const caramelMat = new THREE.MeshStandardMaterial({
    color: 0xd9843b,
    roughness: 0.35,
    metalness: 0.04,
  });

  const candyCaneMat = new THREE.MeshStandardMaterial({
    map: candyCaneTex,
    roughness: 0.24,
    metalness: 0.04,
  });

  const peppermintMat = new THREE.MeshStandardMaterial({
    map: peppermintTex,
    roughness: 0.20,
    metalness: 0.04,
  });

  const marshmallowMat = new THREE.MeshStandardMaterial({
    color: 0xfff7fc,
    roughness: 0.34,
    metalness: 0.02,
  });

  // -------------------------------------------------------------------------
  // 1. GOLDEN WAFER-BISCUIT CIRCUIT BOARD (Top surface strictly at Y = 0.0m)
  // -------------------------------------------------------------------------
  const boardGeo = new THREE.BoxGeometry(1.10, 0.036, 0.60);
  const boardMesh = new THREE.Mesh(boardGeo, waferMat);
  boardMesh.position.set(0, -0.018, 0);
  boardMesh.receiveShadow = true;
  boardMesh.castShadow = true;
  boardMesh.name = 'WaferCircuitBoard';
  root.add(boardMesh);

  // Piped Hot-Pink & Bubblegum-Pink Frosting Perimeter Trim around Wafer Edge
  const edgeBars = [
    { pos: [0, -0.003, -0.304], size: [1.116, 0.012, 0.012], mat: pinkIcingMat },
    { pos: [0, -0.003, 0.304], size: [1.116, 0.012, 0.012], mat: pinkIcingMat },
    { pos: [-0.554, -0.003, 0], size: [0.012, 0.012, 0.616], mat: bubblegumIcingMat },
    { pos: [0.554, -0.003, 0], size: [0.012, 0.012, 0.616], mat: bubblegumIcingMat },
  ];
  for (const eb of edgeBars) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...eb.size), eb.mat);
    m.position.set(...eb.pos);
    m.receiveShadow = true;
    root.add(m);
  }

  // Cheerful Scattered Rainbow Sugar Sprinkles across Open Wafer Zones
  const sprinkleGeo = new THREE.CapsuleGeometry(0.0014, 0.0045, 4, 6);
  const sprinkleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
  });
  const sprinkleColors = [
    new THREE.Color(0xff1488),
    new THREE.Color(0xff6ec4),
    new THREE.Color(0xffb8e6),
    new THREE.Color(0x6ef5c8),
    new THREE.Color(0xffe047),
  ];
  const sprinkleInstanced = new THREE.InstancedMesh(sprinkleGeo, sprinkleMat, 120);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 120; i++) {
    const sx = (((i * 193 + 37) % 1000) / 1000 - 0.5) * 1.02;
    const sz = (((i * 389 + 71) % 1000) / 1000 - 0.5) * 0.52;
    dummy.position.set(sx, 0.0012, sz);
    dummy.rotation.set(Math.PI / 2, (i * 0.77) % Math.PI, 0);
    dummy.scale.setScalar(0.85 + (i % 4) * 0.15);
    dummy.updateMatrix();
    sprinkleInstanced.setMatrixAt(i, dummy.matrix);
    sprinkleInstanced.setColorAt(i, sprinkleColors[i % sprinkleColors.length]);
  }
  sprinkleInstanced.instanceMatrix.needsUpdate = true;
  if (sprinkleInstanced.instanceColor) sprinkleInstanced.instanceColor.needsUpdate = true;
  root.add(sprinkleInstanced);

  // -------------------------------------------------------------------------
  // 2. SECTOR 1: TIERED WAFER & STRAWBERRY CAKE PLATFORM (Top strictly Y = 0.156m!)
  //    Supports the Sector 1 Coaster Columns at x in [-0.49, -0.23], z in [-0.18, +0.04]
  // -------------------------------------------------------------------------
  const cakeGroup = new THREE.Group();
  cakeGroup.name = 'WaferCakePlatform';
  cakeGroup.position.set(-0.36, 0, -0.07);

  // Base Chocolate Sponge Cake Tier
  const cakeTier1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.074, 0.24),
    chocolateMat
  );
  cakeTier1.position.y = 0.037;
  cakeTier1.castShadow = true;
  cakeTier1.receiveShadow = true;
  cakeGroup.add(cakeTier1);

  // Middle Bubblegum-Pink Frosting Cake Tier
  const cakeTier2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.27, 0.064, 0.23),
    bubblegumIcingMat
  );
  cakeTier2.position.y = 0.106;
  cakeTier2.castShadow = true;
  cakeTier2.receiveShadow = true;
  cakeGroup.add(cakeTier2);

  // Top Wafer Biscuit Deck (upper surface strictly at Y = 0.156m to catch track supports)
  const cakeTopDeck = new THREE.Mesh(
    new THREE.BoxGeometry(0.265, 0.018, 0.225),
    waferMat
  );
  cakeTopDeck.position.y = 0.147;
  cakeTopDeck.castShadow = true;
  cakeTopDeck.receiveShadow = true;
  cakeGroup.add(cakeTopDeck);

  // Strawberry Frosting Edge Trim around the top wafer rim (flush below Y=0.156)
  const cakeRimTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.272, 0.008, 0.232),
    pinkIcingMat
  );
  cakeRimTrim.position.y = 0.141;
  cakeGroup.add(cakeRimTrim);

  // Cute Wafer-Cone Candy Turret Pillars at Rear-Left Outer Corner (clear of track)
  const turretBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.018, 0.16, 16),
    candyCaneMat
  );
  turretBody.position.set(-0.125, 0.08, -0.105);
  turretBody.castShadow = true;
  cakeGroup.add(turretBody);

  const turretRoof = new THREE.Mesh(
    new THREE.ConeGeometry(0.022, 0.042, 16),
    pinkIcingMat
  );
  turretRoof.position.set(-0.125, 0.181, -0.105);
  turretRoof.castShadow = true;
  cakeGroup.add(turretRoof);

  // Prominent "profdeborapaulo" Candy Banner on Front Side of Wafer Cake Platform
  const cakeBannerTex = createTrackBannerTexture('profdeborapaulo', 'CASTELO DOCE', 0);
  const cakeBannerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.21, 0.052),
    new THREE.MeshStandardMaterial({
      map: cakeBannerTex,
      emissiveMap: cakeBannerTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.35,
      roughness: 0.24,
    })
  );
  cakeBannerMesh.position.set(0, 0.095, 0.1165);
  cakeGroup.add(cakeBannerMesh);

  root.add(cakeGroup);

  // -------------------------------------------------------------------------
  // 3. HELIX CENTER: FROSTED GUMMY CUPCAKE MONUMENT ([-0.166, 0, -0.108])
  //    Fits cleanly inside the helix spiral (radius <= 0.036m)
  // -------------------------------------------------------------------------
  const cupcakeMonument = new THREE.Group();
  cupcakeMonument.name = 'HelixCupcakeMonument';
  cupcakeMonument.position.set(-0.166, 0, -0.108);

  const cupBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.030, 0.022, 0.042, 20),
    chocolateMat
  );
  cupBase.position.y = 0.021;
  cupBase.castShadow = true;
  cupBase.receiveShadow = true;
  cupcakeMonument.add(cupBase);

  const frostMound1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 20, 14),
    pinkIcingMat
  );
  frostMound1.scale.set(1.0, 0.72, 1.0);
  frostMound1.position.y = 0.048;
  frostMound1.castShadow = true;
  cupcakeMonument.add(frostMound1);

  const frostSwirl2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 18, 12),
    marshmallowMat
  );
  frostSwirl2.scale.set(1.0, 0.80, 1.0);
  frostSwirl2.position.y = 0.071;
  cupcakeMonument.add(frostSwirl2);

  const monumentCherry = new THREE.Mesh(
    new THREE.SphereGeometry(0.009, 14, 12),
    new THREE.MeshPhysicalMaterial({ color: 0xff1a4b, roughness: 0.15, clearcoat: 1.0 })
  );
  monumentCherry.position.y = 0.091;
  cupcakeMonument.add(monumentCherry);

  root.add(cupcakeMonument);

  // -------------------------------------------------------------------------
  // 4. BACKDROP: SUGAR RUSH CANDY ARCADE SCREEN ([0.010, 0, -0.245])
  // -------------------------------------------------------------------------
  const arcadeGroup = new THREE.Group();
  arcadeGroup.name = 'SugarRushArcadeBillboard';
  arcadeGroup.position.set(0.010, 0, -0.245);

  const standBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.018, 0.08),
    chocolateMat
  );
  standBase.position.y = 0.009;
  standBase.castShadow = true;
  standBase.receiveShadow = true;
  arcadeGroup.add(standBase);

  for (const px of [-0.21, 0.21]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.013, 0.30, 14),
      candyCaneMat
    );
    pillar.position.set(px, 0.15, 0);
    pillar.castShadow = true;
    arcadeGroup.add(pillar);

    // Peppermint lollipop finial on top of billboard posts
    const finial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.008, 22),
      peppermintMat
    );
    finial.rotation.x = Math.PI / 2;
    finial.position.set(px, 0.315, 0);
    arcadeGroup.add(finial);
  }

  // Frosted Pink & Wafer Frame around Display
  const frameBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.24, 0.020),
    pinkIcingMat
  );
  frameBack.position.set(0, 0.20, -0.008);
  frameBack.castShadow = true;
  arcadeGroup.add(frameBack);

  const arcadeScreenMat = new THREE.MeshStandardMaterial({
    map: arcadeScreenTex,
    emissiveMap: arcadeScreenTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.58,
    roughness: 0.22,
    metalness: 0.05,
  });
  const arcadeScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.39, 0.21),
    arcadeScreenMat
  );
  arcadeScreenMesh.position.set(0, 0.20, 0.003);
  arcadeGroup.add(arcadeScreenMesh);

  root.add(arcadeGroup);

  // -------------------------------------------------------------------------
  // 5. VALLEY CENTER: GIANT PEPPERMINT LOLLIPOP & MINT RING ([-0.025, 0, -0.045])
  // -------------------------------------------------------------------------
  const lolliGroup = new THREE.Group();
  lolliGroup.name = 'PeppermintLollipopValley';
  lolliGroup.position.set(-0.025, 0, -0.045);

  const lolliBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.028, 0.012, 18),
    pinkIcingMat
  );
  lolliBase.position.y = 0.006;
  lolliBase.castShadow = true;
  lolliGroup.add(lolliBase);

  const lolliStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0035, 0.11, 12),
    marshmallowMat
  );
  lolliStick.position.y = 0.06;
  lolliStick.castShadow = true;
  lolliGroup.add(lolliStick);

  const lolliHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.009, 24),
    peppermintMat
  );
  lolliHead.rotation.x = Math.PI / 2;
  lolliHead.position.y = 0.125;
  lolliHead.castShadow = true;
  lolliGroup.add(lolliHead);

  // Glowing Mint Candy Ring (preserves micBlueLedRing API)
  const blueLedRingMat = new THREE.MeshStandardMaterial({
    color: 0x6ef5c8,
    emissive: new THREE.Color(0x42f5bc),
    emissiveIntensity: 1.15,
    roughness: 0.2,
  });
  const blueLedRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.0265, 0.0022, 10, 28),
    blueLedRingMat
  );
  blueLedRing.position.y = 0.125;
  lolliGroup.add(blueLedRing);

  root.add(lolliGroup);

  // -------------------------------------------------------------------------
  // 6. SECTOR 4 SPIRAL: CARAMEL-COLA & SOFT-SERVE VOLCANO SPIRE ([0.355, 0, -0.095])
  //    Fits cleanly inside the spiral loop (slender neck <= 0.016m through upper loops)
  // -------------------------------------------------------------------------
  const spireGroup = new THREE.Group();
  spireGroup.name = 'CandyVolcanoSpire';
  spireGroup.position.set(0.355, 0, -0.095);

  const volcanoBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.068, 0.065, 22),
    caramelMat
  );
  volcanoBase.position.y = 0.0325;
  volcanoBase.castShadow = true;
  volcanoBase.receiveShadow = true;
  spireGroup.add(volcanoBase);

  const spireColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.016, 0.28, 16),
    candyCaneMat
  );
  spireColumn.position.y = 0.195;
  spireColumn.castShadow = true;
  spireGroup.add(spireColumn);

  // Soft-Serve Frosted Crown & Warm Golden Candy-Sun Diffuser at Y = 0.35m
  const crownCup = new THREE.Mesh(
    new THREE.ConeGeometry(0.038, 0.034, 18),
    pinkIcingMat
  );
  crownCup.rotation.x = Math.PI;
  crownCup.position.y = 0.335;
  spireGroup.add(crownCup);

  const candySunDiffuserMat = new THREE.MeshStandardMaterial({
    color: 0xfff5d6,
    emissive: new THREE.Color(0xffbe6b),
    emissiveIntensity: 0.95,
    roughness: 0.22,
  });
  const candySunOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 20, 16),
    candySunDiffuserMat
  );
  candySunOrb.position.y = 0.362;
  spireGroup.add(candySunOrb);

  root.add(spireGroup);

  // -------------------------------------------------------------------------
  // 7. FRONT STRAIGHT: CHOCOLATE BAR & MACARON CANDY BRIDGE ([-0.161, 0, 0.135])
  //    Exact safe footprint: 0.475 x 0.018 x 0.150 (under the front straightaway)
  // -------------------------------------------------------------------------
  const chocoBridgeGroup = new THREE.Group();
  chocoBridgeGroup.name = 'ChocolateMacaronBridge';
  chocoBridgeGroup.position.set(-0.161, 0, 0.135);

  const chocoSlab = new THREE.Mesh(
    new THREE.BoxGeometry(0.475, 0.016, 0.150),
    chocolateMat
  );
  chocoSlab.position.y = 0.008;
  chocoSlab.castShadow = true;
  chocoSlab.receiveShadow = true;
  chocoBridgeGroup.add(chocoSlab);

  // Pastel Marshmallow / Macaron Square "Keys" on top of Chocolate Slab
  const candySquareGeo = new THREE.BoxGeometry(0.017, 0.0045, 0.017);
  const candySquareMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.02,
  });
  const cols = 19;
  const rows = 5;
  const macaronInstanced = new THREE.InstancedMesh(candySquareGeo, candySquareMat, cols * rows);
  const pastelPalette = [
    new THREE.Color(0xff1e8a),
    new THREE.Color(0xff6ec4),
    new THREE.Color(0xffa8df),
    new THREE.Color(0x80f5d0),
    new THREE.Color(0xffe878),
  ];
  let mIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(
        -0.215 + c * 0.0238,
        0.0175,
        -0.048 + r * 0.024
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1.0);
      dummy.updateMatrix();
      macaronInstanced.setMatrixAt(mIdx, dummy.matrix);
      macaronInstanced.setColorAt(mIdx, pastelPalette[(r + c) % pastelPalette.length]);
      mIdx++;
    }
  }
  macaronInstanced.instanceMatrix.needsUpdate = true;
  if (macaronInstanced.instanceColor) macaronInstanced.instanceColor.needsUpdate = true;
  macaronInstanced.receiveShadow = true;
  chocoBridgeGroup.add(macaronInstanced);

  root.add(chocoBridgeGroup);

  // -------------------------------------------------------------------------
  // 8. SECTOR 5: FROSTED STRAWBERRY DONUT PAD ([0.325, 0.0015, 0.135])
  //    + GUMDROP SUNDAE INSIDE C-TURN ([0.285, 0.003, 0.115])
  // -------------------------------------------------------------------------
  const donutPad = new THREE.Mesh(
    new THREE.BoxGeometry(0.336, 0.003, 0.261),
    pinkIcingMat
  );
  donutPad.position.set(0.325, 0.0015, 0.135);
  donutPad.receiveShadow = true;
  donutPad.name = 'FrostedDonutPad';
  root.add(donutPad);

  // Cute Swirled Gumdrop & Ice Cream Sundae Sculpture inside C-turn
  const sundaeGroup = new THREE.Group();
  sundaeGroup.name = 'GumdropSundaeSculpture';
  sundaeGroup.position.set(0.285, 0.003, 0.115);

  const sundaeCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.018, 0.020, 18),
    waferMat
  );
  sundaeCup.position.y = 0.010;
  sundaeCup.castShadow = true;
  sundaeGroup.add(sundaeCup);

  const mintScoop = new THREE.Mesh(
    new THREE.SphereGeometry(0.020, 16, 12),
    mintIcingMat
  );
  mintScoop.position.set(-0.007, 0.026, 0.0);
  mintScoop.castShadow = true;
  sundaeGroup.add(mintScoop);

  const pinkScoop = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 16, 12),
    pinkIcingMat
  );
  pinkScoop.position.set(0.009, 0.029, 0.004);
  pinkScoop.castShadow = true;
  sundaeGroup.add(pinkScoop);

  const waferStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0035, 0.044, 10),
    candyCaneMat
  );
  waferStick.position.set(0.012, 0.045, -0.006);
  waferStick.rotation.z = -0.35;
  sundaeGroup.add(waferStick);

  root.add(sundaeGroup);

  // -------------------------------------------------------------------------
  // 9. SUGAR RUSH COTTON-CANDY GLOW BORDER AROUND DONUT PAD (nightGlowGroup)
  // -------------------------------------------------------------------------
  const nightGlowGroup = new THREE.Group();
  nightGlowGroup.name = 'SugarRushPadGlowGroup';

  const padHw = 0.1704;
  const padHd = 0.1329;
  const glowBorderMat = new THREE.MeshBasicMaterial({
    color: 0xff1e8a,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const borderEdges = [
    [0, 0.0022, -padHd, padHw * 2, 0.0025],
    [0, 0.0022, padHd, padHw * 2, 0.0025],
    [-padHw, 0.0022, 0, 0.0025, padHd * 2],
    [padHw, 0.0022, 0, 0.0025, padHd * 2],
  ];
  for (const [bx, by, bz, bw, bd] of borderEdges) {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(bw, bd), glowBorderMat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0.325 + bx, by, 0.135 + bz);
    nightGlowGroup.add(strip);
  }

  // Ground contact shadow plane directly below wafer board
  const contactShadowGroup = new THREE.Group();
  const contactShadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.18, 0.68),
    new THREE.MeshBasicMaterial({
      color: 0x5c1946,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    })
  );
  contactShadowPlane.rotation.x = -Math.PI / 2;
  contactShadowPlane.position.set(0, -0.0365, 0);
  contactShadowGroup.add(contactShadowPlane);
  root.add(contactShadowGroup);

  const glbMicLedMaterials = [blueLedRingMat];
  const goldenWindowMaterials = [];

  function calibrateDeskPropsGlb(_glbScene) {
    // Sugar Rush uses procedural candy landmarks directly
  }

  function updateLightingMaterials(_sunScale = 1.35, lampScale = 1.0) {
    candySunDiffuserMat.emissiveIntensity = 0.65 + 0.55 * lampScale;
    arcadeScreenMat.emissiveIntensity = 0.48 + 0.14 * lampScale;
  }

  function setMonitorHighScoresVisible(_visible) {
    arcadeScreenMat.needsUpdate = true;
  }

  return {
    root,
    nightGlowGroup,
    contactShadowGroup,
    contactShadowPlane,
    micBlueLedRing: blueLedRing,
    glbMicLedMaterials,
    goldenWindowMaterials,
    calibrateDeskPropsGlb,
    updateLightingMaterials,
    setMonitorHighScoresVisible,
  };
}
