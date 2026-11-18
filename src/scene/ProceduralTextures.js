import * as THREE from 'three';

/**
 * Generates high-definition procedural Canvas PBR textures for the
 * Sugar Rush ("Corrida Doce") Candy Circuit & Vanellope Candy Kart,
 * while preserving legacy helper exports for full compatibility.
 */
export function createOakWoodTextures() {
  return createWaferGroundTextures();
}

export function createWaferGroundTextures() {
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Warm golden toasted waffle-cone / wafer biscuit base
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  baseGrad.addColorStop(0.0, '#eab372');
  baseGrad.addColorStop(0.5, '#e2a35d');
  baseGrad.addColorStop(1.0, '#d6944d');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Waffle grid cells (embossed biscuit pockets)
  const cell = 32;
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      ctx.fillStyle = 'rgba(145, 76, 26, 0.22)';
      ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
      ctx.fillStyle = 'rgba(255, 232, 188, 0.28)';
      ctx.fillRect(x + 4, y + 4, cell - 8, 3);
      ctx.fillRect(x + 4, y + 4, 3, cell - 8);
    }
  }

  // Subtle toasted sugar grain
  for (let i = 0; i < 4500; i++) {
    const px = (i * 197) % width;
    const py = (i * 353) % height;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 245, 220, 0.14)' : 'rgba(120, 58, 18, 0.12)';
    ctx.fillRect(px, py, 2, 2);
  }

  // Bump / roughness companion
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d');
  bCtx.fillStyle = '#c8c8c8';
  bCtx.fillRect(0, 0, 512, 512);
  const bCell = 16;
  for (let y = 0; y < 512; y += bCell) {
    for (let x = 0; x < 512; x += bCell) {
      bCtx.fillStyle = '#707070';
      bCtx.fillRect(x + 2, y + 2, bCell - 4, bCell - 4);
    }
  }

  const colorTex = new THREE.CanvasTexture(canvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(4, 2.5);
  colorTex.anisotropy = 8;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(4, 2.5);

  return { colorTex, bumpTex };
}

export function createCandyRoadTexture() {
  const w = 256;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Rich glossy dark-milk chocolate fudge roadbed base
  const chocoGrad = ctx.createLinearGradient(0, 0, w, 0);
  chocoGrad.addColorStop(0.0, '#4f2820');
  chocoGrad.addColorStop(0.22, '#3d1c16');
  chocoGrad.addColorStop(0.5, '#331510');
  chocoGrad.addColorStop(0.78, '#3d1c16');
  chocoGrad.addColorStop(1.0, '#4f2820');
  ctx.fillStyle = chocoGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle cocoa wafer diamond weave
  ctx.strokeStyle = 'rgba(255, 200, 175, 0.06)';
  ctx.lineWidth = 2;
  for (let y = -w; y < h + w; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + w);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w, y);
    ctx.lineTo(0, y + w);
    ctx.stroke();
  }

  // Colorful sugar sprinkle crumbs embedded along the shoulders
  const sprinkleCols = ['#ff248f', '#ff70c8', '#6ef5c8', '#ffe35c', '#ffffff'];
  for (let i = 0; i < 480; i++) {
    const sx = (i * 53) % w;
    const sy = (i * 197) % h;
    if (sx > 38 && sx < w - 38 && i % 3 !== 0) continue;
    ctx.fillStyle = sprinkleCols[i % sprinkleCols.length];
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate((i % 7) * 0.45);
    ctx.fillRect(-3, -1.3, 6, 2.6);
    ctx.restore();
  }

  // Vivid hot-pink & bubblegum-rose piped frosting edge lines
  ctx.fillStyle = '#ff1f8a';
  ctx.fillRect(10, 0, 8, h);
  ctx.fillStyle = '#ff7ad0';
  ctx.fillRect(w - 18, 0, 8, h);

  // Crisp marshmallow-white & pastel-pink dashed centerline
  for (let y = 0; y < h; y += 64) {
    ctx.fillStyle = (y / 64) % 2 === 0 ? '#fff5fb' : '#ff85d0';
    ctx.fillRect(w / 2 - 4, y + 10, 8, 34);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 56);
  tex.anisotropy = 8;
  return tex;
}

export function createAsphaltRoadTexture() {
  return createCandyRoadTexture();
}

