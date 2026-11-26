import { getDeviceProfile } from './utils/device.js';

/**
 * MOUBON — detailed honeybee flight around the Royal Honey Emblem.
 * Canvas dimensions are CSS pixels; devicePixelRatio is applied exactly once.
 * Bees follow a rounded orbit outside the title, with independent flight speed,
 * direction, wing motion and small natural weaving movements.
 */
const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function makeGradient(ctx, y1, y2, stops) {
  const gradient = ctx.createLinearGradient(0, y1, 0, y2);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  return gradient;
}

function drawWing(ctx, x, y, length, width, angle, flap, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + flap * 0.34);
  ctx.scale(1, 0.78 + (Math.sin(flap * 2.4) + 1) * 0.12);
  ctx.globalAlpha = alpha;

  const wing = ctx.createLinearGradient(-width, -length, width, 1);
  wing.addColorStop(0, 'rgba(255,255,247,0.84)');
  wing.addColorStop(0.42, 'rgba(225,237,222,0.58)');
  wing.addColorStop(1, 'rgba(229,177,91,0.20)');

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(width * 0.62, -length * 0.23, width * 1.16, -length * 0.76, width * 0.12, -length);
  ctx.bezierCurveTo(-width * 0.72, -length * 0.91, -width * 1.03, -length * 0.38, 0, 0);
  ctx.closePath();
  ctx.fillStyle = wing;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,246,218,0.88)';
  ctx.lineWidth = 0.52;
  ctx.stroke();

  // Fine wing veins make the translucent wings read as insect wings, not blobs.
  ctx.strokeStyle = 'rgba(119,104,72,0.43)';
  ctx.lineWidth = 0.34;
  ctx.beginPath();
  ctx.moveTo(0, -0.8);
  ctx.quadraticCurveTo(width * 0.1, -length * 0.48, width * 0.08, -length * 0.94);
  ctx.moveTo(0, -1.2);
  ctx.quadraticCurveTo(-width * 0.46, -length * 0.42, -width * 0.72, -length * 0.77);
  ctx.moveTo(0, -1.2);
  ctx.quadraticCurveTo(width * 0.65, -length * 0.32, width * 0.62, -length * 0.65);
  ctx.stroke();
  ctx.restore();
}

function drawLeg(ctx, x, y, bend, endX, endY, alpha = 0.8) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#382717';
  ctx.lineWidth = 0.92;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(bend, y + 3.2, endX, endY);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(227,177,79,0.72)';
  ctx.lineWidth = 0.34;
  ctx.beginPath();
  ctx.moveTo(x + 0.25, y + 0.15);
  ctx.quadraticCurveTo(bend + 0.15, y + 3.0, endX + 0.2, endY);
  ctx.stroke();
  ctx.restore();
}

