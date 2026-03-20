'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { question: 'What does HTML stand for?', options: ['Hyperlinks Text Markup', 'HyperText Markup Language', 'Home Tool Markup', 'Hyper Transfer Markup'], correct: 1 },
  { question: 'Which CSS property changes text color?', options: ['text-color', 'font-color', 'color', 'foreground'], correct: 2 },
  { question: 'What does DOM stand for?', options: ['Data Object Model', 'Document Object Model', 'Dynamic Output Module', 'Document Order Map'], correct: 1 },
  { question: 'Which tag creates a hyperlink?', options: ['<link>', '<href>', '<url>', '<a>'], correct: 3 },
  { question: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Computer Style Syntax', 'Cascading Style Sheets', 'Coded Style System'], correct: 2 },
  { question: 'Which method adds to end of array?', options: ['pop()', 'push()', 'shift()', 'append()'], correct: 1 },
  { question: 'How do you declare a JS variable?', options: ['variable x = 5', 'v x = 5', 'x = var 5', 'let x = 5'], correct: 3 },
];

const SELF_DAMAGE = 20;   // penalty for shooting correct answer
const MAX_HP      = 100;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Target {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  isCorrect: boolean;
  dead: boolean;
  flashRed: number;   // countdown frames
  alpha: number;      // 0-1 fade out when dead
  bobOffset: number;  // unique phase for bobbing
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  progress: number; // 0→1
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FPSGame() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const stateRef    = useRef({
    qIndex:     0,
    playerHp:   MAX_HP,
    bossHp:     QUESTIONS.length * 3 * 10,
    correct:    0,
    totalShots: 0,
    goodShots:  0,
    gameState:  'playing' as 'playing' | 'victory' | 'defeat',
    targets:    [] as Target[],
    bullets:    [] as Bullet[],
    particles:  [] as Particle[],
    floats:     [] as FloatText[],
    mouseX:     0,
    mouseY:     0,
    flash:      0,      // screen flash frames
    flashColor: '#fff',
    frameCount: 0,
    shotFired:  false,
    nextId:     1,
  });
  const animRef    = useRef<number>(0);
  const [display, setDisplay] = useState({
    qIndex: 0, playerHp: MAX_HP, bossHp: QUESTIONS.length * 3 * 10,
    gameState: 'playing' as 'playing' | 'victory' | 'defeat',
    score: 0,
  });

  const maxBossHp = QUESTIONS.length * 3 * 10;

  // ── Build targets for a question ────────────────────────────────────────────
  const buildTargets = useCallback((qIndex: number, canvasW: number, canvasH: number) => {
    const q = QUESTIONS[qIndex];
    const count = q.options.length; // always 4
    const targetW = Math.min(260, (canvasW - 80) / count - 20);
    const targetH = 80;
    const totalW  = count * targetW + (count - 1) * 20;
    const startX  = (canvasW - totalW) / 2;
    const centerY = canvasH * 0.42;

    return q.options.map((opt, i): Target => ({
      id: stateRef.current.nextId++,
      x: startX + i * (targetW + 20),
      y: centerY - targetH / 2,
      w: targetW,
      h: targetH,
      text: opt,
      isCorrect: i === q.correct,
      dead: false,
      flashRed: 0,
      alpha: 1,
      bobOffset: i * 1.1,
    }));
  }, []);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    stateRef.current.targets = buildTargets(0, W, H);

    // Mouse move
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      stateRef.current.mouseX = (e.clientX - rect.left) * scaleX;
      stateRef.current.mouseY = (e.clientY - rect.top)  * scaleY;
    };

    // Click = shoot
    const onClick = (e: MouseEvent) => {
      const st = stateRef.current;
      if (st.gameState !== 'playing') return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top)  * scaleY;

      st.totalShots++;
      st.shotFired = true;
      setTimeout(() => { st.shotFired = false; }, 80);

      // Spawn bullet from bottom-center
      const bx = canvas.width / 2;
      const by = canvas.height - 80;
      st.bullets.push({ id: st.nextId++, x: bx, y: by, tx: mx, ty: my, progress: 0 });

      // Check hit
      let hitTarget: Target | null = null;
      for (const t of st.targets) {
        const ty = t.y + Math.sin(st.frameCount * 0.02 + t.bobOffset) * 8;
        if (!t.dead && mx >= t.x && mx <= t.x + t.w && my >= ty && my <= ty + t.h) {
          hitTarget = t;
          break;
        }
      }

      if (!hitTarget) return;

      if (hitTarget.isCorrect) {
        // Bad shot — player takes damage
        hitTarget.flashRed = 12;
        st.playerHp = Math.max(0, st.playerHp - SELF_DAMAGE);
        st.flash = 8;
        st.flashColor = '#ff000044';
        spawnFloatText(hitTarget.x + hitTarget.w / 2, hitTarget.y, `-${SELF_DAMAGE} HP!`, '#f87171', st);
        if (st.playerHp <= 0) {
          setTimeout(() => endGame('defeat', st), 400);
        }
      } else {
        // Good shot — kill it
        st.goodShots++;
        hitTarget.dead = true;
        st.bossHp = Math.max(0, st.bossHp - 10);
        st.flash = 4;
        st.flashColor = '#a855f744';
        spawnParticles(hitTarget.x + hitTarget.w / 2, hitTarget.y + hitTarget.h / 2, '#d946ef', st);
        spawnFloatText(hitTarget.x + hitTarget.w / 2, hitTarget.y, '-10 HP', '#e879f9', st);

        // Check if all wrong answers dead
        const wrongAll = st.targets.filter(t => !t.isCorrect);
        if (wrongAll.every(t => t.dead)) {
          // Round clear
          setTimeout(() => advanceRound(canvas.width, canvas.height, st), 600);
        }
      }

      syncDisplay(st);
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [buildTargets]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function spawnParticles(x: number, y: number, color: string, st: typeof stateRef.current) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      st.particles.push({
        id: st.nextId++, x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 40 + Math.random() * 20, maxLife: 60,
        color, size: 3 + Math.random() * 5,
      });
    }
  }

  function spawnFloatText(x: number, y: number, text: string, color: string, st: typeof stateRef.current) {
    st.floats.push({ id: st.nextId++, x, y, text, color, life: 60 });
  }

  function advanceRound(W: number, H: number, st: typeof stateRef.current) {
    const next = st.qIndex + 1;
    if (next >= QUESTIONS.length) {
      endGame('victory', st);
    } else {
      st.qIndex = next;
      st.correct++;
      st.targets  = buildTargets(next, W, H);
      syncDisplay(st);
    }
  }

  function endGame(result: 'victory' | 'defeat', st: typeof stateRef.current) {
    st.gameState = result;
    syncDisplay(st);
  }

  function syncDisplay(st: typeof stateRef.current) {
    setDisplay({
      qIndex:    st.qIndex,
      playerHp:  st.playerHp,
      bossHp:    st.bossHp,
      gameState: st.gameState,
      score:     st.totalShots > 0 ? Math.round((st.goodShots / st.totalShots) * 100) : 0,
    });
  }

  function handleRetry() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const st = stateRef.current;
    st.qIndex = 0; st.playerHp = MAX_HP; st.bossHp = maxBossHp;
    st.correct = 0; st.totalShots = 0; st.goodShots = 0;
    st.gameState = 'playing';
    st.targets = buildTargets(0, canvas.width, canvas.height);
    st.bullets = []; st.particles = []; st.floats = [];
    syncDisplay(st);
  }

  // ── Draw loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function wrapText(text: string, maxW: number, fontSize: number): string[] {
      ctx.font = `500 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    function frame() {
      const st = stateRef.current;
      const W  = canvas.width;
      const H  = canvas.height;
      st.frameCount++;

      // ── Background ──
      ctx.fillStyle = '#04000a';
      ctx.fillRect(0, 0, W, H);

      // Grid pattern
      ctx.strokeStyle = 'rgba(124,58,237,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Radial glow center
      const grd = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, 350);
      grd.addColorStop(0, 'rgba(124,58,237,0.12)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // ── Floating stars ──
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.5 + st.frameCount * 0.05) % W);
        const sy = ((i * 97.3) % (H * 0.7));
        const sr = 0.5 + Math.sin(i + st.frameCount * 0.01) * 0.4;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }

      // ── Floor glow ──
      const floorGrd = ctx.createLinearGradient(0, H * 0.7, 0, H);
      floorGrd.addColorStop(0, 'transparent');
      floorGrd.addColorStop(1, 'rgba(124,58,237,0.18)');
      ctx.fillStyle = floorGrd;
      ctx.fillRect(0, H * 0.7, W, H * 0.3);

      // Floor line
      ctx.strokeStyle = 'rgba(168,85,247,0.4)';
      ctx.lineWidth   = 1.5;
      ctx.beginPath(); ctx.moveTo(0, H * 0.72); ctx.lineTo(W, H * 0.72); ctx.stroke();

      // Perspective grid lines on floor
      ctx.strokeStyle = 'rgba(124,58,237,0.15)';
      ctx.lineWidth   = 0.5;
      const horizon = H * 0.72;
      const vp = { x: W / 2, y: horizon };
      for (let i = -6; i <= 6; i++) {
        const bx = W / 2 + i * 60;
        ctx.beginPath(); ctx.moveTo(vp.x, vp.y); ctx.lineTo(bx, H); ctx.stroke();
      }
      for (let row = 1; row <= 6; row++) {
        const rowY = horizon + (H - horizon) * (row / 6);
        const t2   = (rowY - horizon) / (H - horizon);
        const rowW = W * 0.1 + W * 0.9 * t2;
        ctx.beginPath(); ctx.moveTo((W - rowW) / 2, rowY); ctx.lineTo((W + rowW) / 2, rowY); ctx.stroke();
      }

      if (st.gameState === 'playing') {

        // ── Update & draw bullets ──
        st.bullets = st.bullets.filter(b => b.progress < 1);
        for (const b of st.bullets) {
          b.progress += 0.12;
          const bx = b.x + (b.tx - b.x) * b.progress;
          const by = b.y + (b.ty - b.y) * b.progress;
          // Trail
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = '#e879f9';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(b.x + (b.tx - b.x) * Math.max(0, b.progress - 0.2), b.y + (b.ty - b.y) * Math.max(0, b.progress - 0.2));
          ctx.lineTo(bx, by);
          ctx.stroke();
          ctx.restore();
          // Bullet
          ctx.save();
          ctx.shadowBlur   = 12;
          ctx.shadowColor  = '#e879f9';
          ctx.fillStyle    = '#fff';
          ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        // ── Update & draw particles ──
        st.particles = st.particles.filter(p => p.life > 0);
        for (const p of st.particles) {
          p.x   += p.vx;
          p.y   += p.vy;
          p.vy  += 0.15; // gravity
          p.life--;
          const alpha = p.life / p.maxLife;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowBlur  = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.size * alpha), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // ── Draw & update targets ──
        for (const t of st.targets) {
          if (t.dead) {
            t.alpha = Math.max(0, t.alpha - 0.06);
            if (t.alpha <= 0) continue;
          }
          if (t.flashRed > 0) t.flashRed--;

          const bobY  = t.y + Math.sin(st.frameCount * 0.02 + t.bobOffset) * 8;
          const isHov = !t.dead &&
            st.mouseX >= t.x && st.mouseX <= t.x + t.w &&
            st.mouseY >= bobY  && st.mouseY <= bobY + t.h;

          ctx.save();
          ctx.globalAlpha = t.alpha;

          // Shadow/glow
          ctx.shadowBlur  = isHov ? 28 : t.isCorrect ? 20 : 12;
          ctx.shadowColor = t.isCorrect ? '#7c3aed' : t.flashRed > 0 ? '#ef4444' : '#dc2626';

          // Card background
          drawRoundedRect(t.x, bobY, t.w, t.h, 10);
          const cardGrd = ctx.createLinearGradient(t.x, bobY, t.x, bobY + t.h);
          if (t.flashRed > 0) {
            cardGrd.addColorStop(0, 'rgba(220,38,38,0.5)');
            cardGrd.addColorStop(1, 'rgba(120,10,10,0.8)');
          } else if (t.isCorrect) {
            cardGrd.addColorStop(0, 'rgba(60,20,100,0.92)');
            cardGrd.addColorStop(1, 'rgba(30,8,60,0.96)');
          } else {
            cardGrd.addColorStop(0, isHov ? 'rgba(40,5,15,0.95)' : 'rgba(20,3,10,0.92)');
            cardGrd.addColorStop(1, 'rgba(10,2,5,0.96)');
          }
          ctx.fillStyle = cardGrd;
          ctx.fill();

          // Border
          ctx.strokeStyle = t.isCorrect
            ? `rgba(168,85,247,${isHov ? 0.9 : 0.6})`
            : t.flashRed > 0 ? '#ef4444'
            : isHov ? 'rgba(220,38,38,0.8)' : 'rgba(220,38,38,0.35)';
          ctx.lineWidth = t.isCorrect ? 2 : 1.5;
          ctx.stroke();

          // Icon
          ctx.shadowBlur = 0;
          ctx.font = '20px serif';
          ctx.textAlign = 'center';
          ctx.fillText(t.isCorrect ? '🛡️' : '💀', t.x + 22, bobY + t.h / 2 + 7);

          // Answer text
          ctx.shadowBlur  = 0;
          ctx.fillStyle   = t.isCorrect ? '#e9d5ff' : '#fce7f3';
          const lines     = wrapText(t.text, t.w - 50, 14);
          const lineH     = 18;
          const textStartY = bobY + t.h / 2 - ((lines.length - 1) * lineH) / 2;
          lines.forEach((line, li) => {
            ctx.fillText(line, t.x + t.w / 2 + 8, textStartY + li * lineH);
          });

          ctx.restore();
        }

        // ── Update & draw float texts ──
        st.floats = st.floats.filter(f => f.life > 0);
        for (const f of st.floats) {
          f.y    -= 1.2;
          f.life--;
          const alpha = f.life / 60;
          ctx.save();
          ctx.globalAlpha  = alpha;
          ctx.fillStyle    = f.color;
          ctx.font         = 'bold 18px Syne, sans-serif';
          ctx.textAlign    = 'center';
          ctx.shadowBlur   = 12;
          ctx.shadowColor  = f.color;
          ctx.fillText(f.text, f.x, f.y);
          ctx.restore();
        }

        // ── Crosshair ──
        const mx = st.mouseX, my = st.mouseY;
        const cs = st.shotFired ? 14 : 18;
        const cc = st.shotFired ? '#f0abfc' : 'rgba(255,255,255,0.9)';
        ctx.save();
        ctx.strokeStyle = cc;
        ctx.lineWidth   = 1.5;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = cc;
        // H line
        ctx.beginPath(); ctx.moveTo(mx - cs, my); ctx.lineTo(mx - 5, my); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mx + 5, my); ctx.lineTo(mx + cs, my); ctx.stroke();
        // V line
        ctx.beginPath(); ctx.moveTo(mx, my - cs); ctx.lineTo(mx, my - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mx, my + 5); ctx.lineTo(mx, my + cs); ctx.stroke();
        // Center dot
        ctx.fillStyle = st.shotFired ? '#f0abfc' : '#fff';
        ctx.beginPath(); ctx.arc(mx, my, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // ── Gun at bottom center ──
        const gx = W / 2, gy = H - 10;
        ctx.save();
        ctx.fillStyle   = '#1a0a28';
        ctx.strokeStyle = 'rgba(168,85,247,0.6)';
        ctx.lineWidth   = 1.5;
        ctx.shadowBlur  = 16;
        ctx.shadowColor = '#a855f7';
        // Barrel
        ctx.fillRect(gx - 6, gy - 60, 12, 50);
        ctx.strokeRect(gx - 6, gy - 60, 12, 50);
        // Body
        ctx.fillRect(gx - 18, gy - 30, 36, 30);
        ctx.strokeRect(gx - 18, gy - 30, 36, 30);
        // Muzzle flash on shoot
        if (st.shotFired) {
          ctx.shadowBlur  = 30;
          ctx.shadowColor = '#e879f9';
          ctx.fillStyle   = '#f0abfc';
          ctx.beginPath(); ctx.arc(gx, gy - 60, 8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

      } // end if playing

      // ── Screen flash overlay ──
      if (st.flash > 0) {
        ctx.save();
        ctx.globalAlpha = st.flash / 12;
        ctx.fillStyle   = st.flashColor;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        st.flash--;
      }

      // ── Victory / defeat overlay ──
      if (st.gameState !== 'playing') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // ── Resize canvas to window ──────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Rebuild targets for new size
      const st = stateRef.current;
      if (st.gameState === 'playing') {
        st.targets = buildTargets(st.qIndex, canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [buildTargets]);

  // ── HP bar helper ────────────────────────────────────────────────────────────
  const HpBar = ({ label, hp, maxHp, color }: { label: string; hp: number; maxHp: number; color: string }) => {
    const pct = Math.max(0, hp / maxHp);
    return (
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <span style={{ color }}>{label}</span>
          <span style={{ color, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.82rem' }}>{Math.max(0, hp)}</span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map((i) => (
            <div key={i} style={{
              flex: 1, height: '10px', borderRadius: '2px',
              background: (i / 20) < pct ? color : 'rgba(255,255,255,0.07)',
              boxShadow: (i / 20) < pct ? `0 0 5px ${color}` : 'none',
              clipPath: 'polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>
    );
  };

  const currentQ = QUESTIONS[display.qIndex];
  const bossHpColor = display.bossHp / maxBossHp > 0.6 ? '#a855f7' : display.bossHp / maxBossHp > 0.3 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } body { cursor: none !important; overflow: hidden; }`}</style>

      <div style={{ position: 'fixed', inset: 0, background: '#04000a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* CANVAS — the whole game */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />

        {/* ── TOP HUD ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '12px 24px',
          background: 'linear-gradient(180deg, rgba(4,0,10,0.97), rgba(15,5,30,0.88))',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(168,85,247,0.15)',
        }}>
          <HpBar label="⚔ You" hp={display.playerHp} maxHp={MAX_HP}
            color={display.playerHp / MAX_HP > 0.5 ? '#22c55e' : display.playerHp / MAX_HP > 0.25 ? '#f59e0b' : '#ef4444'} />

          {/* Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.15em', background: 'linear-gradient(135deg, #e879f9, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🎯 TARGET PRACTICE
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: i < display.qIndex ? '#7c3aed' : i === display.qIndex ? '#e879f9' : 'rgba(255,255,255,0.12)',
                  boxShadow: i === display.qIndex ? '0 0 6px #e879f9' : 'none',
                }} />
              ))}
            </div>
          </div>

          <HpBar label="Boss 🐉" hp={display.bossHp} maxHp={maxBossHp} color={bossHpColor} />
        </div>

        {/* ── BOTTOM HUD ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'linear-gradient(0deg, rgba(4,0,10,0.97), rgba(10,3,20,0.9))',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(168,85,247,0.15)',
          padding: '14px 24px 16px',
        }}>
          {/* Question */}
          <div style={{
            background: 'rgba(20,8,35,0.9)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '10px', padding: '12px 18px', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{ width: '3px', alignSelf: 'stretch', borderRadius: '2px', background: 'linear-gradient(180deg, #a855f7, #7c3aed)', flexShrink: 0 }} />
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(0.82rem, 1.8vw, 1rem)', color: '#f0e8ff', lineHeight: 1.5, margin: 0 }}>
              {currentQ.question}
            </p>
          </div>

          {/* Legend + stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#9d8ab8' }}>
              <span>💀</span> Shoot these (wrong answers)
            </div>
            <div style={{ width: '1px', height: '16px', background: 'rgba(168,85,247,0.25)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#9d8ab8' }}>
              <span>🛡️</span> Spare this (correct answer)
            </div>
            <div style={{ width: '1px', height: '16px', background: 'rgba(168,85,247,0.25)' }} />
            <span style={{ fontSize: '0.72rem', color: '#6b5b8a' }}>
              Accuracy <span style={{ color: '#a855f7', fontWeight: 700 }}>{display.score}%</span>
            </span>
          </div>
        </div>

        {/* EXIT */}
        <button onClick={() => window.history.back()} style={{
          position: 'absolute', top: '68px', left: '20px', zIndex: 10,
          fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em',
          textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)',
          color: '#7c6a9a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px', padding: '6px 14px', cursor: 'pointer',
        }}>← Exit</button>

        {/* ── RESULT OVERLAY ── */}
        {display.gameState !== 'playing' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: 'linear-gradient(160deg, #0f0518, #1a0a28)',
              border: `1px solid ${display.gameState === 'victory' ? 'rgba(168,85,247,0.4)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '20px', padding: '48px 44px', textAlign: 'center',
              maxWidth: '420px', width: '90%',
              boxShadow: display.gameState === 'victory' ? '0 0 60px rgba(168,85,247,0.2)' : '0 0 40px rgba(239,68,68,0.15)',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
                {display.gameState === 'victory' ? '🏆' : '💀'}
              </div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2rem',
                letterSpacing: '-0.03em', marginBottom: '10px',
                background: display.gameState === 'victory'
                  ? 'linear-gradient(135deg, #e879f9, #a855f7)'
                  : 'linear-gradient(135deg, #f87171, #ef4444)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {display.gameState === 'victory' ? 'Targets Eliminated!' : 'You Were Hit Too Much'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#9d8ab8', lineHeight: 1.8, marginBottom: '24px' }}>
                {display.gameState === 'victory'
                  ? 'All wrong answers destroyed. The correct ones survived.'
                  : 'You shot the correct answer too many times. Try again.'}
              </p>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3.2rem', background: 'linear-gradient(135deg, #e879f9, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
                {display.score}%
              </div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b5b8a', marginBottom: '28px' }}>
                accuracy
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleRetry} style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem',
                  padding: '14px 32px', background: 'linear-gradient(135deg, #7c3aed, #c026d3)',
                  color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(124,58,237,0.35)',
                }}>↺ Try Again</button>
                <button onClick={() => window.history.back()} style={{
                  fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '11px 32px', background: 'transparent',
                  color: '#6b5b8a', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', cursor: 'pointer',
                }}>← Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}