export function createFrostingSprinkleTexture(
  baseColor = '#6ef5c8',
  rimHighlight = '#b5ffe6',
  sprinkleColors = ['#ff3b9a', '#ffe34d', '#ffffff', '#ff5938', '#48b8ff']
) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, rimHighlight);
  grad.addColorStop(0.5, baseColor);
  grad.addColorStop(1, baseColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Soft glossy sugar glaze swirl
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.arc(((i * 97) % 420) + 46, ((i * 151) % 420) + 46, 26 + (i % 5) * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheerful rainbow jimmies / sugar sprinkles
  for (let i = 0; i < 190; i++) {
    const x = ((i * 137 + 29) % (size - 24)) + 12;
    const y = ((i * 263 + 41) % (size - 24)) + 12;
    const ang = ((i * 71) % 314) * 0.01;
    const col = sprinkleColors[i % sprinkleColors.length];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.beginPath();
    ctx.roundRect(-9, -3, 18, 7, 3.5);
    ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(-9, -4, 18, 6.5, 3.2);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function createPeppermintSwirlTexture(
  primaryHex = '#ff2965',
  secondaryHex = '#ffffff',
  stripes = 10
) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.fillStyle = secondaryHex;
  ctx.fillRect(0, 0, size, size);

  // Spiral peppermint pinwheel wedges
  for (let r = 0; r < size * 0.72; r += 3) {
    const twist = r * 0.018;
    for (let s = 0; s < stripes; s++) {
      if (s % 2 !== 0) continue;
      const a0 = (s / stripes) * Math.PI * 2 + twist;
      const a1 = ((s + 1) / stripes) * Math.PI * 2 + twist;
      ctx.fillStyle = primaryHex;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, a0, a1);
      ctx.arc(cx, cy, Math.max(0, r - 1), a1, a0, true);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Glossy center candy highlight
  const shine = ctx.createRadialGradient(cx - 48, cy - 48, 8, cx, cy, size * 0.48);
  shine.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
  shine.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
  shine.addColorStop(1, 'rgba(0, 0, 0, 0.10)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function createCandyCaneStripeTexture(
  stripeA = '#ff2860',
  stripeB = '#fff9fc',
  accentC = '#6ef5c8'
) {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = stripeB;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  for (let y = -w; y < h + w; y += 64) {
    ctx.fillStyle = stripeA;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + w);
    ctx.lineTo(w, y + w + 28);
    ctx.lineTo(0, y + 28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentC;
    ctx.beginPath();
    ctx.moveTo(0, y + 34);
    ctx.lineTo(w, y + w + 34);
    ctx.lineTo(w, y + w + 42);
    ctx.lineTo(0, y + 42);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function createNameplateDecalTexture(
  nameText = 'profdeborapaulo',
  options = {}
) {
  const {
    bgTop = '#ff4da6',
    bgBottom = '#c81b74',
    borderCol = '#fff6fb',
    textCol = '#ffffff',
    outlineCol = '#3b0b28',
    accentCol = '#6ef5c8',
    width = 1024,
    height = 256,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Rich candy-coated gradient plate
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0.0, bgTop);
  bg.addColorStop(1.0, bgBottom);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(10, 10, width - 20, height - 20, 44);
  ctx.fill();

  // Mint candy inner trim
  ctx.lineWidth = 14;
  ctx.strokeStyle = borderCol;
  ctx.beginPath();
  ctx.roundRect(14, 14, width - 28, height - 28, 40);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.strokeStyle = accentCol;
  ctx.beginPath();
  ctx.roundRect(26, 26, width - 52, height - 52, 30);
  ctx.stroke();

  // Top gloss shine band
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.roundRect(34, 30, width - 68, (height - 60) * 0.38, 22);
  ctx.fill();

  // Cute candy star accents on left and right
  const drawStar = (cx, cy, rOuter, rInner, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  };
  drawStar(72, height / 2, 22, 10, '#ffe35c');
  drawStar(width - 72, height / 2, 22, 10, '#ffe35c');

  // Bold, super-legible custom racer name
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontSize = 86;
  ctx.font = `900 ${fontSize}px "Inter", "Orbitron", system-ui, sans-serif`;
  const maxTextW = width - 190;
  while (ctx.measureText(nameText).width > maxTextW && fontSize > 32) {
    fontSize -= 2;
    ctx.font = `900 ${fontSize}px "Inter", "Orbitron", system-ui, sans-serif`;
  }

  // Deep chocolate/plum drop shadow + stroke for crisp 3D legibility
  ctx.lineJoin = 'round';
  ctx.lineWidth = 18;
  ctx.strokeStyle = outlineCol;
  ctx.strokeText(nameText, width / 2, height / 2 + 4);

  ctx.lineWidth = 6;
  ctx.strokeStyle = accentCol;
  ctx.strokeText(nameText, width / 2, height / 2 + 2);

  ctx.fillStyle = textCol;
  ctx.fillText(nameText, width / 2, height / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createMonitorScreenTexture() {
  const w = 1024;
  const h = 576;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Vibrant Sugar Rush arcade sky & vivid pink cotton candy gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0.0, '#ff1e8a');
  bg.addColorStop(0.38, '#ff5ec4');
  bg.addColorStop(0.76, '#c23bff');
  bg.addColorStop(1.0, '#ff88d6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Diagonal candy stripe overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  for (let x = -h; x < w + h; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 26, 0);
    ctx.lineTo(x - h + 26, h);
    ctx.lineTo(x - h, h);
    ctx.closePath();
    ctx.fill();
  }

  // Main Arcade Sign Panel
  ctx.fillStyle = 'rgba(54, 8, 48, 0.86)';
  ctx.strokeStyle = '#fff5fa';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(56, 48, w - 112, h - 96, 36);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#ff6ec7';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(72, 64, w - 144, h - 128, 26);
  ctx.stroke();

  // Title: SUGAR RUSH / CORRIDA DOCE
  ctx.textAlign = 'center';
  ctx.font = '900 84px "Orbitron", sans-serif';
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#3b0729';
  ctx.strokeText('SUGAR RUSH', w / 2, 174);
  const titleGrad = ctx.createLinearGradient(0, 110, 0, 190);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.45, '#ff80cf');
  titleGrad.addColorStop(1, '#ff248f');
  ctx.fillStyle = titleGrad;
  ctx.fillText('SUGAR RUSH', w / 2, 174);

  ctx.font = '800 34px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffe35c';
  ctx.fillText('CORRIDA DOCE · CANDY GRAND PRIX', w / 2, 238);

  // Driver Banner
  const pillGrad = ctx.createLinearGradient(180, 286, w - 180, 374);
  pillGrad.addColorStop(0, '#ff1a85');
  pillGrad.addColorStop(0.5, '#ff5ec4');
  pillGrad.addColorStop(1, '#ff1a85');
  ctx.fillStyle = pillGrad;
  ctx.beginPath();
  ctx.roundRect(156, 286, w - 312, 88, 24);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px "Inter", sans-serif';
  ctx.fillText('profdeborapaulo', w / 2, 344);

  // Footer Candy Sectors
  ctx.fillStyle = '#ffb8e8';
  ctx.font = '700 22px monospace';
  ctx.fillText('WAFER CASTLE • GUMMY TOWER • LOLLIPOP VALLEY • COLA VOLCANO', w / 2, 434);
  ctx.fillStyle = '#a8ffe2';
  ctx.font = '700 20px monospace';
  ctx.fillText('COLLECT STAR CANDIES (+50 PTS) • PRESS SPACE FOR NITRO TURBO!', w / 2, 472);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function createCheckeredGantryTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Vivid hot-pink & bubblegum gradient background
  const bg = ctx.createLinearGradient(0, 0, w, 0);
  bg.addColorStop(0, '#ff1a85');
  bg.addColorStop(0.5, '#ff6ec7');
  bg.addColorStop(1, '#ff1a85');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Pink & white candy checkered strips on left and right
  const sq = 32;
  for (let r = 0; r < h / sq; r++) {
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#5e0f3e';
      ctx.fillRect(c * sq, r * sq, sq, sq);
      ctx.fillRect(w - (c + 1) * sq, r * sq, sq, sq);
    }
  }

  // Center banner text featuring profdeborapaulo
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#3b0724';
  ctx.font = '900 58px "Orbitron", sans-serif';
  ctx.strokeText('SUGAR RUSH · profdeborapaulo', w / 2, 108);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SUGAR RUSH · profdeborapaulo', w / 2, 108);

  ctx.font = '900 34px "Orbitron", sans-serif';
  ctx.strokeStyle = '#2a051a';
  ctx.lineWidth = 8;
  ctx.strokeText('CORRIDA DOCE · LARGADA · 3 VOLTAS', w / 2, 184);
  ctx.fillStyle = '#ffe866';
  ctx.fillText('CORRIDA DOCE · LARGADA · 3 VOLTAS', w / 2, 184);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createTrackBannerTexture(
  nameText = 'profdeborapaulo',
  subtitleText = 'SUGAR RUSH · CORRIDA DOCE',
  variant = 0
) {
  const w = 1024;
  const h = 320;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const palettes = [
    { top: '#ff1488', bot: '#b80d65', trim: '#ffffff', sub: '#ffe866', accent: '#6ef5c8' },
    { top: '#ff5ec4', bot: '#d91b7c', trim: '#fff5fb', sub: '#a8ffe2', accent: '#ffe34d' },
    { top: '#d61c88', bot: '#5c0b46', trim: '#ff9ce0', sub: '#ffffff', accent: '#ff4db8' },
  ];
  const pal = palettes[variant % palettes.length];

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0.0, pal.top);
  bg.addColorStop(1.0, pal.bot);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(12, 12, w - 24, h - 24, 38);
  ctx.fill();

  // Candy diagonal gloss stripes
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(12, 12, w - 24, h - 24, 38);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  for (let x = -h; x < w + h; x += 88) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 34, 0);
    ctx.lineTo(x - h + 34, h);
    ctx.lineTo(x - h, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Outer frosting border
  ctx.lineWidth = 14;
  ctx.strokeStyle = pal.trim;
  ctx.beginPath();
  ctx.roundRect(16, 16, w - 32, h - 32, 34);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.strokeStyle = pal.accent;
  ctx.beginPath();
  ctx.roundRect(30, 30, w - 60, h - 60, 24);
  ctx.stroke();

  // Subtitle on top
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = '800 34px "Orbitron", sans-serif';
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#330622';
  ctx.strokeText(subtitleText, w / 2, 86);
  ctx.fillStyle = pal.sub;
  ctx.fillText(subtitleText, w / 2, 86);

  // Main giant name: profdeborapaulo
  ctx.font = '900 88px "Inter", "Orbitron", sans-serif';
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#2d041d';
  ctx.strokeText(nameText, w / 2, 198);
  ctx.lineWidth = 5;
  ctx.strokeStyle = pal.accent;
  ctx.strokeText(nameText, w / 2, 198);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(nameText, w / 2, 198);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}
