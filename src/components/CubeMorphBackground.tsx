import { useRef, useEffect } from 'react';

interface Props {
  isDark: boolean;
}

const formations: Record<string, { cubes: Array<{ x: number; y: number; op: number; brand: number }> }> = {
  original: { cubes: [
    {x:200,y:215,op:1,brand:1},{x:160,y:140,op:0.5,brand:0},{x:240,y:140,op:0.5,brand:0},
    {x:120,y:190,op:0.7,brand:0},{x:200,y:165,op:0.7,brand:0},{x:280,y:190,op:0.7,brand:0},
    {x:160,y:240,op:1,brand:0},{x:240,y:240,op:1,brand:0},{x:200,y:265,op:1,brand:0},
    {x:200,y:215,op:0,brand:0},{x:200,y:215,op:0,brand:0},{x:200,y:215,op:0,brand:0},{x:200,y:215,op:0,brand:0},{x:200,y:215,op:0,brand:0},
  ]},
  ram: { cubes: [
    {x:200,y:220,op:1,brand:1},{x:200,y:270,op:1,brand:1},
    {x:130,y:200,op:0.75,brand:0},{x:70,y:150,op:0.6,brand:0},{x:50,y:90,op:0.45,brand:0},{x:90,y:40,op:0.35,brand:0},
    {x:270,y:200,op:0.75,brand:0},{x:330,y:150,op:0.6,brand:0},{x:350,y:90,op:0.45,brand:0},{x:310,y:40,op:0.35,brand:0},
    {x:180,y:320,op:0.5,brand:0},{x:220,y:320,op:0.5,brand:0},
    {x:200,y:220,op:0,brand:0},{x:200,y:220,op:0,brand:0},
  ]},
  serpent: { cubes: [
    {x:290,y:80,op:1,brand:1},{x:340,y:50,op:0.5,brand:0},
    {x:240,y:130,op:0.85,brand:0},{x:180,y:170,op:0.75,brand:0},{x:130,y:220,op:0.68,brand:0},
    {x:160,y:270,op:0.6,brand:0},{x:220,y:310,op:0.52,brand:0},{x:270,y:350,op:0.45,brand:0},
    {x:240,y:400,op:0.38,brand:0},{x:190,y:440,op:0.3,brand:0},
    {x:220,y:250,op:0,brand:0},{x:220,y:250,op:0,brand:0},{x:220,y:250,op:0,brand:0},{x:220,y:250,op:0,brand:0},
  ]},
  tiger: { cubes: [
    {x:90,y:180,op:1,brand:1},
    {x:60,y:140,op:0.65,brand:0},{x:130,y:140,op:0.65,brand:0},
    {x:160,y:220,op:0.7,brand:0},{x:240,y:250,op:0.6,brand:0},{x:320,y:270,op:0.5,brand:0},
    {x:50,y:250,op:0.55,brand:0},{x:20,y:310,op:0.45,brand:0},
    {x:320,y:320,op:0.45,brand:0},{x:380,y:240,op:0.38,brand:0},{x:420,y:200,op:0.3,brand:0},
    {x:220,y:230,op:0,brand:0},{x:220,y:230,op:0,brand:0},{x:220,y:230,op:0,brand:0},
  ]},
  boar: { cubes: [
    {x:80,y:220,op:1,brand:1},
    {x:40,y:180,op:0.65,brand:0},{x:50,y:270,op:0.65,brand:0},
    {x:150,y:200,op:0.8,brand:0},{x:150,y:250,op:0.8,brand:0},
    {x:230,y:190,op:0.6,brand:0},{x:230,y:240,op:0.6,brand:0},{x:310,y:210,op:0.55,brand:0},{x:310,y:260,op:0.55,brand:0},
    {x:380,y:220,op:0.45,brand:0},{x:430,y:190,op:0.3,brand:0},
    {x:230,y:220,op:0,brand:0},{x:230,y:220,op:0,brand:0},{x:230,y:220,op:0,brand:0},
  ]},
  rat: { cubes: [
    {x:130,y:220,op:1,brand:1},
    {x:70,y:200,op:0.45,brand:0},{x:70,y:240,op:0.45,brand:0},
    {x:190,y:210,op:0.75,brand:0},{x:190,y:250,op:0.7,brand:0},{x:250,y:230,op:0.6,brand:0},
    {x:150,y:280,op:0.4,brand:0},{x:230,y:280,op:0.4,brand:0},
    {x:310,y:220,op:0.45,brand:0},{x:370,y:200,op:0.35,brand:0},{x:420,y:170,op:0.28,brand:0},
    {x:200,y:230,op:0,brand:0},{x:200,y:230,op:0,brand:0},{x:200,y:230,op:0,brand:0},
  ]},
  ox: { cubes: [
    {x:150,y:220,op:1,brand:1},
    {x:70,y:190,op:0.6,brand:0},{x:30,y:170,op:0.4,brand:0},{x:230,y:190,op:0.6,brand:0},{x:270,y:170,op:0.4,brand:0},
    {x:150,y:260,op:0.75,brand:0},{x:210,y:240,op:0.7,brand:0},{x:210,y:280,op:0.65,brand:0},{x:270,y:260,op:0.6,brand:0},{x:330,y:250,op:0.5,brand:0},
    {x:160,y:310,op:0.4,brand:0},{x:300,y:310,op:0.4,brand:0},
    {x:200,y:240,op:0,brand:0},{x:200,y:240,op:0,brand:0},
  ]},
  hare: { cubes: [
    {x:200,y:230,op:1,brand:1},
    {x:180,y:130,op:0.55,brand:0},{x:180,y:180,op:0.7,brand:0},{x:220,y:120,op:0.5,brand:0},{x:220,y:170,op:0.65,brand:0},
    {x:180,y:280,op:0.7,brand:0},{x:220,y:280,op:0.7,brand:0},{x:200,y:320,op:0.6,brand:0},
    {x:160,y:360,op:0.45,brand:0},{x:240,y:360,op:0.45,brand:0},{x:200,y:370,op:0.3,brand:0},
    {x:200,y:260,op:0,brand:0},{x:200,y:260,op:0,brand:0},{x:200,y:260,op:0,brand:0},
  ]},
  dragon: { cubes: [
    {x:140,y:180,op:1,brand:1},{x:140,y:130,op:0.7,brand:0},
    {x:180,y:220,op:0.8,brand:0},{x:220,y:250,op:0.7,brand:0},{x:260,y:280,op:0.6,brand:0},{x:240,y:320,op:0.5,brand:0},{x:200,y:350,op:0.4,brand:0},
    {x:80,y:160,op:0.55,brand:0},{x:30,y:120,op:0.4,brand:0},{x:60,y:210,op:0.45,brand:0},
    {x:250,y:170,op:0.55,brand:0},{x:310,y:130,op:0.4,brand:0},{x:290,y:210,op:0.45,brand:0},
    {x:90,y:160,op:0.35,brand:0},
  ]},
  horse: { cubes: [
    {x:110,y:170,op:1,brand:1},
    {x:140,y:130,op:0.55,brand:0},{x:170,y:110,op:0.4,brand:0},{x:160,y:200,op:0.8,brand:0},
    {x:220,y:220,op:0.7,brand:0},{x:280,y:230,op:0.6,brand:0},{x:340,y:240,op:0.5,brand:0},
    {x:80,y:240,op:0.5,brand:0},{x:60,y:300,op:0.4,brand:0},
    {x:320,y:290,op:0.45,brand:0},{x:350,y:310,op:0.38,brand:0},
    {x:380,y:210,op:0.35,brand:0},{x:420,y:190,op:0.28,brand:0},
    {x:230,y:220,op:0,brand:0},
  ]},
  monkey: { cubes: [
    {x:200,y:160,op:1,brand:1},
    {x:200,y:210,op:0.8,brand:0},{x:200,y:260,op:0.7,brand:0},
    {x:120,y:190,op:0.6,brand:0},{x:60,y:170,op:0.45,brand:0},{x:280,y:190,op:0.6,brand:0},{x:340,y:170,op:0.45,brand:0},
    {x:160,y:300,op:0.5,brand:0},{x:240,y:300,op:0.5,brand:0},
    {x:250,y:290,op:0.4,brand:0},{x:300,y:310,op:0.32,brand:0},{x:330,y:290,op:0.25,brand:0},
    {x:200,y:230,op:0,brand:0},{x:200,y:230,op:0,brand:0},
  ]},
  bird: { cubes: [
    {x:200,y:210,op:1,brand:1},{x:200,y:170,op:0.8,brand:0},{x:200,y:140,op:0.45,brand:0},
    {x:140,y:200,op:0.75,brand:0},{x:80,y:180,op:0.6,brand:0},{x:20,y:155,op:0.42,brand:0},{x:100,y:220,op:0.5,brand:0},
    {x:260,y:200,op:0.75,brand:0},{x:320,y:180,op:0.6,brand:0},{x:380,y:155,op:0.42,brand:0},{x:300,y:220,op:0.5,brand:0},
    {x:180,y:260,op:0.4,brand:0},{x:220,y:260,op:0.4,brand:0},
    {x:200,y:210,op:0,brand:0},
  ]},
  dog: { cubes: [
    {x:180,y:150,op:1,brand:1},
    {x:140,y:130,op:0.6,brand:0},{x:220,y:130,op:0.6,brand:0},{x:180,y:110,op:0.5,brand:0},
    {x:180,y:200,op:0.75,brand:0},{x:180,y:250,op:0.65,brand:0},
    {x:140,y:290,op:0.5,brand:0},{x:220,y:290,op:0.5,brand:0},
    {x:220,y:250,op:0.55,brand:0},{x:260,y:270,op:0.45,brand:0},
    {x:280,y:230,op:0.38,brand:0},{x:310,y:200,op:0.3,brand:0},
    {x:200,y:220,op:0,brand:0},{x:200,y:220,op:0,brand:0},
  ]},
};

