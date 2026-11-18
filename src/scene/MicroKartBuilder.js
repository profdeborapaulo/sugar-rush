import * as THREE from 'three';
import {
  createFrostingSprinkleTexture,
  createPeppermintSwirlTexture,
  createCandyCaneStripeTexture,
  createNameplateDecalTexture,
} from './ProceduralTextures.js';

/**
 * Builds Vanellope von Schweetz's 1:87 Sugar Rush ("Corrida Doce") Candy Go-Kart
 * customized with the player's name "profdeborapaulo" prominently displayed on the
 * rear spoiler, rear bumper, front hood, and side pods.
 * Preserves the exact local bounding envelope (~18mm x 12mm x 8mm, +Z forward)
 * and full spark/nitro trail/exhaust/steering API.
 */
export function buildMicroKart() {
  const kartRoot = new THREE.Group();
  kartRoot.name = 'VanellopeCandyKartRoot';

  const chassisGroup = new THREE.Group();
  chassisGroup.name = 'KartChassisBody';
  kartRoot.add(chassisGroup);

  // -------------------------------------------------------------------------
  // PROCEDURAL CANDY TEXTURES & MATERIALS
  // -------------------------------------------------------------------------
  const mintSprinkleTex = createFrostingSprinkleTexture('#6ef5c8', '#b8ffea', [
    '#ff3b9a',
    '#ffe34d',
    '#ffffff',
    '#ff5938',
    '#48b8ff',
  ]);
  const pinkSprinkleTex = createFrostingSprinkleTexture('#ff1a85', '#ff78c8', [
    '#ffffff',
    '#ffb8e6',
    '#6ef5c8',
    '#ffe34d',
  ]);
  const peppermintWheelTex = createPeppermintSwirlTexture('#ff1480', '#ffffff', 10);
  const candyCaneTex = createCandyCaneStripeTexture('#ff1880', '#fff8fc', '#ff7ac8');
  candyCaneTex.repeat.set(1, 3);

  const nameplateTex = createNameplateDecalTexture('profdeborapaulo', {
    bgTop: '#ff1a85',
    bgBottom: '#b80a62',
    borderCol: '#ffffff',
    outlineCol: '#380923',
    accentCol: '#ff9ce0',
  });
  const hoodNameplateTex = createNameplateDecalTexture('profdeborapaulo', {
    bgTop: '#ff66c4',
    bgBottom: '#d91679',
    borderCol: '#ffffff',
    outlineCol: '#2e0622',
    accentCol: '#6ef5c8',
  });

  // Vanellope Mint Frosting Chassis
  const mintFrostingMat = new THREE.MeshPhysicalMaterial({
    map: mintSprinkleTex,
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
  });

  // Strawberry Pink Icing Trim / Fenders / Side Bumpers
  const strawberryIcingMat = new THREE.MeshPhysicalMaterial({
    map: pinkSprinkleTex,
    color: 0xffffff,
    roughness: 0.24,
    metalness: 0.04,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
  });

  // Golden Toasted Wafer Biscuit (Floorpan, Wing Endplates & Spoiler Deck)
  const waferMat = new THREE.MeshStandardMaterial({
    color: 0xe6a65c,
    roughness: 0.72,
    metalness: 0.02,
  });

  // Rich Chocolate Cookie Cup / Frame accents
  const chocolateMat = new THREE.MeshStandardMaterial({
    color: 0x4b241b,
    roughness: 0.56,
    metalness: 0.06,
  });

  // Whipped Cream / Marshmallow Icing
  const marshmallowMat = new THREE.MeshStandardMaterial({
    color: 0xfff8fc,
    roughness: 0.30,
    metalness: 0.02,
  });

  // Candy-Cane Exhaust Pipes & Steering Shaft
  const candyCaneMat = new THREE.MeshStandardMaterial({
    map: candyCaneTex,
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.08,
  });

  // Peppermint Swirl Hubcaps
  const peppermintRimMat = new THREE.MeshStandardMaterial({
    map: peppermintWheelTex,
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.05,
  });

  // Chocolate Frosted Donut Tire Dough
  const donutDoughMat = new THREE.MeshStandardMaterial({
    color: 0xc97b3e,
    roughness: 0.68,
    metalness: 0.02,
  });

  const donutGlazeMat = new THREE.MeshPhysicalMaterial({
    map: pinkSprinkleTex,
    color: 0xffffff,
    roughness: 0.20,
    metalness: 0.04,
    clearcoat: 0.85,
  });

  // Crisp Readable Nameplate Materials ("profdeborapaulo")
  const rearNameplateMat = new THREE.MeshStandardMaterial({
    map: nameplateTex,
    emissiveMap: nameplateTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.22,
    roughness: 0.22,
    metalness: 0.06,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const hoodNameplateMat = new THREE.MeshStandardMaterial({
    map: hoodNameplateTex,
    emissiveMap: hoodNameplateTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.20,
    roughness: 0.22,
    metalness: 0.06,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  // Soft multi-layered local contact-shadow decal directly under kart & 4 donut tires
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d');
  sCtx.clearRect(0, 0, 256, 256);

  sCtx.save();
  sCtx.translate(128, 128);
  sCtx.scale(0.86, 1.08);
  const penumbraGrad = sCtx.createRadialGradient(0, 0, 14, 0, 0, 112);
  penumbraGrad.addColorStop(0.0, 'rgba(32, 8, 28, 0.72)');
  penumbraGrad.addColorStop(0.55, 'rgba(32, 8, 28, 0.48)');
  penumbraGrad.addColorStop(1.0, 'rgba(32, 8, 28, 0.0)');
  sCtx.fillStyle = penumbraGrad;
  sCtx.beginPath();
  sCtx.arc(0, 0, 112, 0, Math.PI * 2);
  sCtx.fill();
  sCtx.restore();

  for (const [wx, wz] of [
    [-0.28, -0.22],
    [+0.28, -0.22],
    [-0.28, +0.23],
    [+0.28, +0.23],
  ]) {
    const cx = 128 + wx * 256;
    const cy = 128 + wz * 256;
    sCtx.save();
    sCtx.translate(cx, cy);
    sCtx.scale(0.82, 1.28);
    const wGrad = sCtx.createRadialGradient(0, 0, 4, 0, 0, 34);
    wGrad.addColorStop(0.0, 'rgba(20, 4, 18, 0.84)');
    wGrad.addColorStop(0.55, 'rgba(20, 4, 18, 0.52)');
    wGrad.addColorStop(1.0, 'rgba(20, 4, 18, 0.0)');
    sCtx.fillStyle = wGrad;
    sCtx.beginPath();
    sCtx.arc(0, 0, 34, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.restore();
  }

  const kartShadowTex = new THREE.CanvasTexture(shadowCanvas);
  const kartShadowQuad = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0175, 0.0240),
    new THREE.MeshBasicMaterial({
      map: kartShadowTex,
      transparent: true,
      opacity: 0.90,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -8,
      polygonOffsetUnits: -8,
    })
  );
  kartShadowQuad.rotation.x = -Math.PI / 2;
  kartShadowQuad.position.set(0, 0.00072, -0.0002);
  kartShadowQuad.castShadow = false;
  kartShadowQuad.receiveShadow = false;
  kartRoot.add(kartShadowQuad);

  // Track procedural groups/meshes for instant Cockpit View 2 hiding
  const proceduralParts = [];
  function addPart(obj) {
    chassisGroup.add(obj);
    proceduralParts.push(obj);
    return obj;
  }

  // -------------------------------------------------------------------------
  // 1. WAFER BISCUIT FLOORPAN, MINT FROSTED BODY, STRAWBERRY ICING FENDERS
  // -------------------------------------------------------------------------
  const floorPan = addPart(
    new THREE.Mesh(new THREE.BoxGeometry(0.0084, 0.0009, 0.0158), waferMat)
  );
  floorPan.position.set(0, 0.0014, 0);

  // Mint Frosted Curved Nose Fairing (+Z Front)
  const noseBody = addPart(
    new THREE.Mesh(new THREE.BoxGeometry(0.0084, 0.0020, 0.0050), mintFrostingMat)
  );
  noseBody.position.set(0, 0.0023, 0.0066);
  noseBody.rotation.x = 0.22;

  // Rounded Strawberry Icing Front Bumper Lip (Vanellope bumper candy bar)
  const frontBumper = addPart(
    new THREE.Mesh(new THREE.CapsuleGeometry(0.00075, 0.0074, 6, 12), strawberryIcingMat)
  );
  frontBumper.rotation.z = Math.PI / 2;
  frontBumper.position.set(0, 0.00175, 0.0089);

  // Candy Gumdrop Headlights (Lemon Yellow glowing sugar drops)
  const candyHeadlightMat = new THREE.MeshStandardMaterial({
    color: 0xfff5aa,
    emissive: new THREE.Color(0xffea75),
    emissiveIntensity: 1.55,
    roughness: 0.14,
    toneMapped: false,
  });
  for (const hx of [-0.0029, 0.0029]) {
    const headlamp = addPart(
      new THREE.Mesh(new THREE.SphereGeometry(0.00078, 14, 10), candyHeadlightMat)
    );
    headlamp.scale.set(1.0, 0.85, 0.72);
    headlamp.position.set(hx, 0.00255, 0.00855);
  }

  // Custom Nameplate Decal #1: Front Hood ("profdeborapaulo")
  const frontDecal = addPart(
    new THREE.Mesh(new THREE.PlaneGeometry(0.0064, 0.0018), hoodNameplateMat)
  );
  frontDecal.position.set(0, 0.00338, 0.00645);
  frontDecal.rotation.set(-Math.PI / 2 + 0.22, 0, Math.PI);

  // Left & Right Mint Side-Pods + Strawberry Icing Rails + Side Nameplates
  for (const sx of [-1, 1]) {
    const sidePod = addPart(
      new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.0024, 0.0078), mintFrostingMat)
    );
    sidePod.position.set(sx * 0.0044, 0.00245, -0.0004);

    const sideIcingTrim = addPart(
      new THREE.Mesh(new THREE.CapsuleGeometry(0.00055, 0.0066, 5, 10), strawberryIcingMat)
    );
    sideIcingTrim.rotation.x = Math.PI / 2;
    sideIcingTrim.position.set(sx * 0.00565, 0.00225, -0.0004);

    // Side-pod "profdeborapaulo" badge
    const sideNameplate = addPart(
      new THREE.Mesh(new THREE.PlaneGeometry(0.0064, 0.0015), rearNameplateMat)
    );
    sideNameplate.position.set(sx * 0.00572, 0.00285, -0.0004);
    sideNameplate.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  // -------------------------------------------------------------------------
  // 2. CUPCAKE REAR ENGINE DOME + CHERRY + WAFER SPOILER ("profdeborapaulo")
  // -------------------------------------------------------------------------
  const cupcakeEngineGroup = addPart(new THREE.Group());
  cupcakeEngineGroup.position.set(0, 0.0022, -0.0049);

  // Chocolate cupcake base cup
  const cupcakeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0022, 0.00165, 0.0022, 16),
    chocolateMat
  );
  cupcakeBase.position.y = 0.0011;
  cupcakeEngineGroup.add(cupcakeBase);

  // Strawberry whipped frosting mound on engine
  const cupcakeFrosting = new THREE.Mesh(
    new THREE.SphereGeometry(0.00225, 16, 12),
    strawberryIcingMat
  );
  cupcakeFrosting.scale.set(1.05, 0.72, 1.05);
  cupcakeFrosting.position.y = 0.00225;
  cupcakeEngineGroup.add(cupcakeFrosting);

  // Glossy Marshmallow Whipped Swirl + Red Maraschino Cherry on top
  const cherryTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.00072, 12, 10),
    new THREE.MeshPhysicalMaterial({
      color: 0xff1744,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );
  cherryTop.position.set(0, 0.00395, 0);
  cupcakeEngineGroup.add(cherryTop);

  // Wafer Rear Spoiler Struts + Wide Candy Spoiler Wing
  for (const wx of [-0.0034, 0.0034]) {
    const wingStrut = addPart(
      new THREE.Mesh(new THREE.BoxGeometry(0.0007, 0.0038, 0.0016), waferMat)
    );
    wingStrut.position.set(wx, 0.0046, -0.0072);
    wingStrut.rotation.x = -0.18;
  }

  const rearWingGroup = addPart(new THREE.Group());
  rearWingGroup.position.set(0, 0.0067, -0.0076);
  rearWingGroup.rotation.x = -0.22;

  const wingDeck = new THREE.Mesh(
    new THREE.BoxGeometry(0.0112, 0.0008, 0.0029),
    waferMat
  );
  rearWingGroup.add(wingDeck);

  // Strawberry icing border on wing endplates
  for (const ex of [-0.0056, 0.0056]) {
    const endplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.0006, 0.0022, 0.0032),
      strawberryIcingMat
    );
    endplate.position.set(ex, 0.0002, 0);
    rearWingGroup.add(endplate);
  }

  // Prominent "profdeborapaulo" Wing Banner facing UP & BACK right at Chase Cam 1!
  const wingTopNameplate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0106, 0.0026),
    rearNameplateMat
  );
  wingTopNameplate.position.set(0, 0.00044, 0);
  wingTopNameplate.rotation.set(-Math.PI / 2, 0, Math.PI);
  rearWingGroup.add(wingTopNameplate);

  // Angled Rear Spoiler Billboard ("profdeborapaulo") facing straight backward (-Z)
  const wingBackNameplate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0108, 0.0022),
    rearNameplateMat
  );
  wingBackNameplate.position.set(0, -0.0005, -0.00155);
  wingBackNameplate.rotation.y = Math.PI;
  rearWingGroup.add(wingBackNameplate);

  // Rear Bumper Plate ("profdeborapaulo") directly below the engine between tail lights
  const rearBumperPlate = addPart(
    new THREE.Mesh(new THREE.BoxGeometry(0.0054, 0.0015, 0.0005), marshmallowMat)
  );
  rearBumperPlate.position.set(0, 0.0023, -0.0083);

  const rearBumperDecal = addPart(
    new THREE.Mesh(new THREE.PlaneGeometry(0.0052, 0.00135), rearNameplateMat)
  );
  rearBumperDecal.position.set(0, 0.0023, -0.00858);
  rearBumperDecal.rotation.y = Math.PI;

  // -------------------------------------------------------------------------
  // 3. TWIN CANDY-CANE EXHAUST PIPES + VOLUMETRIC MACH-DIAMOND JET PLUMES
  // -------------------------------------------------------------------------
  function createExhaustFlameMaterial(pipePhase) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uIntensity: { value: 1.0 },
        uPhase: { value: pipePhase },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPhase;
        varying float vPlumeU;
        varying float vRadialR;
        varying vec3 vLocalPos;
        varying vec3 vViewNormal;
        varying vec3 vViewPos;
        void main() {
          float u = clamp(-position.z / 0.0052, 0.0, 1.0);
          vPlumeU = u;
          vRadialR = clamp(length(position.xy) / 0.00078, 0.0, 1.0);
          vLocalPos = position;

          float flutter = u * u * 0.00022;
          vec3 displaced = position;
          displaced.x += sin(u * 18.0 - uTime * 48.0 + uPhase) * flutter;
          displaced.y += cos(u * 15.0 - uTime * 42.0 + uPhase * 1.7) * flutter * 0.85;

          vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
          vViewPos = -mvPos.xyz;
          vViewNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uPhase;
        varying float vPlumeU;
        varying float vRadialR;
        varying vec3 vLocalPos;
        varying vec3 vViewNormal;
        varying vec3 vViewPos;
        void main() {
          float u = clamp(vPlumeU, 0.0, 1.0);
          vec3 viewDir = normalize(vViewPos);
          float ndotv = abs(dot(normalize(vViewNormal), viewDir));
          float viewWeight = 0.58 + 0.42 * sqrt(clamp(ndotv, 0.0, 1.0));
          float radialCore = exp(-vRadialR * vRadialR * (2.1 + u * 2.4));
          float radialMask = radialCore * viewWeight;

          float angle = atan(vLocalPos.y, vLocalPos.x);
          float turb1 = sin(u * 22.0 - uTime * 56.0 + angle * 2.0 + uPhase);
          float turb2 = cos(u * 35.0 - uTime * 74.0 - angle * 3.0 + uPhase * 1.3);
          float turbulence = 0.82 + 0.18 * (turb1 * 0.6 + turb2 * 0.4);

          float machWave = max(0.0, cos(u * 15.5 - uTime * 34.0 + uPhase * 0.5));
          float machDiamond = pow(machWave, 3.2) * smoothstep(0.85, 0.04, u) * exp(-vRadialR * vRadialR * 3.6);

          float tipCut = clamp(1.0 - u + (turb1 * 0.11 + turb2 * 0.07) * u, 0.0, 1.0);
          float axialEnv = (0.35 + 0.65 * smoothstep(0.0, 0.08, u)) * pow(tipCut, 1.45);

          // Sugar Rush Mint-Cyan + Bubblegum Pink + White-Hot Fizz Jet
          vec3 mintFizz = vec3(0.32, 1.25, 1.15);
          vec3 whiteHot = vec3(1.55, 1.48, 1.38);
          vec3 cottonPink = vec3(1.48, 0.36, 0.92);
          vec3 colaAmber = vec3(1.35, 0.62, 0.18);

          vec3 baseCol = mix(mintFizz, cottonPink, smoothstep(0.06, 0.42, u));
          baseCol = mix(baseCol, colaAmber, smoothstep(0.48, 0.90, u));
          float coreHotness = clamp(radialCore * (1.0 - u * 0.52) + machDiamond * 0.90, 0.0, 1.0);
          vec3 flameRgb = mix(baseCol, whiteHot, pow(coreHotness, 1.35));

          float alpha = clamp(axialEnv * radialMask * turbulence * uIntensity * 1.45, 0.0, 1.0);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(flameRgb * alpha * 1.35, alpha);
        }
      `,
    });
  }

  function buildExhaustJetGeometry() {
    const outerCone = new THREE.CylinderGeometry(0.00072, 0.00022, 0.0052, 16, 8, true);
    outerCone.rotateX(Math.PI / 2);
    outerCone.translate(0, 0, -0.0026);

    const innerCore = new THREE.CylinderGeometry(0.00046, 0.00012, 0.0040, 14, 6, true);
    innerCore.rotateX(Math.PI / 2);
    innerCore.translate(0, 0, -0.0020);

    const finA = new THREE.PlaneGeometry(0.00145, 0.0050, 1, 6);
    finA.rotateX(Math.PI / 2);
    finA.rotateZ(0.66);
    finA.translate(0, 0, -0.0025);

    const finB = new THREE.PlaneGeometry(0.00145, 0.0050, 1, 6);
    finB.rotateX(Math.PI / 2);
    finB.rotateZ(-0.66);
    finB.translate(0, 0, -0.0025);

    const nozzleDisc = new THREE.CircleGeometry(0.00074, 16);
    nozzleDisc.rotateY(Math.PI);
    nozzleDisc.translate(0, 0, -0.00025);

    return { outerCone, innerCore, finA, finB, nozzleDisc };
  }
  const sharedJetGeos = buildExhaustJetGeometry();

  const flameCones = [];
  for (let i = 0; i < 2; i++) {
    const ex = i === 0 ? -0.00145 : 0.00145;
    const pipe = addPart(
      new THREE.Mesh(new THREE.CylinderGeometry(0.00056, 0.00062, 0.0032, 16), candyCaneMat)
    );
    pipe.rotation.x = Math.PI / 2 + 0.12;
    pipe.position.set(ex, 0.00185, -0.0076);

    const plumeGroup = new THREE.Group();
    plumeGroup.position.set(ex, 0.00178, -0.00895);
    plumeGroup.rotation.x = 0.18;
    plumeGroup.visible = false;

    const jetMat = createExhaustFlameMaterial(i * 2.15);
    for (const geo of [
      sharedJetGeos.outerCone,
      sharedJetGeos.innerCore,
      sharedJetGeos.finA,
      sharedJetGeos.finB,
      sharedJetGeos.nozzleDisc,
    ]) {
      const m = new THREE.Mesh(geo, jetMat);
      m.frustumCulled = false;
      plumeGroup.add(m);
    }

    plumeGroup.userData.jetMat = jetMat;
    plumeGroup.userData.pipeIndex = i;
    chassisGroup.add(plumeGroup);
    flameCones.push(plumeGroup);
  }

  // Glowing Strawberry-Ruby Candy Tail-Light Halos
  const tailGlowCanvas = document.createElement('canvas');
  tailGlowCanvas.width = 128;
  tailGlowCanvas.height = 128;
  const tgCtx = tailGlowCanvas.getContext('2d');
  const tgGrad = tgCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
  tgGrad.addColorStop(0.0, 'rgba(255, 36, 130, 0.90)');
  tgGrad.addColorStop(0.36, 'rgba(255, 16, 95, 0.52)');
  tgGrad.addColorStop(0.75, 'rgba(220, 0, 60, 0.16)');
  tgGrad.addColorStop(1.0, 'rgba(180, 0, 40, 0.0)');
  tgCtx.fillStyle = tgGrad;
  tgCtx.fillRect(0, 0, 128, 128);
  const tailGlowTex = new THREE.CanvasTexture(tailGlowCanvas);

  const tailGlowGeo = new THREE.PlaneGeometry(0.0036, 0.0022);
  const tailGlowMat = new THREE.MeshBasicMaterial({
    map: tailGlowTex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  const tailLightGlowPlanes = [];
  const rubyGumdropMat = new THREE.MeshStandardMaterial({
    color: 0xff1e7a,
    emissive: new THREE.Color(0xff1058),
    emissiveIntensity: 1.5,
    roughness: 0.18,
    toneMapped: false,
  });

  for (const tx of [-0.0035, 0.0035]) {
    const gumdropLamp = addPart(
      new THREE.Mesh(new THREE.SphereGeometry(0.00072, 12, 10), rubyGumdropMat)
    );
    gumdropLamp.position.set(tx, 0.00245, -0.0084);

    const tailGlowPlane = new THREE.Mesh(tailGlowGeo, tailGlowMat);
    tailGlowPlane.position.set(tx, 0.00245, -0.00915);
    tailGlowPlane.rotation.y = Math.PI;
    tailGlowPlane.castShadow = false;
    tailGlowPlane.receiveShadow = false;
    chassisGroup.add(tailGlowPlane);
    tailLightGlowPlanes.push(tailGlowPlane);
  }

  const sparkFireLight = new THREE.PointLight(0xff4da6, 0.0, 0.045, 0.0);
  sparkFireLight.position.set(0, 0.0028, -0.009);
  chassisGroup.add(sparkFireLight);

  let fireLightMultiplier = 0.12;
  let fireLightPreviewTimer = 0.0;
  function setFireLightMultiplier(val, triggerPreview = true) {
    fireLightMultiplier = Math.max(0.0, Number(val) || 0.0);
    if (triggerPreview) {
      fireLightPreviewTimer = 0.85;
    }
  }

  // -------------------------------------------------------------------------
  // 4. VANELLOPE DRIVER (Mint Hoodie, Dark Ponytail + Candy Bow & Hairpins)
  // -------------------------------------------------------------------------
  const seat = addPart(
    new THREE.Mesh(new THREE.BoxGeometry(0.0044, 0.0040, 0.0038), chocolateMat)
  );
  seat.position.set(0, 0.0034, -0.0014);
  seat.rotation.x = -0.22;

  const hoodieMintMat = new THREE.MeshStandardMaterial({
    color: 0x4ae3b5,
    roughness: 0.45,
    metalness: 0.05,
  });
  const pleatedSkirtMat = new THREE.MeshStandardMaterial({
    color: 0x3b1a28,
    roughness: 0.52,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffd5bd,
    roughness: 0.55,
  });
  const darkHairMat = new THREE.MeshStandardMaterial({
    color: 0x160e18,
    roughness: 0.34,
    metalness: 0.12,
  });
  const licoriceBowMat = new THREE.MeshStandardMaterial({
    color: 0xff2b7a,
    roughness: 0.25,
  });

  // Torso in Mint Hoodie
  const torso = addPart(
    new THREE.Mesh(new THREE.BoxGeometry(0.0036, 0.0035, 0.0028), hoodieMintMat)
  );
  torso.position.set(0, 0.0046, -0.0007);
  torso.rotation.x = 0.14;

  // Hoodie Collar / Pleated Hem
  const hoodieCollar = addPart(
    new THREE.Mesh(new THREE.TorusGeometry(0.00155, 0.00045, 8, 16), hoodieMintMat)
  );
  hoodieCollar.rotation.x = Math.PI / 2;
  hoodieCollar.position.set(0, 0.0061, -0.0005);

  const skirtAcc = addPart(
    new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0022, 0.0011, 14), pleatedSkirtMat)
  );
  skirtAcc.position.set(0, 0.0032, -0.0006);

  // Articulated Vanellope Head + High Ponytail + Candies
  const driverHead = addPart(new THREE.Group());
  driverHead.position.set(0, 0.0079, -0.0003);

  const faceSphere = new THREE.Mesh(new THREE.SphereGeometry(0.00185, 18, 16), skinMat);
  driverHead.add(faceSphere);

  // Dark hair cap covering top & back of head
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.00205, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.64),
    darkHairMat
  );
  hairCap.rotation.x = -0.35;
  hairCap.position.set(0, 0.00018, -0.00015);
  driverHead.add(hairCap);

  // Vanellope's Signature High Bouncy Ponytail
  const ponytail = new THREE.Mesh(
    new THREE.ConeGeometry(0.0011, 0.0032, 12),
    darkHairMat
  );
  ponytail.position.set(0, 0.0018, -0.0022);
  ponytail.rotation.x = -1.15;
  driverHead.add(ponytail);

  // Pink Licorice Bow tying the ponytail
  for (const bx of [-0.00065, 0.00065]) {
    const bowLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.00048, 0.00018, 8, 12),
      licoriceBowMat
    );
    bowLoop.position.set(bx, 0.0019, -0.0015);
    bowLoop.rotation.y = bx * 400;
    driverHead.add(bowLoop);
  }

  // Colorful Candy Hair Clips / Sprinkles tucked in hair
  const candyClipCols = [0xff4da6, 0xffe34d, 0x6ef5c8, 0x56c8ff];
  for (let c = 0; c < 4; c++) {
    const clip = new THREE.Mesh(
      new THREE.SphereGeometry(0.00032, 8, 8),
      new THREE.MeshStandardMaterial({ color: candyClipCols[c], roughness: 0.2 })
    );
    clip.position.set(
      (c % 2 === 0 ? -1 : 1) * (0.0012 + (c < 2 ? 0.0003 : 0.0)),
      0.0011 + c * 0.00022,
      -0.0007 - c * 0.00025
    );
    driverHead.add(clip);
  }

  // Pink Candy Racing Goggles on forehead
  for (const gx of [-0.00068, 0.00068]) {
    const goggle = new THREE.Mesh(
      new THREE.TorusGeometry(0.00052, 0.00014, 8, 14),
      strawberryIcingMat
    );
    goggle.position.set(gx, 0.00072, 0.00178);
    driverHead.add(goggle);
  }

  // Peppermint Candy Steering Wheel
  const steeringWheel = addPart(
    new THREE.Mesh(new THREE.TorusGeometry(0.00145, 0.00034, 8, 18), peppermintRimMat)
  );
  steeringWheel.position.set(0, 0.0053, 0.0028);
  steeringWheel.rotation.x = -0.55;

  // -------------------------------------------------------------------------
  // 5. 4 FROSTED DONUT WHEELS WITH PEPPERMINT SWIRL RIMS
  // -------------------------------------------------------------------------
  const frontPivots = [];
  const wheelMeshes = [];

  function createDonutWheelMesh(isRear = false) {
    const wRadius = isRear ? 0.0022 : 0.0019;
    const wWidth = isRear ? 0.0023 : 0.0018;
    const wGroup = new THREE.Group();

    // Baked donut dough tire body
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(wRadius, wRadius, wWidth, 22),
      donutDoughMat
    );
    tire.rotation.z = Math.PI / 2;
    wGroup.add(tire);

    // Pink strawberry frosting glaze band around tread shoulder
    const glazeRing = new THREE.Mesh(
      new THREE.CylinderGeometry(wRadius * 1.02, wRadius * 1.02, wWidth * 0.68, 22),
      donutGlazeMat
    );
    glazeRing.rotation.z = Math.PI / 2;
    wGroup.add(glazeRing);

    // Peppermint swirl hubcaps on both outer and inner faces
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(wRadius * 0.66, wRadius * 0.66, wWidth * 1.05, 18),
      peppermintRimMat
    );
    rim.rotation.z = Math.PI / 2;
    wGroup.add(rim);

    return wGroup;
  }

  for (const sx of [-0.0056, 0.0056]) {
    const pivot = addPart(new THREE.Group());
    pivot.position.set(sx, 0.0019, 0.0054);
    const wheel = createDonutWheelMesh(false);
    pivot.add(wheel);
    frontPivots.push(pivot);
    wheelMeshes.push(wheel);
  }

  for (const sx of [-0.0059, 0.0059]) {
    const wheel = addPart(createDonutWheelMesh(true));
    wheel.position.set(sx, 0.0022, -0.0054);
    wheelMeshes.push(wheel);
  }

  // -------------------------------------------------------------------------
  // 6. HIGH-INTENSITY HEADLIGHT BEAM (Preserved SpotLight API)
  // -------------------------------------------------------------------------
  const headlightTarget = new THREE.Object3D();
  headlightTarget.position.set(0, -0.008, 0.072);
  chassisGroup.add(headlightTarget);

  const headlight = new THREE.SpotLight(0xfff6e5, 6.5, 0.22, Math.PI * 0.34, 0.78, 0.0);
  headlight.position.set(0, 0.016, 0.0085);
  headlight.target = headlightTarget;
  chassisGroup.add(headlight);

  // -------------------------------------------------------------------------
  // 7. CANDY SPARKS & MINT/PINK NITRO PLASMA EMITTER
  // -------------------------------------------------------------------------
  const sparkCount = 260;
  const sparkPositions = new Float32Array(sparkCount * 3);
  const sparkColors = new Float32Array(sparkCount * 3);
  const sparkLifeAttr = new Float32Array(sparkCount);
  const sparkSizes = new Float32Array(sparkCount);
  const sparkVelocities = [];
  const sparkAges = new Float32Array(sparkCount);
  const sparkMaxAges = new Float32Array(sparkCount);

  for (let i = 0; i < sparkCount; i++) {
    sparkPositions[i * 3 + 1] = -10;
    sparkVelocities.push(new THREE.Vector3());
    sparkAges[i] = 999;
    sparkMaxAges[i] = 0.30;
    sparkLifeAttr[i] = 0.0;
    sparkSizes[i] = 0.65 + Math.random() * 1.15;
    sparkColors[i * 3 + 0] = 1.0;
    sparkColors[i * 3 + 1] = 0.48;
    sparkColors[i * 3 + 2] = 0.78;
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
  sparkGeo.setAttribute('aLife', new THREE.BufferAttribute(sparkLifeAttr, 1));
  sparkGeo.setAttribute('aSize', new THREE.BufferAttribute(sparkSizes, 1));

  const sparkMat = new THREE.ShaderMaterial({
    uniforms: {
      uSparkScale: { value: 0.58 },
      tSceneDepth: { value: null },
      uNearClip: { value: 0.0015 },
      uFarClip: { value: 12.0 },
      uFocus: { value: 0.12 },
      uAperture: { value: 0.0 },
      uMaxBlur: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1440, 900) },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uSparkScale;
      uniform float uFocus;
      uniform float uAperture;
      uniform float uMaxBlur;
      uniform vec2 uResolution;
      attribute vec3 color;
      attribute float aLife;
      attribute float aSize;
      varying vec3 vColor;
      varying float vLife;
      varying float vViewZ;
      varying float vDofFactor;
      void main() {
        vColor = color;
        vLife = aLife;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewZ = mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;

        float lifeScale = smoothstep(0.0, 0.12, aLife) * (0.38 + 0.62 * pow(aLife, 0.7));
        float basePointSize = clamp((4.8 * uSparkScale * aSize * lifeScale) / max(0.05, -mvPosition.z), 0.0, 16.0);

        float rawFactor = uFocus + mvPosition.z;
        float deadzone = max(0.065, uFocus * 0.28);
        float absDiff = max(0.0, abs(rawFactor) - deadzone);
        float normScale = 1.0 / max(0.22, uFocus * 1.15);
        float cocUv = clamp(absDiff * (0.42 + 0.16 * normScale) * uAperture, 0.0, uMaxBlur);
        float cocPx = cocUv * uResolution.y * 0.50;
        vDofFactor = clamp(cocPx / max(1.0, basePointSize), 0.0, 4.0);

        gl_PointSize = aLife > 0.01 ? clamp(basePointSize + cocPx, 0.0, 26.0) : 0.0;
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <packing>
      uniform sampler2D tSceneDepth;
      uniform float uNearClip;
      uniform float uFarClip;
      uniform vec2 uResolution;
      varying vec3 vColor;
      varying float vLife;
      varying float vViewZ;
      varying float vDofFactor;
      void main() {
        if (vLife <= 0.01) discard;
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        if (d > 0.5) discard;

        vec2 screenUv = gl_FragCoord.xy / max(vec2(1.0), uResolution);
        float rawSceneDepth = texture2D(tSceneDepth, screenUv).x;
        float sceneViewZ = perspectiveDepthToViewZ(rawSceneDepth, uNearClip, uFarClip);
        if (sceneViewZ > vViewZ + 0.0015) discard;

        float blurLerp = clamp(vDofFactor * 0.35, 0.0, 1.0);
        float core = exp(-d * d * mix(34.0, 8.0, blurLerp));
        float midFire = exp(-d * d * mix(10.5, 4.5, blurLerp)) * smoothstep(0.5, 0.08, d);
        float outerHalo = pow(max(0.0, 1.0 - d * 2.0), mix(2.2, 1.3, blurLerp)) * 0.65;

        bool isMintCyan = vColor.g > 0.72 && vColor.b > 0.72;
        vec3 deepEmber = isMintCyan ? vec3(0.18, 0.95, 0.85) : vec3(1.05, 0.18, 0.55);
        vec3 midFlame = mix(deepEmber, vColor, clamp(vLife * 1.25, 0.0, 1.0));
        vec3 hotCenter = vec3(1.0, 0.98, 0.94);

        vec3 emberColor = mix(midFlame, hotCenter, clamp(core * 1.2, 0.0, 1.0));
        float energyNorm = 1.0 / (1.0 + vDofFactor * 0.85);
        vec3 finalRgb = emberColor * (1.75 * core + 1.10 * midFire + 0.60 * outerHalo) * energyNorm;

        float alpha = clamp((core * 1.1 + midFire * 0.85 + outerHalo * 0.55) * vLife * energyNorm, 0.0, 1.0);
        if (alpha < 0.015) discard;
        gl_FragColor = vec4(finalRgb, alpha);
      }
    `,
  });

  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  sparkPoints.frustumCulled = false;
  sparkPoints.name = 'KartDriftSparks';

  let nextSparkIdx = 0;
  let lastWheelUpdateTime = -1;
  let hadActiveSparks = false;
  const _worldPos = new THREE.Vector3();
  const _backDir = new THREE.Vector3();
  const _spawnPos = new THREE.Vector3();

  function updateWheels(dt, speed, steerAngle = 0.0) {
    const now = performance.now();
    if (Math.abs(now - lastWheelUpdateTime) < 1e-4) {
      return;
    }
    lastWheelUpdateTime = now;

    const wheelSpinDelta = (speed / 0.002) * dt;
    for (const w of wheelMeshes) {
      w.rotation.x += wheelSpinDelta;
    }

    const targetSteerRad = THREE.MathUtils.clamp(steerAngle, -0.52, 0.52);
    for (const p of frontPivots) {
      p.rotation.y = THREE.MathUtils.lerp(p.rotation.y, targetSteerRad, Math.min(1, dt * 16));
    }
    steeringWheel.rotation.z = targetSteerRad * 1.6;
    driverHead.rotation.z = -targetSteerRad * 0.45;
    driverHead.rotation.y = targetSteerRad * 0.55;
  }

  // -------------------------------------------------------------------------
  // 8. WORLD-SPACE TWIN NITRO RIBBON TRAILS (Mint + Cotton-Candy Sugar Stream)
  // -------------------------------------------------------------------------
  const nitroTrailGroup = new THREE.Group();
  nitroTrailGroup.name = 'KartNitroTrailGroup';
  const trailSamples = 24;
  const trailHalfWidth = 0.00080;

  function createNitroRibbon() {
    const vertCount = trailSamples * 2;
    const positions = new Float32Array(vertCount * 3);
    const colors = new Float32Array(vertCount * 3);
    const indices = [];
    for (let i = 0; i < trailSamples - 1; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = (i + 1) * 2;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setIndex(indices);

    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    nitroTrailGroup.add(mesh);

    const historyPos = [];
    const historyRight = [];
    for (let i = 0; i < trailSamples; i++) {
      historyPos.push(new THREE.Vector3());
      historyRight.push(new THREE.Vector3(1, 0, 0));
    }
    return { mesh, geo, positions, colors, historyPos, historyRight };
  }

  const nitroRibbons = [createNitroRibbon(), createNitroRibbon()];
  let nitroTrailAlpha = 0.0;
  let nitroTrailInitialized = false;
  const _trailEmitPos = new THREE.Vector3();

  let cockpitRoadOnly = false;

  function updateKartVisuals(dt, state) {
    const steerAngle =
      state.steerAngle !== undefined
        ? state.steerAngle - (state.driftAngle || 0.0) * 0.35
        : -(state.steerInput || 0.0) * 0.45 - (state.driftAngle || 0.0) * 0.35;

    updateWheels(dt, state.speed, steerAngle);

    chassisGroup.rotation.y = THREE.MathUtils.lerp(
      chassisGroup.rotation.y,
      state.driftAngle || 0.0,
      Math.min(1, dt * 14)
    );
    chassisGroup.rotation.z = THREE.MathUtils.lerp(
      chassisGroup.rotation.z,
      (state.steerInput || 0.0) * 0.09,
      Math.min(1, dt * 12)
    );
    const idleBob =
      Math.abs(state.speed) > 0.005 ? Math.sin(performance.now() * 0.06) * 0.00018 : 0.0;
    chassisGroup.position.y = (state.hopHeight || 0.0) + idleBob;

    const isNitro = (state.nitroActive || 0) > 0;
    const isBoosting = isNitro || state.boostActive > 0;
    const tSec = performance.now() * 0.001;

    for (const pGroup of flameCones) {
      pGroup.visible = isBoosting && !cockpitRoadOnly;
      if (!pGroup.visible) continue;
      const pIdx = pGroup.userData.pipeIndex || 0;
      const phase = pIdx * 1.85;
      const crackle =
        0.82 +
        0.18 * Math.sin(tSec * 58.0 + phase) +
        0.12 * Math.cos(tSec * 93.0 - phase * 1.4);
      const nitroMul = isNitro ? 1.42 : 1.0;
      const rScale = (0.96 + 0.08 * Math.sin(tSec * 44.0 + phase)) * (isNitro ? 1.25 : 1.0);
      const zScale = Math.max(0.55, 0.88 + 0.28 * crackle) * nitroMul;
      pGroup.scale.set(rScale, rScale, zScale);
      if (pGroup.userData.jetMat) {
        pGroup.userData.jetMat.uniforms.uTime.value = tSec;
        pGroup.userData.jetMat.uniforms.uIntensity.value = Math.min(
          1.55,
          (isNitro ? 1.25 : 0.92) * crackle
        );
      }
    }

    const kScale = kartRoot.scale.x || 0.58;
    sparkMat.uniforms.uSparkScale.value = kScale;

    const isEmitting =
      (state.isDrifting ||
        isBoosting ||
        state.curbRumble > 0.2 ||
        Math.abs(state.steerInput || 0) > 0.32) &&
      Math.abs(state.speed) > 0.03;
    const emitCount = isEmitting ? (isNitro ? 10 : 6) : 0;

    if (fireLightPreviewTimer > 0) {
      fireLightPreviewTimer = Math.max(0.0, fireLightPreviewTimer - dt);
    }
    const showFireLight = isEmitting || fireLightPreviewTimer > 0;
    const baseFireIntensity = 0.35 + Math.random() * 0.20;
    sparkFireLight.color.setHex(isNitro ? 0x6ef5c8 : 0xff4da6);
    sparkFireLight.intensity = showFireLight
      ? baseFireIntensity * fireLightMultiplier * (isNitro ? 1.6 : 1.0)
      : THREE.MathUtils.lerp(sparkFireLight.intensity, 0.0, Math.min(1, dt * 12));

    kartRoot.getWorldPosition(_worldPos);
    _backDir.copy(state.tangent).multiplyScalar(-1);

    if (emitCount > 0) {
      for (let e = 0; e < emitCount; e++) {
        const idx = nextSparkIdx % sparkCount;
        nextSparkIdx++;
        const sideSign = e % 2 === 0 ? -1 : 1;
        const isNitroParticle = isNitro && e % 3 !== 2;

        _spawnPos
          .copy(_worldPos)
          .addScaledVector(
            state.right,
            sideSign *
              (isNitroParticle ? 0.0014 + Math.random() * 0.0022 : 0.0044 + Math.random() * 0.0018) *
              kScale
          )
          .addScaledVector(
            _backDir,
            (isNitroParticle ? 0.0078 : 0.0060 + Math.random() * 0.0028) * kScale
          )
          .addScaledVector(
            state.normal,
            (isNitroParticle ? 0.0016 + Math.random() * 0.0012 : 0.0009 + Math.random() * 0.0009) *
              kScale
          );

        sparkPositions[idx * 3 + 0] = _spawnPos.x;
        sparkPositions[idx * 3 + 1] = _spawnPos.y;
        sparkPositions[idx * 3 + 2] = _spawnPos.z;

        const vScale = (0.65 + 0.35 * kScale) * (isNitroParticle ? 1.45 : 1.0);
        sparkVelocities[idx]
          .copy(_backDir)
          .multiplyScalar((0.12 + Math.random() * 0.22) * vScale)
          .addScaledVector(
            state.normal,
            (isNitroParticle ? 0.015 + Math.random() * 0.045 : 0.045 + Math.random() * 0.11) * vScale
          )
          .addScaledVector(
            state.right,
            (Math.random() - 0.5) * (isNitroParticle ? 0.06 : 0.12) * vScale
          );

        sparkAges[idx] = 0.0;
        sparkMaxAges[idx] = isNitroParticle ? 0.28 + Math.random() * 0.18 : 0.20 + Math.random() * 0.18;
        sparkLifeAttr[idx] = 1.0;
        sparkSizes[idx] = isNitroParticle ? 0.95 + Math.random() * 1.35 : 0.65 + Math.random() * 1.15;

        if (isNitroParticle) {
          // Mint-Cyan & Sugar-Pink Sugar Rush Boost Sparks
          if (e % 2 === 0) {
            sparkColors[idx * 3 + 0] = 0.32;
            sparkColors[idx * 3 + 1] = 1.15;
            sparkColors[idx * 3 + 2] = 0.98;
          } else {
            sparkColors[idx * 3 + 0] = 1.28;
            sparkColors[idx * 3 + 1] = 0.35;
            sparkColors[idx * 3 + 2] = 0.85;
          }
        } else {
          // Candy Pink / Lemon Sugar Drift Sparks
          sparkColors[idx * 3 + 0] = 1.10;
          sparkColors[idx * 3 + 1] = 0.38 + Math.random() * 0.45;
          sparkColors[idx * 3 + 2] = 0.72 + Math.random() * 0.28;
        }
      }
    }

    let activeSparksNow = false;
    if (emitCount > 0 || hadActiveSparks) {
      for (let i = 0; i < sparkCount; i++) {
        const maxAge = sparkMaxAges[i] || 0.28;
        if (sparkAges[i] < maxAge) {
          activeSparksNow = true;
          sparkAges[i] += dt;
          sparkLifeAttr[i] = Math.max(0.0, 1.0 - sparkAges[i] / maxAge);

          sparkPositions[i * 3 + 0] += sparkVelocities[i].x * dt;
          sparkPositions[i * 3 + 1] += sparkVelocities[i].y * dt;
          sparkPositions[i * 3 + 2] += sparkVelocities[i].z * dt;
          sparkVelocities[i].multiplyScalar(Math.max(0.88, 1.0 - 2.4 * dt));
          sparkVelocities[i].y -= 0.36 * dt;
        } else {
          sparkLifeAttr[i] = 0.0;
          sparkPositions[i * 3 + 1] = -10.0;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkGeo.attributes.color.needsUpdate = true;
      sparkGeo.attributes.aLife.needsUpdate = true;
      sparkGeo.attributes.aSize.needsUpdate = true;
      hadActiveSparks = activeSparksNow;
    }

    // Twin World-Space Nitro Ribbon Trails (Left ribbon = Mint Cyan, Right ribbon = Cotton-Candy Pink)
    const targetTrailAlpha = isNitro && !cockpitRoadOnly ? 1.0 : 0.0;
    nitroTrailAlpha = THREE.MathUtils.lerp(
      nitroTrailAlpha,
      targetTrailAlpha,
      Math.min(1, dt * (isNitro ? 16.0 : 7.5))
    );

    if (nitroTrailAlpha > 0.015) {
      nitroTrailGroup.visible = true;
      const sideOffsets = [-0.0046 * kScale, 0.0046 * kScale];
      for (let rIdx = 0; rIdx < 2; rIdx++) {
        const rib = nitroRibbons[rIdx];
        _trailEmitPos
          .copy(_worldPos)
          .addScaledVector(state.right, sideOffsets[rIdx])
          .addScaledVector(_backDir, 0.0068 * kScale)
          .addScaledVector(state.normal, 0.0018 * kScale);

        if (!nitroTrailInitialized) {
          for (let i = 0; i < trailSamples; i++) {
            rib.historyPos[i].copy(_trailEmitPos);
            rib.historyRight[i].copy(state.right);
          }
        } else {
          for (let i = trailSamples - 1; i > 0; i--) {
            rib.historyPos[i].copy(rib.historyPos[i - 1]);
            rib.historyRight[i].copy(rib.historyRight[i - 1]);
          }
          rib.historyPos[0].copy(_trailEmitPos);
          rib.historyRight[0].copy(state.right);
        }

        const hw = trailHalfWidth * kScale * (0.75 + 0.45 * nitroTrailAlpha);
        for (let i = 0; i < trailSamples; i++) {
          const t = i / (trailSamples - 1);
          const taper = (1.0 - t) * hw;
          const p = rib.historyPos[i];
          const rVec = rib.historyRight[i];

          const vIdx = i * 2;
          rib.positions[vIdx * 3 + 0] = p.x - rVec.x * taper;
          rib.positions[vIdx * 3 + 1] = p.y - rVec.y * taper;
          rib.positions[vIdx * 3 + 2] = p.z - rVec.z * taper;

          rib.positions[(vIdx + 1) * 3 + 0] = p.x + rVec.x * taper;
          rib.positions[(vIdx + 1) * 3 + 1] = p.y + rVec.y * taper;
          rib.positions[(vIdx + 1) * 3 + 2] = p.z + rVec.z * taper;

          const fade = Math.pow(1.0 - t, 1.55) * nitroTrailAlpha;
          const cr = (rIdx === 0 ? 0.35 : 1.55) * fade * 1.3;
          const cg = (rIdx === 0 ? 1.45 : 0.38) * fade * 1.3;
          const cb = (rIdx === 0 ? 1.25 : 1.15) * fade * 1.3;

          rib.colors[vIdx * 3 + 0] = cr;
          rib.colors[vIdx * 3 + 1] = cg;
          rib.colors[vIdx * 3 + 2] = cb;
          rib.colors[(vIdx + 1) * 3 + 0] = cr;
          rib.colors[(vIdx + 1) * 3 + 1] = cg;
          rib.colors[(vIdx + 1) * 3 + 2] = cb;
        }
        rib.geo.attributes.position.needsUpdate = true;
        rib.geo.attributes.color.needsUpdate = true;
      }
      nitroTrailInitialized = true;
    } else {
      nitroTrailGroup.visible = false;
      nitroTrailInitialized = false;
    }
  }

  function setCockpitRoadOnly(isRoadOnly) {
    cockpitRoadOnly = Boolean(isRoadOnly);
    kartShadowQuad.visible = !cockpitRoadOnly;
    for (const part of proceduralParts) {
      if (part) part.visible = !cockpitRoadOnly;
    }
    for (const plane of tailLightGlowPlanes) {
      if (plane) plane.visible = !cockpitRoadOnly;
    }
  }

  function attachGlbKart(_glbScene) {
    // Sugar Rush always uses the custom Vanellope Candy Kart ("profdeborapaulo")
  }

  return {
    kartRoot,
    chassisGroup,
    wheelMeshes,
    frontPivots,
    headlight,
    sparkPoints,
    nitroTrailGroup,
    flameCones,
    tailLightGlowPlanes,
    sparkFireLight,
    setFireLightMultiplier,
    setCockpitRoadOnly,
    updateWheels,
    updateKartVisuals,
    attachGlbKart,
  };
}
