import { useTheme } from './ThemeContext';

function buildLoaderHtml(isDark: boolean) {
  const bg = isDark ? '#08080b' : '#f7f7f8';
  const loadingTextColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)';
  const barTrackBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const barFillFrom = isDark ? 'rgba(255,77,77,0.4)' : 'rgba(225,6,0,0.4)';
  const barFillTo = isDark ? 'rgba(255,45,45,0.8)' : 'rgba(225,6,0,0.8)';
  const glowColor = isDark ? 'rgba(255,45,45,0.06)' : 'rgba(225,6,0,0.08)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cube Morphing Loader</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    min-height: 100vh;
    background: ${bg};
    overflow: hidden;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  }

  .loader-wrap {
    position: relative;
    width: 400px;
    height: 400px;
  }

  #cubeCanvas {
    width: 100%;
    height: 100%;
  }

  .loading-text {
    margin-top: 28px;
    text-align: center;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${loadingTextColor};
    font-weight: 400;
    height: 20px;
    overflow: hidden;
    position: relative;
    min-width: 260px;
  }

  .loading-msg {
    position: absolute;
    width: 100%;
    text-align: center;
    transition: opacity 0.5s ease, transform 0.5s ease;
    opacity: 0;
    transform: translateY(6px);
  }

  .loading-msg.active {
    opacity: 1;
    transform: translateY(0);
  }

  .loading-bar-wrap {
    margin-top: 22px;
    width: 200px;
  }

  .loading-bar-track {
    width: 100%;
    height: 2px;
    background: ${barTrackBg};
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .loading-bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, ${barFillFrom}, ${barFillTo});
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  .ambient-glow {
    position: absolute;
    top: 50%; left: 50%;
    width: 180px; height: 180px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.8s ease;
  }
  .ambient-glow.on { opacity: 1; }
</style>
</head>
<body>

<div class="loader-wrap">
  <div class="ambient-glow" id="ambientGlow"></div>
  <svg id="cubeCanvas" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="topGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f0f0f0"/><stop offset="100%" stop-color="#d0d0d0"/>
      </linearGradient>
      <linearGradient id="leftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b0b0b0"/><stop offset="100%" stop-color="#909090"/>
      </linearGradient>
      <linearGradient id="rightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c0c0c0"/><stop offset="100%" stop-color="#a0a0a0"/>
      </linearGradient>
      <linearGradient id="brandTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#ff2d2d"/>
      </linearGradient>
      <linearGradient id="brandLeft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#cc0000"/><stop offset="100%" stop-color="#990000"/>
      </linearGradient>
      <linearGradient id="brandRight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ff1a1a"/><stop offset="100%" stop-color="#cc0000"/>
      </linearGradient>
    </defs>
    <g id="cubeGroup"></g>
  </svg>
</div>

<div class="loading-text" id="loadingText"></div>
<div class="loading-bar-wrap">
  <div class="loading-bar-track"><div class="loading-bar-fill" id="loadingFill"></div></div>
</div>