const sequence = ['original','ram','serpent','tiger','boar','rat','ox','hare','dragon','horse','monkey','bird','dog'];
const CUBE_COUNT = 14;
const HOLD_MS = 3000;
const MORPH_MS = 2000;

export function CubeMorphBackground({ isDark }: Props) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const NS = 'http://www.w3.org/2000/svg';
    const cubeGroup = groupRef.current;
    if (!cubeGroup) return;

    // Clear any previous children
    while (cubeGroup.firstChild) cubeGroup.removeChild(cubeGroup.firstChild);

    function makePoly(pts: string, fill: string, stroke?: string, sw?: string) {
      const p = document.createElementNS(NS, 'polygon');
      p.setAttribute('points', pts);
      p.setAttribute('fill', fill);
      if (stroke && sw) {
        p.setAttribute('stroke', stroke);
        p.setAttribute('stroke-width', sw);
      }
      return p;
    }

    type CubeEl = { g: SVGGElement; brand: SVGGElement };
    const cubeEls: CubeEl[] = [];

    for (let i = 0; i < CUBE_COUNT; i++) {
      const g = document.createElementNS(NS, 'g') as SVGGElement;
      g.style.willChange = 'transform, opacity';

      const silver = document.createElementNS(NS, 'g') as SVGGElement;
      silver.appendChild(makePoly('0,30 50,5 100,30 50,55', 'url(#edBgTopGrad)'));
      silver.appendChild(makePoly('0,30 0,80 50,105 50,55', 'url(#edBgLeftGrad)'));
      silver.appendChild(makePoly('100,30 100,80 50,105 50,55', 'url(#edBgRightGrad)'));

      const brand = document.createElementNS(NS, 'g') as SVGGElement;
      brand.appendChild(makePoly('0,30 50,5 100,30 50,55', 'url(#edBgBrandTop)', '#000', '0.5'));
      brand.appendChild(makePoly('0,30 0,80 50,105 50,55', 'url(#edBgBrandLeft)', '#000', '0.5'));
      brand.appendChild(makePoly('100,30 100,80 50,105 50,55', 'url(#edBgBrandRight)', '#000', '0.5'));
      const hl = makePoly('0,30 50,5 100,30 50,55', '#fff');
      hl.setAttribute('opacity', '0.2');
      brand.appendChild(hl);
      brand.style.opacity = '0';

      g.appendChild(silver);
      g.appendChild(brand);
      cubeGroup.appendChild(g);
      cubeEls.push({ g, brand });
    }

    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    type Cube = { x: number; y: number; op: number; brand: number };

    let cur = 0, phase = 'hold', start = 0;

    function get(i: number): Cube[] {
      return formations[sequence[((i % sequence.length) + sequence.length) % sequence.length]].cubes;
    }

    function apply(cubes: Cube[]) {
      const idx = cubes.map((_, i) => i).sort((a, b) => cubes[a].y - cubes[b].y);
      idx.forEach(i => {
        const c = cubes[i], el = cubeEls[i];
        el.g.setAttribute('transform', `translate(${c.x}, ${c.y})`);
        el.g.style.opacity = String(c.op);
        el.brand.style.opacity = String(c.brand);
        cubeGroup.appendChild(el.g);
      });
    }

    let rafId: number;
    function tick(now: number) {
      if (!start) start = now;
      const dt = now - start;
      if (phase === 'hold') {
        apply(get(cur));
        if (dt >= HOLD_MS) { phase = 'morph'; start = now; }
      } else {
        const raw = Math.min(dt / MORPH_MS, 1), t = ease(raw);
        const from = get(cur), to = get(cur + 1);
        const mix: Cube[] = [];
        for (let i = 0; i < CUBE_COUNT; i++) {
          mix.push({
            x: lerp(from[i].x, to[i].x, t),
            y: lerp(from[i].y, to[i].y, t),
            op: lerp(from[i].op, to[i].op, t),
            brand: lerp(from[i].brand, to[i].brand, t),
          });
        }
        apply(mix);
        if (dt >= MORPH_MS) { cur = (cur + 1) % sequence.length; phase = 'hold'; start = now; }
      }
      rafId = requestAnimationFrame(tick);
    }

    apply(get(0));
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Gradient stops differ between dark and light mode
  const topGrad   = isDark ? ['#f0f0f0', '#d0d0d0'] : ['#d0d0d0', '#b0b0b0'];
  const leftGrad  = isDark ? ['#b0b0b0', '#909090'] : ['#a0a0a0', '#808080'];
  const rightGrad = isDark ? ['#c0c0c0', '#a0a0a0'] : ['#b8b8b8', '#909090'];

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(800px, 100vw)',
        height: 'min(800px, 100vw)',
        opacity: isDark ? 0.07 : 0.12,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="edBgTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={topGrad[0]} />
            <stop offset="100%" stopColor={topGrad[1]} />
          </linearGradient>
          <linearGradient id="edBgLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={leftGrad[0]} />
            <stop offset="100%" stopColor={leftGrad[1]} />
          </linearGradient>
          <linearGradient id="edBgRightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={rightGrad[0]} />
            <stop offset="100%" stopColor={rightGrad[1]} />
          </linearGradient>
          <linearGradient id="edBgBrandTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#ff2d2d" />
          </linearGradient>
          <linearGradient id="edBgBrandLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cc0000" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
          <linearGradient id="edBgBrandRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff1a1a" />
            <stop offset="100%" stopColor="#cc0000" />
          </linearGradient>
        </defs>
        <g ref={groupRef} />
      </svg>
    </div>
  );
}
