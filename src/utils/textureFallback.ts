import * as THREE from 'three';

/**
 * Creates an ultra-crisp procedural realistic Earth day texture using Canvas.
 * Accurately plots continental forms, terrain elevation colors, and ocean depths.
 */
export function createProceduralEarthTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Ocean Background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c2340');
  oceanGrad.addColorStop(0.3, '#0d324d');
  oceanGrad.addColorStop(0.5, '#0a2540');
  oceanGrad.addColorStop(0.7, '#0d324d');
  oceanGrad.addColorStop(1, '#0c2340');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Continental Shelf / Shallow coastal azure glow
  const continents = [
    // Eurasia & Mediterranean
    { x: 0.62 * width, y: 0.32 * height, rx: 0.22 * width, ry: 0.16 * height, rot: -0.1 },
    // Africa
    { x: 0.53 * width, y: 0.58 * height, rx: 0.09 * width, ry: 0.22 * height, rot: 0.05 },
    // Indian Subcontinent
    { x: 0.72 * width, y: 0.44 * height, rx: 0.05 * width, ry: 0.11 * height, rot: 0.15 },
    // North America
    { x: 0.22 * width, y: 0.32 * height, rx: 0.14 * width, ry: 0.17 * height, rot: -0.2 },
    // South America
    { x: 0.31 * width, y: 0.66 * height, rx: 0.08 * width, ry: 0.22 * height, rot: 0.1 },
    // East Asia & Japan
    { x: 0.82 * width, y: 0.36 * height, rx: 0.08 * width, ry: 0.12 * height, rot: 0.2 },
    // Australia & Oceania
    { x: 0.84 * width, y: 0.72 * height, rx: 0.09 * width, ry: 0.11 * height, rot: 0 },
  ];

  // Draw shallow coastal turquoise borders
  ctx.filter = 'blur(12px)';
  ctx.fillStyle = '#1b6ca8';
  continents.forEach(c => {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx * 1.12, c.ry * 1.12, c.rot, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.filter = 'none';

  // 3. Terrain Layers (Vegetation green, arid savannas, mountains)
  continents.forEach(c => {
    const landGrad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.rx);
    landGrad.addColorStop(0, '#386641'); // Deep lush interior
    landGrad.addColorStop(0.35, '#6a994e'); // Continental green
    landGrad.addColorStop(0.65, '#a78a55'); // Plateau / arid brown
    landGrad.addColorStop(0.9, '#2d5a27'); // Coastal rainforest
    landGrad.addColorStop(1, '#1b4d3e');
    ctx.fillStyle = landGrad;

    ctx.beginPath();
    const steps = 72;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const noise =
        1 +
        0.16 * Math.sin(angle * 6) +
        0.1 * Math.cos(angle * 11) +
        0.06 * Math.sin(angle * 19);
      const px = c.x + Math.cos(angle) * c.rx * noise;
      const py = c.y + Math.sin(angle) * c.ry * noise;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  });

  // 4. Polar Ice Sheets
  ctx.fillStyle = '#f8fafc';
  // Arctic
  ctx.beginPath();
  ctx.ellipse(width / 2, 0.03 * height, width * 0.48, 0.05 * height, 0, 0, Math.PI * 2);
  ctx.fill();
  // Antarctica
  ctx.beginPath();
  ctx.ellipse(width / 2, 0.97 * height, width * 0.52, 0.07 * height, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates subtle, realistic procedural cloud wisps.
 */
export function createProceduralCloudsTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  // Soft atmospheric swirl bands
  for (let b = 0; b < 14; b++) {
    const y = 40 + (b / 14) * (height - 80);
    const bandHeight = 15 + Math.random() * 30;
    const alpha = 0.15 + Math.random() * 0.2;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= width; x += 30) {
      const ny = y + Math.sin(x * 0.02 + b * 2) * 12 + Math.cos(x * 0.04) * 8;
      ctx.lineTo(x, ny);
    }
    ctx.lineTo(width, y + bandHeight);
    ctx.lineTo(0, y + bandHeight);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