<script>
const formations = {
  original: {
    label: 'Quib',
    cubes: [
      { x: 200, y: 215, op: 1.0, brand: 1 },
      { x: 160, y: 140, op: 0.5, brand: 0 },
      { x: 240, y: 140, op: 0.5, brand: 0 },
      { x: 120, y: 190, op: 0.7, brand: 0 },
      { x: 200, y: 165, op: 0.7, brand: 0 },
      { x: 280, y: 190, op: 0.7, brand: 0 },
      { x: 160, y: 240, op: 1.0, brand: 0 },
      { x: 240, y: 240, op: 1.0, brand: 0 },
      { x: 200, y: 265, op: 1.0, brand: 0 },
      { x: 200, y: 215, op: 0, brand: 0 },
      { x: 200, y: 215, op: 0, brand: 0 },
      { x: 200, y: 215, op: 0, brand: 0 },
      { x: 200, y: 215, op: 0, brand: 0 },
      { x: 200, y: 215, op: 0, brand: 0 },
    ]
  },
  ram: {
    label: 'Ram',
    cubes: [
      { x: 200, y: 220, op: 1.0, brand: 1 },
      { x: 200, y: 270, op: 1.0, brand: 1 },
      { x: 130, y: 200, op: 0.75, brand: 0 },
      { x: 70,  y: 150, op: 0.6, brand: 0 },
      { x: 50,  y: 90,  op: 0.45, brand: 0 },
      { x: 90,  y: 40,  op: 0.35, brand: 0 },
      { x: 270, y: 200, op: 0.75, brand: 0 },
      { x: 330, y: 150, op: 0.6, brand: 0 },
      { x: 350, y: 90,  op: 0.45, brand: 0 },
      { x: 310, y: 40,  op: 0.35, brand: 0 },
      { x: 180, y: 320, op: 0.5, brand: 0 },
      { x: 220, y: 320, op: 0.5, brand: 0 },
      { x: 200, y: 220, op: 0, brand: 0 },
      { x: 200, y: 220, op: 0, brand: 0 },
    ]
  },
  serpent: {
    label: 'Serpent',
    cubes: [
      { x: 290, y: 80,  op: 1.0, brand: 1 },
      { x: 340, y: 50,  op: 0.5, brand: 0 },
      { x: 240, y: 130, op: 0.85, brand: 0 },
      { x: 180, y: 170, op: 0.75, brand: 0 },
      { x: 130, y: 220, op: 0.68, brand: 0 },
      { x: 160, y: 270, op: 0.6, brand: 0 },
      { x: 220, y: 310, op: 0.52, brand: 0 },
      { x: 270, y: 350, op: 0.45, brand: 0 },
      { x: 240, y: 400, op: 0.38, brand: 0 },
      { x: 190, y: 440, op: 0.3, brand: 0 },
      { x: 220, y: 250, op: 0, brand: 0 },
      { x: 220, y: 250, op: 0, brand: 0 },
      { x: 220, y: 250, op: 0, brand: 0 },
      { x: 220, y: 250, op: 0, brand: 0 },
    ]
  },
  tiger: {
    label: 'Tiger',
    cubes: [
      { x: 90,  y: 180, op: 1.0, brand: 1 },
      { x: 60,  y: 140, op: 0.65, brand: 0 },
      { x: 130, y: 140, op: 0.65, brand: 0 },
      { x: 160, y: 220, op: 0.7, brand: 0 },
      { x: 240, y: 250, op: 0.6, brand: 0 },
      { x: 320, y: 270, op: 0.5, brand: 0 },
      { x: 50,  y: 250, op: 0.55, brand: 0 },
      { x: 20,  y: 310, op: 0.45, brand: 0 },
      { x: 320, y: 320, op: 0.45, brand: 0 },
      { x: 380, y: 240, op: 0.38, brand: 0 },
      { x: 420, y: 200, op: 0.3, brand: 0 },
      { x: 220, y: 230, op: 0, brand: 0 },
      { x: 220, y: 230, op: 0, brand: 0 },
      { x: 220, y: 230, op: 0, brand: 0 },
    ]
  },
  boar: {
    label: 'Boar',
    cubes: [
      { x: 80,  y: 220, op: 1.0, brand: 1 },
      { x: 40,  y: 180, op: 0.65, brand: 0 },
      { x: 50,  y: 270, op: 0.65, brand: 0 },
      { x: 150, y: 200, op: 0.8, brand: 0 },
      { x: 150, y: 250, op: 0.8, brand: 0 },
      { x: 230, y: 190, op: 0.6, brand: 0 },
      { x: 230, y: 240, op: 0.6, brand: 0 },
      { x: 310, y: 210, op: 0.55, brand: 0 },
      { x: 310, y: 260, op: 0.55, brand: 0 },
      { x: 380, y: 220, op: 0.45, brand: 0 },
      { x: 430, y: 190, op: 0.3, brand: 0 },
      { x: 230, y: 220, op: 0, brand: 0 },
      { x: 230, y: 220, op: 0, brand: 0 },
      { x: 230, y: 220, op: 0, brand: 0 },
    ]
  },
  rat: {
    label: 'Rat',
    cubes: [
      { x: 130, y: 220, op: 1.0, brand: 1 },
      { x: 70,  y: 200, op: 0.45, brand: 0 },
      { x: 70,  y: 240, op: 0.45, brand: 0 },
      { x: 190, y: 210, op: 0.75, brand: 0 },
      { x: 190, y: 250, op: 0.7, brand: 0 },
      { x: 250, y: 230, op: 0.6, brand: 0 },
      { x: 150, y: 280, op: 0.4, brand: 0 },
      { x: 230, y: 280, op: 0.4, brand: 0 },
      { x: 310, y: 220, op: 0.45, brand: 0 },
      { x: 370, y: 200, op: 0.35, brand: 0 },
      { x: 420, y: 170, op: 0.28, brand: 0 },
      { x: 200, y: 230, op: 0, brand: 0 },
      { x: 200, y: 230, op: 0, brand: 0 },
      { x: 200, y: 230, op: 0, brand: 0 },
    ]
  },
  ox: {
    label: 'Ox',
    cubes: [
      { x: 150, y: 220, op: 1.0, brand: 1 },
      { x: 70,  y: 190, op: 0.6, brand: 0 },
      { x: 30,  y: 170, op: 0.4, brand: 0 },
      { x: 230, y: 190, op: 0.6, brand: 0 },
      { x: 270, y: 170, op: 0.4, brand: 0 },
      { x: 150, y: 260, op: 0.75, brand: 0 },
      { x: 210, y: 240, op: 0.7, brand: 0 },
      { x: 210, y: 280, op: 0.65, brand: 0 },
      { x: 270, y: 260, op: 0.6, brand: 0 },
      { x: 330, y: 250, op: 0.5, brand: 0 },
      { x: 160, y: 310, op: 0.4, brand: 0 },
      { x: 300, y: 310, op: 0.4, brand: 0 },
      { x: 200, y: 240, op: 0, brand: 0 },
      { x: 200, y: 240, op: 0, brand: 0 },
    ]
  },
  hare: {
    label: 'Hare',
    cubes: [
      { x: 200, y: 230, op: 1.0, brand: 1 },
      { x: 180, y: 130, op: 0.55, brand: 0 },
      { x: 180, y: 180, op: 0.7, brand: 0 },
      { x: 220, y: 120, op: 0.5, brand: 0 },
      { x: 220, y: 170, op: 0.65, brand: 0 },
      { x: 180, y: 280, op: 0.7, brand: 0 },
      { x: 220, y: 280, op: 0.7, brand: 0 },
      { x: 200, y: 320, op: 0.6, brand: 0 },
      { x: 160, y: 360, op: 0.45, brand: 0 },
      { x: 240, y: 360, op: 0.45, brand: 0 },
      { x: 200, y: 370, op: 0.3, brand: 0 },
      { x: 200, y: 260, op: 0, brand: 0 },
      { x: 200, y: 260, op: 0, brand: 0 },
      { x: 200, y: 260, op: 0, brand: 0 },
    ]
  },
  dragon: {
    label: 'Dragon',
    cubes: [
      { x: 140, y: 180, op: 1.0, brand: 1 },
      { x: 140, y: 130, op: 0.7, brand: 0 },
      { x: 180, y: 220, op: 0.8, brand: 0 },
      { x: 220, y: 250, op: 0.7, brand: 0 },
      { x: 260, y: 280, op: 0.6, brand: 0 },
      { x: 240, y: 320, op: 0.5, brand: 0 },
      { x: 200, y: 350, op: 0.4, brand: 0 },
      { x: 80,  y: 160, op: 0.55, brand: 0 },
      { x: 30,  y: 120, op: 0.4, brand: 0 },
      { x: 60,  y: 210, op: 0.45, brand: 0 },
      { x: 250, y: 170, op: 0.55, brand: 0 },
      { x: 310, y: 130, op: 0.4, brand: 0 },
      { x: 290, y: 210, op: 0.45, brand: 0 },
      { x: 90,  y: 160, op: 0.35, brand: 0 },
    ]
  },
  horse: {
    label: 'Horse',
    cubes: [
      { x: 110, y: 170, op: 1.0, brand: 1 },
      { x: 140, y: 130, op: 0.55, brand: 0 },
      { x: 170, y: 110, op: 0.4, brand: 0 },
      { x: 160, y: 200, op: 0.8, brand: 0 },
      { x: 220, y: 220, op: 0.7, brand: 0 },
      { x: 280, y: 230, op: 0.6, brand: 0 },
      { x: 340, y: 240, op: 0.5, brand: 0 },
      { x: 80,  y: 240, op: 0.5, brand: 0 },
      { x: 60,  y: 300, op: 0.4, brand: 0 },
      { x: 320, y: 290, op: 0.45, brand: 0 },
      { x: 350, y: 310, op: 0.38, brand: 0 },
      { x: 380, y: 210, op: 0.35, brand: 0 },
      { x: 420, y: 190, op: 0.28, brand: 0 },
      { x: 230, y: 220, op: 0, brand: 0 },
    ]
  },
  monkey: {
    label: 'Monkey',
    cubes: [
      { x: 200, y: 160, op: 1.0, brand: 1 },
      { x: 200, y: 210, op: 0.8, brand: 0 },
      { x: 200, y: 260, op: 0.7, brand: 0 },
      { x: 120, y: 190, op: 0.6, brand: 0 },
      { x: 60,  y: 170, op: 0.45, brand: 0 },
      { x: 280, y: 190, op: 0.6, brand: 0 },
      { x: 340, y: 170, op: 0.45, brand: 0 },
      { x: 160, y: 300, op: 0.5, brand: 0 },
      { x: 240, y: 300, op: 0.5, brand: 0 },
      { x: 250, y: 290, op: 0.4, brand: 0 },
      { x: 300, y: 310, op: 0.32, brand: 0 },
      { x: 330, y: 290, op: 0.25, brand: 0 },
      { x: 200, y: 230, op: 0, brand: 0 },
      { x: 200, y: 230, op: 0, brand: 0 },
    ]
  },
  bird: {
    label: 'Bird',
    cubes: [
      { x: 200, y: 210, op: 1.0, brand: 1 },
      { x: 200, y: 170, op: 0.8, brand: 0 },
      { x: 200, y: 140, op: 0.45, brand: 0 },
      { x: 140, y: 200, op: 0.75, brand: 0 },
      { x: 80,  y: 180, op: 0.6, brand: 0 },
      { x: 20,  y: 155, op: 0.42, brand: 0 },
      { x: 100, y: 220, op: 0.5, brand: 0 },
      { x: 260, y: 200, op: 0.75, brand: 0 },
      { x: 320, y: 180, op: 0.6, brand: 0 },
      { x: 380, y: 155, op: 0.42, brand: 0 },
      { x: 300, y: 220, op: 0.5, brand: 0 },
      { x: 180, y: 260, op: 0.4, brand: 0 },
      { x: 220, y: 260, op: 0.4, brand: 0 },
      { x: 200, y: 210, op: 0, brand: 0 },
    ]
  },
  dog: {
    label: 'Dog',
    cubes: [
      { x: 180, y: 150, op: 1.0, brand: 1 },
      { x: 140, y: 130, op: 0.6, brand: 0 },
      { x: 220, y: 130, op: 0.6, brand: 0 },
      { x: 180, y: 110, op: 0.5, brand: 0 },
      { x: 180, y: 200, op: 0.75, brand: 0 },
      { x: 180, y: 250, op: 0.65, brand: 0 },
      { x: 140, y: 290, op: 0.5, brand: 0 },
      { x: 220, y: 290, op: 0.5, brand: 0 },
      { x: 220, y: 250, op: 0.55, brand: 0 },
      { x: 260, y: 270, op: 0.45, brand: 0 },
      { x: 280, y: 230, op: 0.38, brand: 0 },
      { x: 310, y: 200, op: 0.3, brand: 0 },
      { x: 200, y: 220, op: 0, brand: 0 },
      { x: 200, y: 220, op: 0, brand: 0 },
    ]
  },
};