function beeDraw(ctx, x, y, angle, pixelWidth, flap, alpha, depth) {
  // Natural drawing is ~40 CSS units wide. This is the only per-bee scale.
  const scale = pixelWidth / 40;
  const wingPhase = Math.sin(flap);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  // Far wing pair first.
  drawWing(ctx, -1.4, -3.2, 11.8, 4.7, -0.43, wingPhase * 0.9, 0.58);
  drawWing(ctx, 2.2, -3.3, 13.8, 5.4, -0.12, -wingPhase, 0.76);

  // Six fine legs, partly tucked under the body.
  drawLeg(ctx, 3.1, 3.0, 4.0, 6.0, 8.1, 0.72);
  drawLeg(ctx, 0.1, 3.6, 0.8, 1.4, 8.5, 0.78);
  drawLeg(ctx, -3.2, 3.1, -4.8, -6.4, 7.3, 0.7);

  // Abdomen: tapered, rounded and segmented, with warm natural shading.
  ctx.beginPath();
  ctx.moveTo(-19.4, 0.1);
  ctx.bezierCurveTo(-17.5, -4.6, -12.1, -7.1, -6.0, -6.1);
  ctx.bezierCurveTo(-1.8, -5.5, 1.0, -2.9, 1.0, 0.5);
  ctx.bezierCurveTo(0.7, 4.4, -3.2, 6.6, -8.4, 6.6);
  ctx.bezierCurveTo(-14.2, 6.5, -18.4, 4.2, -19.4, 0.1);
  ctx.closePath();
  const abdomen = makeGradient(ctx, -6.8, 7, [
    [0, '#f9d47b'], [0.28, '#d99b35'], [0.62, '#a96820'], [1, '#58371d']
  ]);
  ctx.fillStyle = abdomen;
  ctx.fill();

  // Curved dark bands clipped to the abdomen give a clear honeybee pattern.
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#302216';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3.05;
  ctx.beginPath();
  ctx.moveTo(-15.3, -7.4); ctx.quadraticCurveTo(-11.4, 0.1, -15.1, 7.4);
  ctx.moveTo(-9.8, -7.1); ctx.quadraticCurveTo(-6.0, 0.2, -9.6, 7.2);
  ctx.moveTo(-4.2, -6.5); ctx.quadraticCurveTo(-1.0, 0.1, -4.1, 6.8);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,218,139,0.48)';
  ctx.lineWidth = 0.58;
  ctx.beginPath();
  ctx.moveTo(-17.2, -3.8); ctx.quadraticCurveTo(-12.8, -6.5, -8.0, -5.9);
  ctx.moveTo(-7.0, -5.7); ctx.quadraticCurveTo(-3.5, -5.1, -1.3, -2.9);
  ctx.stroke();
  ctx.restore();

  // Fine abdomen edge and pointed stinger.
  ctx.strokeStyle = 'rgba(75,43,17,0.82)';
  ctx.lineWidth = 0.62;
  ctx.beginPath();
  ctx.moveTo(-18.5, 1.5); ctx.quadraticCurveTo(-20.8, 1.0, -22.0, 0.4);
  ctx.stroke();
  ctx.fillStyle = '#49301c';
  ctx.beginPath();
  ctx.moveTo(-19.0, 0.1); ctx.lineTo(-22.5, 0.4); ctx.lineTo(-19.0, 1.4); ctx.closePath();
  ctx.fill();

  // Thorax: warm amber, slightly fuzzy, visibly distinct from the abdomen.
  const thorax = makeGradient(ctx, -5.2, 5.5, [
    [0, '#f8d47a'], [0.38, '#d99b36'], [0.78, '#a96b25'], [1, '#69401e']
  ]);
  ctx.fillStyle = thorax;
  ctx.beginPath();
  ctx.ellipse(2.1, 0.2, 5.6, 4.9, -0.08, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,226,157,0.72)';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.ellipse(1.0, -1.2, 3.5, 2.3, -0.16, Math.PI * 1.08, Math.PI * 1.88);
  ctx.stroke();

  // Tiny golden hairs on the thorax.
  ctx.strokeStyle = 'rgba(255,222,145,0.68)';
  ctx.lineWidth = 0.42;
  for (let i = 0; i < 7; i++) {
    const hx = -1.4 + i * 1.05;
    ctx.beginPath();
    ctx.moveTo(hx, -3.5 + Math.abs(hx) * 0.13);
    ctx.lineTo(hx - 0.8, -5.0 + Math.abs(hx) * 0.1);
    ctx.stroke();
  }

  // Near wing pair, brighter than the far pair.
  drawWing(ctx, -1.0, -3.0, 12.2, 4.9, -0.58, -wingPhase, 0.88);
  drawWing(ctx, 2.3, -3.1, 14.6, 5.7, -0.27, wingPhase, 0.96);

  // Head with a glossy dark compound eye and warm facial highlight.
  const head = makeGradient(ctx, -4.2, 4.5, [
    [0, '#59402a'], [0.35, '#2c2118'], [1, '#100d0a']
  ]);
  ctx.fillStyle = head;
  ctx.beginPath();
  ctx.ellipse(10.7, 0.25, 4.55, 4.15, 0.08, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#100c09';
  ctx.beginPath();
  ctx.ellipse(12.5, -1.35, 1.45, 1.78, 0.15, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,240,199,0.88)';
  ctx.beginPath();
  ctx.ellipse(12.95, -2.05, 0.46, 0.52, 0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(215,170,88,0.75)';
  ctx.beginPath();
  ctx.ellipse(14.5, 1.65, 0.9, 0.6, 0.2, 0, TAU);
  ctx.fill();

  // Two curved antennae with tiny rounded tips.
  ctx.strokeStyle = '#342417';
  ctx.lineWidth = 0.82;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(11.0, -3.1); ctx.quadraticCurveTo(12.4, -7.0, 15.4, -7.5);
  ctx.moveTo(13.0, -2.7); ctx.quadraticCurveTo(15.7, -5.1, 17.4, -4.7);
  ctx.stroke();
  ctx.fillStyle = '#b98a3d';
  ctx.beginPath(); ctx.arc(15.4, -7.5, 0.72, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(17.4, -4.7, 0.65, 0, TAU); ctx.fill();

  // A small near-side leg and pollen hint make the silhouette less ant-like.
  drawLeg(ctx, 0.8, 3.6, 2.7, 4.4, 8.0, 0.95);
  drawLeg(ctx, -2.4, 3.8, -2.6, -1.0, 8.8, 0.88);
  ctx.fillStyle = '#dca13b';
  ctx.beginPath();
  ctx.ellipse(-5.9, 7.2, 1.7, 1.15, -0.25, 0, TAU);
  ctx.fill();

  // Soft specular glint on the upper body.
  ctx.globalAlpha = alpha * (depth === 2 ? 0.45 : 0.3);
  ctx.fillStyle = '#fff2c7';
  ctx.beginPath();
  ctx.ellipse(3.0, -3.1, 1.6, 0.58, -0.32, 0, TAU);
  ctx.fill();

  ctx.restore();
}

function orbitPoint(angle, cx, cy, rx, ry) {
  // Superellipse gives a soft rounded-rectangle orbit around the wordmark.
  const power = 0.12;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: cx + Math.sign(c) * Math.pow(Math.abs(c), power) * rx,
    y: cy + Math.sign(s) * Math.pow(Math.abs(s), power) * ry,
  };
}

export function setupBeeLogo({ canvas, title, stage, reducedMotion, beeScale = 1, beeCount = null }) {
  if (!canvas || !stage || !title) return { restart() {} };
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx || reducedMotion?.matches) {
    stage.classList.add('bees-complete');
    return { restart() {} };
  }

  const { lowPower } = getDeviceProfile();
  let w = 500;
  let h = 200;
  let dpr = 1;
  let bees = [];
  let elapsed = 0;
  let lastTime = 0;
  let raf = 0;
  let visible = true;
  let resizeTimer;

  function resize() {
    const rect = stage.getBoundingClientRect();
    w = Math.max(280, Math.round(rect.width));
    h = Math.max(120, Math.round(rect.height));
    dpr = Math.min(lowPower ? 1.25 : 1.75, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    resize();
    const mobile = w <= 430;
    const tablet = w > 430 && w <= 900;
    const requestedCount = typeof beeCount === 'number'
      ? beeCount
      : beeCount && Number.isInteger(beeCount[mobile ? 'mobile' : tablet ? 'tablet' : 'desktop'])
        ? beeCount[mobile ? 'mobile' : tablet ? 'tablet' : 'desktop']
        : null;
    const count = Math.max(1, requestedCount || (lowPower ? (mobile ? 5 : tablet ? 6 : 7) : (mobile ? 6 : tablet ? 7 : 9)));
    const scaleFactor = clamp(Number(beeScale) || 1, 0.35, 1.5);
    const titleRect = title.getBoundingClientRect();
    const titleHalfWidth = Math.min(w * 0.43, Math.max(72, titleRect.width * 0.5));
    const titleHalfHeight = Math.min(h * 0.39, Math.max(34, titleRect.height * 0.5));
    const maxBee = (mobile ? 27 : tablet ? 30 : 33) * scaleFactor;
    // Keep the orbit close to the stage perimeter so bees frame the title instead of crossing its letters.
    const rx = Math.min(w * 0.5 - maxBee * 0.58 - 5, titleHalfWidth + (mobile ? 30 : 78));
    const maxRy = Math.max(32, h * 0.5 - maxBee * 0.44 - 5);
    const ry = Math.min(maxRy, titleHalfHeight + (mobile ? 14 : 24));
    const cx = w * 0.5;
    const cy = h * 0.5;

    bees = Array.from({ length: count }, (_, i) => {
      const baseAngle = (i / count) * TAU + (i % 2 ? 0.12 : -0.08);
      const depth = i % 3;
      const baseSize = (mobile
        ? [22, 24, 26][depth]
        : tablet
          ? [24, 27, 30][depth]
          : [26, 30, 33][depth]) * scaleFactor;
      return {
        angle: baseAngle,
        rx: rx * (0.97 + (i % 4) * 0.012),
        ry: ry * (0.96 + (i % 3) * 0.018),
        cx,
        cy,
        speed: 0.29 + (i % 5) * 0.052 + (i % 2) * 0.028,
        direction: i % 2 === 0 ? 1 : -1,
        seed: i * 3.73 + 0.6,
        flapPhase: i * 1.91,
        baseSize,
        depth,
        alpha: depth === 2 ? 1 : depth === 1 ? 0.94 : 0.84,
      };
    });
  }

  function frame(timestamp) {
    raf = 0;
    if (!visible || document.hidden || reducedMotion?.matches) return;
    const dt = lastTime ? clamp((timestamp - lastTime) / 1000, 0, 0.04) : 1 / 60;
    lastTime = timestamp;
    elapsed += dt;
    ctx.clearRect(0, 0, w, h);

    const ordered = [...bees].sort((a, b) => a.depth - b.depth);
    for (const bee of ordered) {
      bee.angle += bee.speed * dt * bee.direction;
      const p = orbitPoint(bee.angle, bee.cx, bee.cy, bee.rx, bee.ry);
      const ahead = orbitPoint(bee.angle + 0.008 * bee.direction, bee.cx, bee.cy, bee.rx, bee.ry);
      const behind = orbitPoint(bee.angle - 0.008 * bee.direction, bee.cx, bee.cy, bee.rx, bee.ry);
      const tangentX = ahead.x - behind.x;
      const tangentY = ahead.y - behind.y;
      const weaveX = Math.sin(elapsed * 2.2 + bee.seed) * 2.8 + Math.sin(elapsed * 4.1 + bee.seed) * 0.9;
      const weaveY = Math.cos(elapsed * 1.8 + bee.seed) * 3.4 + Math.sin(elapsed * 3.7 + bee.seed) * 1.0;
      const x = clamp(p.x + weaveX, bee.baseSize * 0.58, w - bee.baseSize * 0.58);
      const y = clamp(p.y + weaveY, bee.baseSize * 0.58, h - bee.baseSize * 0.58);
      const bank = Math.sin(elapsed * 1.35 + bee.seed) * 0.09;
      const theta = Math.atan2(tangentY, tangentX) + bank;
      const flap = elapsed * 42 + bee.flapPhase;
      const sizePulse = 1 + Math.sin(elapsed * 0.72 + bee.seed) * 0.035;
      const size = bee.baseSize * sizePulse;
      beeDraw(ctx, x, y, theta, size, flap, bee.alpha, bee.depth);
    }

    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
  }

  function restart() {
    stop();
    elapsed = 0;
    stage.classList.remove('bees-complete');
    stage.classList.add('bees-running');
    build();
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false;
    if (!visible) stop();
    else if (!raf) {
      lastTime = 0;
      raf = requestAnimationFrame(frame);
    }
  }, { rootMargin: '140px' });
  observer.observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible && !raf) raf = requestAnimationFrame(frame);
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      stop();
      build();
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }, 160);
  }, { passive: true });

  reducedMotion?.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      stop();
      stage.classList.add('bees-complete');
      ctx.clearRect(0, 0, w, h);
    } else restart();
  });

  restart();
  return { restart };
}
