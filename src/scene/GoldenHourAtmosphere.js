import * as THREE from 'three';

/**
 * Bright, cheerful Sugar Rush ("Corrida Doce") Candy Kingdom Daylight Atmosphere:
 * - Warm sunlit pastel sky + cotton-candy pink/mint ground bounce HemisphereLight
 * - Crisp DirectionalLight sunlight casting soft candy shadows across the circuit
 * - Candy Sun Spire warm glow + Floating Pastel Sugar Sparkle Motes
 * Preserves the full GoldenHourAtmosphere export & return signature for main.js.
 */
export function buildGoldenHourAtmosphere(scene) {
  const atmosphereGroup = new THREE.Group();
  atmosphereGroup.name = 'SugarRushDaylightAtmosphere';

  const defaultSunScale = 1.35;
  const defaultLampScale = 1.0;

  // Bright sky blue + cotton-candy pink ground bounce
  const hemiLight = new THREE.HemisphereLight(0xd9f6ff, 0xffc6e5, 1.05);
  atmosphereGroup.add(hemiLight);

  // Warm Golden Candy Sun Key Light
  const sunLight = new THREE.DirectionalLight(0xfff1dc, 1.55 * defaultSunScale);
  sunLight.position.set(-0.42, 0.85, 0.45);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.08;
  sunLight.shadow.camera.far = 2.6;
  sunLight.shadow.camera.left = -0.62;
  sunLight.shadow.camera.right = 0.62;
  sunLight.shadow.camera.top = 0.52;
  sunLight.shadow.camera.bottom = -0.52;
  sunLight.shadow.bias = -0.00018;
  sunLight.shadow.normalBias = 0.0008;
  sunLight.shadow.radius = 1.4;
  sunLight.shadow.autoUpdate = false;
  sunLight.shadow.needsUpdate = true;
  atmosphereGroup.add(sunLight);

  // Soft Rear Cotton-Candy Fill
  const windowGlowLight = new THREE.PointLight(0xffb8e6, 0.55, 2.4, 1.1);
  windowGlowLight.position.set(0.0, 0.50, -0.45);
  atmosphereGroup.add(windowGlowLight);

  const goldenFillLight = new THREE.DirectionalLight(0xb8f8ff, 0.52);
  goldenFillLight.position.set(0.55, 0.52, -0.35);
  atmosphereGroup.add(goldenFillLight);

  const rimLight = new THREE.DirectionalLight(0xffd2f0, 0.42);
  rimLight.position.set(-0.38, 0.48, -0.62);
  atmosphereGroup.add(rimLight);
  const roomFillLight = rimLight;

  // Candy Sun Spire Accent SpotLight (in Sector 4 spiral)
  const lampTarget = new THREE.Object3D();
  lampTarget.position.set(-0.08, 0.0, 0.06);
  atmosphereGroup.add(lampTarget);

  const lampKeyLight = new THREE.SpotLight(
    0xffe1b8,
    0.95 * defaultLampScale,
    1.68,
    Math.PI * 0.34,
    0.78,
    1.6
  );
  lampKeyLight.position.set(0.352, 0.355, -0.085);
  lampKeyLight.target = lampTarget;
  lampKeyLight.castShadow = true;
  lampKeyLight.shadow.mapSize.width = 1024;
  lampKeyLight.shadow.mapSize.height = 1024;
  lampKeyLight.shadow.camera.near = 0.06;
  lampKeyLight.shadow.camera.far = 1.35;
  lampKeyLight.shadow.bias = -0.00035;
  lampKeyLight.shadow.normalBias = 0.0012;
  lampKeyLight.shadow.radius = 1.25;
  lampKeyLight.shadow.autoUpdate = false;
  lampKeyLight.shadow.needsUpdate = true;
  atmosphereGroup.add(lampKeyLight);

  const lampGlowPoint = new THREE.PointLight(0xffb8e0, 0.35 * defaultLampScale, 0.42, 1.5);
  lampGlowPoint.position.set(0.342, 0.345, -0.062);
  atmosphereGroup.add(lampGlowPoint);

  // Subtle pastel mint-pink chocolate bridge accent glow
  const kbBacklight = new THREE.PointLight(0xff77c8, 0.18, 0.22, 2.0);
  kbBacklight.position.set(-0.161, 0.025, 0.118);
  atmosphereGroup.add(kbBacklight);

  // Localized Lollipop Valley Mint Glow
  const micPos = new THREE.Vector3(-0.025, 0.105, -0.045);
  const micPointLight = new THREE.PointLight(0x6ef5c8, 0.0, 0.09, 1.8);
  micPointLight.position.copy(micPos);
  micPointLight.visible = false;
  atmosphereGroup.add(micPointLight);

  const micSpotTarget = new THREE.Object3D();
  micSpotTarget.position.set(-0.015, 0.0, -0.025);
  atmosphereGroup.add(micSpotTarget);

  const micSpotLight = new THREE.SpotLight(0x6ef5c8, 0.28, 0.28, Math.PI * 0.38, 0.85, 1.4);
  micSpotLight.position.copy(micPos);
  micSpotLight.target = micSpotTarget;
  atmosphereGroup.add(micSpotLight);

  const micAuraMat = new THREE.MeshBasicMaterial({
    color: 0x6ef5c8,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const micAuraCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.01, 0.01, 8, 1, true),
    micAuraMat
  );
  micAuraCone.visible = false;

  // Kept as lightweight empty groups for API compatibility with main.js
  const sunbeamGroup = new THREE.Group();
  sunbeamGroup.name = 'SugarRushSunbeams';
  sunbeamGroup.visible = false;
  const sunbeamsGroup = sunbeamGroup;
  const godRayCurtainGroup = new THREE.Group();
  godRayCurtainGroup.visible = false;
  sunbeamGroup.add(godRayCurtainGroup);
  atmosphereGroup.add(sunbeamGroup);

  // -------------------------------------------------------------------------
  // FLOATING PASTEL SUGAR SPARKLE MOTES (1,200 cheerful Sugar Dust particles)
  // -------------------------------------------------------------------------
  const moteCount = 1200;
  const motePositions = new Float32Array(moteCount * 3);
  const motePhases = new Float32Array(moteCount);
  const moteScales = new Float32Array(moteCount);

  for (let i = 0; i < moteCount; i++) {
    motePositions[i * 3 + 0] = (Math.random() - 0.5) * 1.45;
    motePositions[i * 3 + 1] = 0.01 + Math.random() * 0.65;
    motePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.95;
    motePhases[i] = Math.random() * Math.PI * 2.0;
    moteScales[i] = 0.7 + Math.random() * 1.5;
  }

  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  moteGeo.setAttribute('aPhase', new THREE.BufferAttribute(motePhases, 1));
  moteGeo.setAttribute('aScale', new THREE.BufferAttribute(moteScales, 1));

  const moteUniforms = {
    uTime: { value: 0.0 },
    uIntensity: { value: 1.0 },
  };

  const moteMat = new THREE.ShaderMaterial({
    uniforms: moteUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute float aScale;
      uniform float uTime;
      varying float vTwinkle;
      varying float vHueSeed;
      void main() {
        vec3 pos = position;
        pos.x += sin(uTime * 0.35 + aPhase) * 0.015;
        pos.y += cos(uTime * 0.28 + aPhase * 1.3) * 0.012;
        pos.z += sin(uTime * 0.31 + aPhase * 0.7) * 0.015;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vHueSeed = fract(aPhase * 0.3183);
        vTwinkle = 0.45 + 0.55 * sin(uTime * 2.4 + aPhase * 3.0);
        gl_PointSize = clamp((10.5 * aScale) / max(0.14, -mvPosition.z), 1.2, 6.5);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      varying float vTwinkle;
      varying float vHueSeed;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        if (d > 0.5) discard;
        float bokeh = smoothstep(0.5, 0.08, d);
        vec3 cPink = vec3(1.0, 0.58, 0.84);
        vec3 cMint = vec3(0.55, 0.98, 0.85);
        vec3 cLemon = vec3(1.0, 0.92, 0.55);
        vec3 col = vHueSeed < 0.33 ? cPink : (vHueSeed < 0.66 ? cMint : cLemon);
        float alpha = bokeh * vTwinkle * 0.35 * clamp(uIntensity, 0.0, 1.6);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const dustPoints = new THREE.Points(moteGeo, moteMat);
  dustPoints.name = 'SugarSparkleMotes';
  atmosphereGroup.add(dustPoints);

  scene.add(atmosphereGroup);

  const candySkyBg = new THREE.Color(0xffd6ee);
  const candyFogColor = new THREE.Color(0xffe1f3);

  let lastSunScale = -1;
  let lastLampScale = -1;
  let lastMicScale = -1;

  function requestShadowMapUpdate() {
    sunLight.shadow.needsUpdate = true;
    lampKeyLight.shadow.needsUpdate = true;
  }

  function updateAtmosphere(
    elapsedTime,
    settings = {},
    renderer = null,
    bloomPass = null,
    targetScene = scene,
    diorama = null
  ) {
    const sunScale = settings.sunIntensity ?? settings.sunbeamIntensity ?? defaultSunScale;
    const lampScale = settings.lampIntensity ?? defaultLampScale;
    const micScale = settings.micGlowIntensity ?? 0.85;

    const showMotes = settings.showDustMotes ?? true;
    dustPoints.visible = showMotes;
    if (showMotes) {
      moteUniforms.uTime.value = elapsedTime;
      moteUniforms.uIntensity.value = Math.max(0.65, sunScale);
    }

    const lightingChanged =
      Math.abs(sunScale - lastSunScale) > 1e-5 ||
      Math.abs(lampScale - lastLampScale) > 1e-5 ||
      Math.abs(micScale - lastMicScale) > 1e-5;

    if (lightingChanged) {
      lastSunScale = sunScale;
      lastLampScale = lampScale;
      lastMicScale = micScale;

      sunLight.visible = true;
      sunLight.intensity = 1.45 * Math.max(0.55, sunScale);
      hemiLight.intensity = 0.92 + 0.18 * sunScale;
      windowGlowLight.intensity = 0.52;
      goldenFillLight.intensity = 0.48;
      rimLight.intensity = 0.40;
      lampKeyLight.intensity = 0.95 * lampScale;
      lampGlowPoint.intensity = 0.35 * lampScale;
      micSpotLight.intensity = 0.28 * micScale;

      if (renderer) {
        renderer.toneMappingExposure = 0.98 + 0.04 * sunScale;
      }

      const activeScene = targetScene || scene;
      if (activeScene) {
        if (activeScene.background && activeScene.background.isColor) {
          activeScene.background.copy(candySkyBg);
        } else {
          activeScene.background = candySkyBg.clone();
        }
        if (activeScene.fog) {
          if (activeScene.fog.color) {
            activeScene.fog.color.copy(candyFogColor);
          }
          if (activeScene.fog.density !== undefined) {
            activeScene.fog.density = 0.022;
          }
        }
      }

      if (diorama && typeof diorama.updateLightingMaterials === 'function') {
        diorama.updateLightingMaterials(sunScale, lampScale);
      }
    } else if (renderer) {
      renderer.toneMappingExposure = 0.98 + 0.04 * sunScale;
    }

    if (bloomPass) {
      bloomPass.strength = settings.bloomStrength ?? 0.08;
      bloomPass.radius = 0.22;
      bloomPass.threshold = 1.15;
    }
  }

  updateAtmosphere(
    0.0,
    { sunIntensity: defaultSunScale, lampIntensity: defaultLampScale, showDustMotes: true },
    null,
    null,
    scene,
    null
  );

  return {
    atmosphereGroup,
    sunLight,
    hemiLight,
    windowGlowLight,
    goldenFillLight,
    kbBacklight,
    rimLight,
    roomFillLight,
    lampKeyLight,
    lampGlowPoint,
    micPointLight,
    micSpotLight,
    micAuraCone,
    sunbeamGroup,
    sunbeamsGroup,
    godRayCurtainGroup,
    dustPoints,
    requestShadowMapUpdate,
    updateAtmosphere,
    update: updateAtmosphere,
  };
}