const sequence = ['original', 'ram', 'serpent', 'tiger', 'boar', 'rat', 'ox', 'hare', 'dragon', 'horse', 'monkey', 'bird', 'dog'];
const CUBE_COUNT = 14;
const HOLD_MS = 1200;
const MORPH_MS = 1000;

const NS = 'http://www.w3.org/2000/svg';
const cubeGroup = document.getElementById('cubeGroup');
const glow = document.getElementById('ambientGlow');

function makePoly(points, fill, stroke, strokeW) {
  const p = document.createElementNS(NS, 'polygon');
  p.setAttribute('points', points);
  p.setAttribute('fill', fill);
  if (stroke) { p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', strokeW); }
  return p;
}

const cubeEls = [];
for (let i = 0; i < CUBE_COUNT; i++) {
  const g = document.createElementNS(NS, 'g');
  g.style.willChange = 'transform, opacity';

  const silver = document.createElementNS(NS, 'g');
  silver.appendChild(makePoly('0,30 50,5 100,30 50,55', 'url(#topGrad)'));
  silver.appendChild(makePoly('0,30 0,80 50,105 50,55', 'url(#leftGrad)'));
  silver.appendChild(makePoly('100,30 100,80 50,105 50,55', 'url(#rightGrad)'));

  const brand = document.createElementNS(NS, 'g');
  brand.appendChild(makePoly('0,30 50,5 100,30 50,55', 'url(#brandTop)', '#000', '0.5'));
  brand.appendChild(makePoly('0,30 0,80 50,105 50,55', 'url(#brandLeft)', '#000', '0.5'));
  brand.appendChild(makePoly('100,30 100,80 50,105 50,55', 'url(#brandRight)', '#000', '0.5'));
  const hl = makePoly('0,30 50,5 100,30 50,55', '#fff');
  hl.setAttribute('opacity', '0.2');
  brand.appendChild(hl);
  brand.style.opacity = 0;

  g.appendChild(silver);
  g.appendChild(brand);
  cubeGroup.appendChild(g);

  cubeEls.push({ g, silver, brand });
}

const loadingMessages = [
  'Preparing your quiz\\u2026',
  'Shuffling questions\\u2026',
  'Loading answers\\u2026',
  'Generating results\\u2026',
  'Almost there\\u2026',
  'Building your challenge\\u2026',
  'Crunching the numbers\\u2026',
  'Setting difficulty\\u2026',
  'Picking categories\\u2026',
  'Warming up\\u2026',
  'Fetching questions\\u2026',
  'Locking in scores\\u2026',
  'Calibrating hints\\u2026',
];
const loadingText = document.getElementById('loadingText');
const msgEls = loadingMessages.map(msg => {
  const el = document.createElement('div');
  el.className = 'loading-msg';
  el.textContent = msg;
  loadingText.appendChild(el);
  return el;
});

const loadingFill = document.getElementById('loadingFill');

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) { return a + (b - a) * t; }

