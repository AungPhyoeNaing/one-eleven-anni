import * as THREE from 'three';

export function createNoiseTexture(size = 512, intensity = 50): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Generate simple static noise
    const val = Math.floor(Math.random() * intensity) + (255 - intensity);
    data[i] = val;     // red
    data[i + 1] = val; // green
    data[i + 2] = val; // blue
    data[i + 3] = 255; // alpha
  }

  ctx.putImageData(imgData, 0, 0);

  // Apply some blurring to make it look organic and soft (like craters/bumps)
  ctx.globalAlpha = 0.5;
  for(let i = 0; i < 5; i++) {
    ctx.drawImage(canvas, 1, 1, size-2, size-2, 0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createBandedTexture(colorBase: string, size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Fill base color
  ctx.fillStyle = colorBase;
  ctx.fillRect(0, 0, size, size);

  // Draw gas giant bands (sharp, high contrast)
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * size;
    const height = Math.random() * (size / 15) + 5; // Thinner, crisper bands
    
    // Very distinct bands
    const intensity = Math.random();
    if (intensity > 0.6) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    } else if (intensity < 0.3) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    }
    ctx.fillRect(0, y, size, height);
    
    // Add some crisp dark lines inside bands
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, y + height / 2, size, 3);
  }

  // Draw some storm spots (like Jupiter)
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 50 + 10;
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();
    
    // Inner storm eye
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
