import { VisualizerConfig } from '../../types';

export function getColor(scheme: VisualizerConfig['colorScheme'], factor: number, alpha: number = 1.0): string {
  switch (scheme) {
    case 'neon':
      return `hsla(${160 + factor * 140}, 100%, 55%, ${alpha})`;
    case 'rainbow':
      return `hsla(${factor * 360}, 90%, 60%, ${alpha})`;
    case 'sunset':
      return `hsla(${10 + factor * 50}, 100%, ${50 + factor * 20}%, ${alpha})`;
    case 'fire':
      return `hsla(${factor * 45}, 100%, ${40 + factor * 30}%, ${alpha})`;
    case 'monochrome':
      return `rgba(255, 255, 255, ${Math.max(0.2, factor * alpha)})`;
    case 'theme':
    default:
      // Primary cyan to accent purple gradient
      const r = Math.round(56 + factor * 136);
      const g = Math.round(189 - factor * 57);
      const b = 248;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  hue: number;
}

let particles: Particle[] = [];

function initParticles(width: number, height: number) {
  particles = [];
  for (let i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: 2 + Math.random() * 3,
      baseSize: 2 + Math.random() * 3,
      hue: Math.random() * 360,
    });
  }
}

export function renderVisualizer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frequencies: number[],
  waveform: number[],
  config: VisualizerConfig,
  energies: { bass: number; mid: number; treble: number },
  artworkColors?: { primary: string; secondary: string }
) {
  ctx.clearRect(0, 0, width, height);

  const freq = frequencies.length > 0 ? frequencies : new Array(64).fill(0);
  const wave = waveform.length > 0 ? waveform : new Array(128).fill(0);
  const { mode, barCount, sensitivity, colorScheme } = config;

  switch (mode) {
    case 'spectrum': {
      const count = Math.min(barCount, freq.length);
      const barWidth = width / count;
      const gap = Math.max(2, barWidth * 0.2);
      const effectiveWidth = barWidth - gap;

      for (let i = 0; i < count; i++) {
        const val = Math.min(1.0, (freq[i] || 0) * sensitivity);
        const barHeight = Math.max(4, val * (height * 0.85));
        const x = i * barWidth + gap / 2;
        const y = height - barHeight;

        const grad = ctx.createLinearGradient(0, y, 0, height);
        grad.addColorStop(0, getColor(colorScheme, i / count, 0.95));
        grad.addColorStop(1, getColor(colorScheme, i / count, 0.25));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, effectiveWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Peak cap
        ctx.fillStyle = getColor(colorScheme, i / count, 1.0);
        ctx.fillRect(x, Math.max(0, y - 3), effectiveWidth, 2);
      }
      break;
    }

    case 'circular': {
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.22 + energies.bass * 25 * sensitivity;
      const count = Math.min(barCount, 64);
      const angleStep = (Math.PI * 2) / count;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Center glow
      const glowGrad = ctx.createRadialGradient(0, 0, baseRadius * 0.2, 0, 0, baseRadius * 1.5);
      glowGrad.addColorStop(0, getColor(colorScheme, 0.5, 0.25 * energies.bass));
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        const val = Math.min(1.0, (freq[i % freq.length] || 0) * sensitivity);
        const barLen = Math.max(4, val * (Math.min(width, height) * 0.28));

        const x1 = Math.cos(angle) * baseRadius;
        const y1 = Math.sin(angle) * baseRadius;
        const x2 = Math.cos(angle) * (baseRadius + barLen);
        const y2 = Math.sin(angle) * (baseRadius + barLen);

        ctx.strokeStyle = getColor(colorScheme, i / count, 0.9);
        ctx.lineWidth = Math.max(2, (Math.PI * 2 * baseRadius) / count - 2);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'waveform': {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = getColor(colorScheme, 0.5, 0.95);
      const sliceWidth = width / wave.length;
      let x = 0;

      for (let i = 0; i < wave.length; i++) {
        const v = wave[i] * sensitivity;
        const y = height / 2 + v * (height * 0.4);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // Mirror reflection shadow
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = getColor(colorScheme, 0.5, 0.3);
      x = 0;
      for (let i = 0; i < wave.length; i++) {
        const v = wave[i] * sensitivity * 0.5;
        const y = height / 2 - v * (height * 0.2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      break;
    }

    case 'oscilloscope': {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = getColor(colorScheme, 0.3, 0.9);
      ctx.beginPath();
      const midY = height / 2;
      const step = width / wave.length;

      for (let i = 0; i < wave.length; i++) {
        const x = i * step;
        const y = midY + wave[i] * (height * 0.35) * sensitivity;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Phosphor persistence beam dot
      if (wave.length > 0) {
        const lastIdx = Math.floor(wave.length * 0.9);
        const dotX = lastIdx * step;
        const dotY = midY + wave[lastIdx] * (height * 0.35) * sensitivity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'radial-waveform': {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.28;
      const angleStep = (Math.PI * 2) / wave.length;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      ctx.strokeStyle = getColor(colorScheme, 0.7, 0.85);
      ctx.lineWidth = 2.5;

      for (let i = 0; i < wave.length; i++) {
        const angle = i * angleStep;
        const r = radius + wave[i] * 50 * sensitivity;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'frequency-rings': {
      const centerX = width / 2;
      const centerY = height / 2;
      const rings = [
        { energy: energies.bass, color: 0.1, label: 'Bass' },
        { energy: energies.mid, color: 0.5, label: 'Mids' },
        { energy: energies.treble, color: 0.85, label: 'Treble' },
      ];

      rings.forEach((ring, idx) => {
        const baseR = (idx + 1) * 55;
        const dynamicR = baseR + ring.energy * 60 * sensitivity;
        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicR, 0, Math.PI * 2);
        ctx.strokeStyle = getColor(colorScheme, ring.color, 0.8);
        ctx.lineWidth = 3 + ring.energy * 6;
        ctx.stroke();
      });
      break;
    }

    case 'particle-field': {
      if (particles.length === 0) initParticles(width, height);
      const speedMult = 1.0 + energies.bass * 2.5 * sensitivity;

      particles.forEach((p) => {
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentSize = p.baseSize + energies.bass * 5 * sensitivity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = getColor(colorScheme, (p.x / width + p.y / height) * 0.5, 0.85);
        ctx.fill();
      });
      break;
    }

    case 'ambient-waves': {
      const time = Date.now() * 0.002;
      const waveCount = 3;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.fillStyle = getColor(colorScheme, w / waveCount, 0.18 + w * 0.08);
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 10) {
          const energyFactor = (energies.bass * 0.5 + energies.mid * 0.5) * sensitivity;
          const y =
            height * 0.65 +
            Math.sin(x * 0.008 + time * (w + 1) + w) * (20 + energyFactor * 45) +
            Math.cos(x * 0.004 + time) * 15;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'mirror-spectrum': {
      const count = Math.floor(Math.min(barCount, freq.length) / 2);
      const halfWidth = width / 2;
      const barWidth = halfWidth / count;
      const gap = Math.max(1, barWidth * 0.2);
      const effectiveW = barWidth - gap;

      for (let i = 0; i < count; i++) {
        const val = Math.min(1.0, (freq[i] || 0) * sensitivity);
        const barH = Math.max(4, val * (height * 0.45));

        // Right side
        const rightX = halfWidth + i * barWidth;
        const leftX = halfWidth - (i + 1) * barWidth;
        const y = height / 2 - barH / 2;

        ctx.fillStyle = getColor(colorScheme, i / count, 0.9);
        ctx.fillRect(rightX, y, effectiveW, barH);
        ctx.fillRect(leftX, y, effectiveW, barH);
      }
      break;
    }

    case 'album-reactive': {
      // Dynamic ambient bloom matching album colors & audio heartbeat
      const centerX = width / 2;
      const centerY = height / 2;
      const pulse = 1.0 + energies.bass * 0.35 * sensitivity;

      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        30,
        centerX,
        centerY,
        Math.min(width, height) * 0.45 * pulse
      );

      grad.addColorStop(0, artworkColors?.primary || getColor(colorScheme, 0.4, 0.45 * pulse));
      grad.addColorStop(0.5, artworkColors?.secondary || getColor(colorScheme, 0.8, 0.25));
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle center circle ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = getColor(colorScheme, 0.6, 0.7);
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
  }
}