let currentIdx = 0;
let phase = 'hold';
let phaseStart = 0;

function getFormation(idx) {
  return formations[sequence[idx % sequence.length]].cubes;
}

function applyState(cubes) {
  const indices = cubes.map((c, i) => i).sort((a, b) => cubes[a].y - cubes[b].y);
  indices.forEach((i) => {
    const c = cubes[i];
    const el = cubeEls[i];
    el.g.setAttribute('transform', 'translate(' + c.x + ', ' + c.y + ')');
    el.g.style.opacity = c.op;
    el.brand.style.opacity = c.brand;
    cubeGroup.appendChild(el.g);
  });
}

function tick(now) {
  if (!phaseStart) phaseStart = now;
  const elapsed = now - phaseStart;

  if (phase === 'hold') {
    applyState(getFormation(currentIdx));
    const msgIdx = currentIdx % msgEls.length;
    msgEls.forEach((el, i) => el.classList.toggle('active', i === msgIdx));
    glow.classList.add('on');

    const totalCycle = sequence.length * (HOLD_MS + MORPH_MS);
    const cyclePos = (currentIdx * (HOLD_MS + MORPH_MS) + elapsed);
    loadingFill.style.width = Math.min((cyclePos / totalCycle) * 100, 100) + '%';

    if (elapsed >= HOLD_MS) { phase = 'morph'; phaseStart = now; }
  } else {
    const t = easeInOutCubic(Math.min(elapsed / MORPH_MS, 1));
    const from = getFormation(currentIdx);
    const to = getFormation(currentIdx + 1);
    const mixed = [];
    for (let i = 0; i < CUBE_COUNT; i++) {
      mixed.push({
        x: lerp(from[i].x, to[i].x, t),
        y: lerp(from[i].y, to[i].y, t),
        op: lerp(from[i].op, to[i].op, t),
        brand: lerp(from[i].brand, to[i].brand, t),
      });
    }
    applyState(mixed);

    const totalCycle = sequence.length * (HOLD_MS + MORPH_MS);
    const cyclePos = (currentIdx * (HOLD_MS + MORPH_MS) + HOLD_MS + elapsed);
    loadingFill.style.width = Math.min((cyclePos / totalCycle) * 100, 100) + '%';

    if (t < 0.3) {
      const msgIdx = currentIdx % msgEls.length;
      msgEls.forEach((el, i) => el.classList.toggle('active', i === msgIdx));
    } else if (t > 0.7) {
      const msgIdx = (currentIdx + 1) % msgEls.length;
      msgEls.forEach((el, i) => el.classList.toggle('active', i === msgIdx));
    } else {
      msgEls.forEach(el => el.classList.remove('active'));
    }

    glow.classList.toggle('on', t > 0.6);

    if (elapsed >= MORPH_MS) {
      currentIdx = (currentIdx + 1) % sequence.length;
      if (currentIdx === 0) loadingFill.style.width = '0%';
      phase = 'hold';
      phaseStart = now;
    }
  }
  requestAnimationFrame(tick);
}

applyState(getFormation(0));
requestAnimationFrame(tick);
</script>
</body>
</html>`;
}

export function CubeLoader() {
  const { isDark } = useTheme();
  return (
    <div className="fixed inset-0 z-[200]">
      <iframe
        key={isDark ? 'dark' : 'light'}
        srcDoc={buildLoaderHtml(isDark)}
        className="w-full h-full border-0"
        title="Loading"
      />
    </div>
  );
}
