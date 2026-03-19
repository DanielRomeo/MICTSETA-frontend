'use client';

import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Stars,
  Sparkles,
  Billboard,
  Text,
} from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_QUESTIONS = [
  { question: 'What does HTML stand for?', optionA: 'Hyperlinks and Text Markup Language', optionB: 'HyperText Markup Language', optionC: 'Home Tool Markup Language', optionD: 'Hyper Transfer Markup Language', correctAnswer: 'B' as const },
  { question: 'Which tag creates a hyperlink?', optionA: '<link>', optionB: '<url>', optionC: '<a>', optionD: '<href>', correctAnswer: 'C' as const },
  { question: 'What CSS property changes text color?', optionA: 'text-color', optionB: 'font-color', optionC: 'foreground-color', optionD: 'color', correctAnswer: 'D' as const },
  { question: 'Which controls space OUTSIDE an element?', optionA: 'padding', optionB: 'spacing', optionC: 'margin', optionD: 'border', correctAnswer: 'C' as const },
  { question: 'What does DOM stand for?', optionA: 'Document Object Model', optionB: 'Data Output Manager', optionC: 'Dynamic Object Module', optionD: 'Document Order Map', correctAnswer: 'A' as const },
  { question: 'Which JS method selects by ID?', optionA: 'document.getElement()', optionB: 'document.querySelector()', optionC: 'document.findById()', optionD: 'document.getElementById()', correctAnswer: 'D' as const },
  { question: 'What does CSS stand for?', optionA: 'Creative Style Sheets', optionB: 'Cascading Style Sheets', optionC: 'Computer Style Syntax', optionD: 'Coded Style System', correctAnswer: 'B' as const },
];

const MAX_PLAYER_HP  = 100;
const CORRECT_DAMAGE = 20;
const WRONG_DAMAGE   = 15;
const ANSWER_TIMEOUT = 15;

type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong';

// ─────────────────────────────────────────────────────────────────────────────
// STYLE HELPERS — typed properly so TS is happy
// ─────────────────────────────────────────────────────────────────────────────
function s(styles: React.CSSProperties): React.CSSProperties {
  return styles;
}

function optionStyle(state: AnswerState): React.CSSProperties {
  const bgMap: Record<AnswerState, string> = {
    correct:  'rgba(34,197,94,0.12)',
    wrong:    'rgba(239,68,68,0.10)',
    selected: 'rgba(168,85,247,0.12)',
    idle:     'rgba(26,10,38,0.80)',
  };
  const borderMap: Record<AnswerState, string> = {
    correct:  '#22c55e',
    wrong:    '#ef4444',
    selected: '#a855f7',
    idle:     '#44445a',
  };
  const shadowMap: Record<AnswerState, string> = {
    correct:  '0 0 16px rgba(34,197,94,0.3)',
    wrong:    '0 0 12px rgba(239,68,68,0.2)',
    selected: 'none',
    idle:     'none',
  };
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 16px',
    borderRadius: '8px',
    cursor: state === 'idle' ? 'pointer' : 'default',
    textAlign: 'left' as const,
    border: '1px solid',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.75rem',
    transition: 'all 0.2s',
    lineHeight: 1.3,
    background: bgMap[state],
    borderColor: borderMap[state],
    boxShadow: shadowMap[state],
    color: '#e2e2f0',
  };
}

function optionLetterStyle(state: AnswerState): React.CSSProperties {
  const colorMap: Record<AnswerState, string> = {
    correct:  '#22c55e',
    wrong:    '#ef4444',
    selected: '#a855f7',
    idle:     '#a855f7',
  };
  return {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: '0.8rem',
    minWidth: '16px',
    color: colorMap[state],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC STYLES
// ─────────────────────────────────────────────────────────────────────────────
const ROOT      = s({ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', fontFamily: "'IBM Plex Mono', monospace", zIndex: 1000, overflow: 'hidden' });
const CANVAS    = s({ position: 'absolute', inset: 0, zIndex: 1 });
const OVERLAY   = s({ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100vh', pointerEvents: 'none' });
const HEADER    = s({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(10,0,16,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #44445a', pointerEvents: 'auto' });
const EXIT_BTN  = s({ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', color: '#9999bb', border: '1px solid #44445a', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer' });
const H_TITLE   = s({ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d946ef', textShadow: '0 0 20px rgba(217,70,239,0.5)' });
const H_SUB     = s({ fontSize: '0.58rem', color: '#9999bb', letterSpacing: '0.08em', marginTop: '2px' });
const Q_COUNTER = s({ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', color: '#9999bb', letterSpacing: '0.1em' });
const ARENA     = s({ flex: 1 });
const BOTTOM    = s({ background: 'rgba(10,0,16,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid #44445a', padding: '16px 24px 20px', pointerEvents: 'auto' });
const HP_ROW    = s({ display: 'flex', gap: '16px', marginBottom: '14px', alignItems: 'center' });
const HP_BLOCK  = s({ flex: 1 });
const HP_LABEL  = s({ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '5px' });
const HP_BAR    = s({ height: '8px', background: '#1a1a26', borderRadius: '4px', overflow: 'hidden', border: '1px solid #44445a' });
const TIMER_BLK = s({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '56px' });
const Q_BOX     = s({ background: 'rgba(28,10,40,0.9)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '10px', padding: '16px 20px', marginBottom: '12px' });
const Q_TEXT    = s({ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 1rem)', color: '#ffffff', lineHeight: 1.5, margin: 0 });
const OPTS_GRID = s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' });

// ─────────────────────────────────────────────────────────────────────────────
// 3-D DRAGON
// ─────────────────────────────────────────────────────────────────────────────
function DragonBody({
  hpPct, isHit, isDead, fireActive,
}: {
  hpPct: number; isHit: boolean; isDead: boolean; fireActive: boolean;
}) {
  const groupRef    = useRef<THREE.Group>(null!);
  const bodyRef     = useRef<THREE.Mesh>(null!);
  const headRef     = useRef<THREE.Group>(null!);
  const wingLRef    = useRef<THREE.Group>(null!);
  const wingRRef    = useRef<THREE.Group>(null!);
  const eyeLRef     = useRef<THREE.Mesh>(null!);
  const eyeRRef     = useRef<THREE.Mesh>(null!);
  const tailRef     = useRef<THREE.Group>(null!);
  const hitFlash    = useRef(0);

  const dragonColor = useMemo(() => {
    if (hpPct > 0.6) return new THREE.Color('#d946ef');
    if (hpPct > 0.3) return new THREE.Color('#f59e0b');
    return new THREE.Color('#ef4444');
  }, [hpPct]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!groupRef.current) return;

    if (isDead) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -0.8, 0.03);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -2.5, 0.025);
      return;
    }

    groupRef.current.position.y = Math.sin(t * 0.8) * 0.18;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.12;

    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 1.1) * 0.08;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    }
    if (wingLRef.current) wingLRef.current.rotation.z =  0.4 + Math.sin(t * 2.2) * 0.3;
    if (wingRRef.current) wingRRef.current.rotation.z = -0.4 - Math.sin(t * 2.2) * 0.3;
    if (tailRef.current)  tailRef.current.rotation.y  = Math.sin(t * 1.5) * 0.4;

    const eyeI = 0.8 + Math.sin(t * 3) * 0.2;
    if (eyeLRef.current) (eyeLRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = eyeI;
    if (eyeRRef.current) (eyeRRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = eyeI;

    if (isHit) hitFlash.current = 1.0;
    if (hitFlash.current > 0) {
      hitFlash.current -= 0.08;
      if (bodyRef.current) {
        const m = bodyRef.current.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = hitFlash.current * 3;
        m.emissive.set('#ffffff');
      }
    } else if (bodyRef.current) {
      const m = bodyRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.1;
      m.emissive.copy(dragonColor);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* BODY */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[0.85, 16, 12]} />
        <meshStandardMaterial color="#1a0a20" emissive={dragonColor} emissiveIntensity={0.1} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.1, 0.05]}>
        <sphereGeometry args={[0.7, 12, 8]} />
        <meshStandardMaterial color="#2d0a3e" roughness={0.5} metalness={0.5} transparent opacity={0.6} />
      </mesh>
      {/* CHEST GLOW */}
      <mesh position={[0, 0, 0.7]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={1.5} transparent opacity={0.4} />
      </mesh>
      {/* NECK */}
      <mesh position={[0, 0.95, 0.3]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.38, 0.7, 10]} />
        <meshStandardMaterial color="#1a0a20" emissive={dragonColor} emissiveIntensity={0.08} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* HEAD */}
      <group ref={headRef} position={[0, 1.55, 0.5]}>
        <mesh castShadow>
          <sphereGeometry args={[0.55, 14, 10]} />
          <meshStandardMaterial color="#1a0a20" emissive={dragonColor} emissiveIntensity={0.12} roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.22, 0.42]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.42, 0.24, 0.5]} />
          <meshStandardMaterial color="#150818" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Nostrils */}
        {([-0.1, 0.1] as number[]).map((x, i) => (
          <mesh key={i} position={[x, -0.28, 0.68]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={2} />
          </mesh>
        ))}
        {/* Eyes */}
        {([-0.28, 0.28] as number[]).map((x, i) => (
          <group key={i} position={[x, 0.08, 0.4]}>
            <mesh>
              <sphereGeometry args={[0.14, 10, 10]} />
              <meshStandardMaterial color="#050010" />
            </mesh>
            <mesh ref={i === 0 ? eyeLRef : eyeRRef} position={[0, 0, 0.08]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.9} />
            </mesh>
          </group>
        ))}
        {/* Horns */}
        <mesh position={[-0.25, 0.5, -0.1]} rotation={[0.3,  0.2, -0.3]}>
          <coneGeometry args={[0.07, 0.55, 6]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[ 0.25, 0.5, -0.1]} rotation={[0.3, -0.2,  0.3]}>
          <coneGeometry args={[0.07, 0.55, 6]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
        {/* Side spikes */}
        <mesh position={[-0.52, 0.1, 0]} rotation={[0, 0, -0.8]}>
          <coneGeometry args={[0.04, 0.3, 5]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[ 0.52, 0.1, 0]} rotation={[0, 0,  0.8]}>
          <coneGeometry args={[0.04, 0.3, 5]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.3} />
        </mesh>
        {/* Dead X eyes */}
        {isDead && ([-0.28, 0.28] as number[]).map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.08, 0.52]} rotation={[0, 0,  Math.PI / 4]}>
              <boxGeometry args={[0.22, 0.03, 0.02]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
            </mesh>
            <mesh position={[x, 0.08, 0.52]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.22, 0.03, 0.02]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>
      {/* WINGS */}
      <group ref={wingLRef} position={[-0.85, 0.3, -0.1]} rotation={[0.1, -0.2, 0.4]}>
        <mesh>
          <boxGeometry args={[1.4, 0.04, 0.9]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.15} transparent opacity={0.75} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.35]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.03, 0.01, 1.3, 6]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.4} roughness={0.1} />
        </mesh>
        <mesh position={[-0.65, 0, -0.4]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.04, 0.25, 5]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.5} />
        </mesh>
      </group>
      <group ref={wingRRef} position={[0.85, 0.3, -0.1]} rotation={[0.1, 0.2, -0.4]}>
        <mesh>
          <boxGeometry args={[1.4, 0.04, 0.9]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.15} transparent opacity={0.75} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.35]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.03, 0.01, 1.3, 6]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.4} roughness={0.1} />
        </mesh>
        <mesh position={[0.65, 0, -0.4]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.04, 0.25, 5]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* ARMS + CLAWS */}
      <mesh position={[-0.75, -0.3, 0.3]} rotation={[0.3, 0, 0.6]}>
        <cylinderGeometry args={[0.1, 0.07, 0.6, 7]} />
        <meshStandardMaterial color="#1a0a20" roughness={0.4} metalness={0.5} />
      </mesh>
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[-1.1 + x * 0.3, -0.65, 0.55]} rotation={[0.8, 0, 0.2 * (i - 1)]}>
          <coneGeometry args={[0.03, 0.2, 5]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <mesh position={[0.75, -0.3, 0.3]} rotation={[0.3, 0, -0.6]}>
        <cylinderGeometry args={[0.1, 0.07, 0.6, 7]} />
        <meshStandardMaterial color="#1a0a20" roughness={0.4} metalness={0.5} />
      </mesh>
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[1.1 + x * 0.3, -0.65, 0.55]} rotation={[0.8, 0, -0.2 * (i - 1)]}>
          <coneGeometry args={[0.03, 0.2, 5]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* TAIL */}
      <group ref={tailRef} position={[0.2, -0.4, -0.8]}>
        <mesh rotation={[0.4, 0.3, 0.1]}>
          <cylinderGeometry args={[0.22, 0.05, 1.4, 8]} />
          <meshStandardMaterial color="#1a0a20" emissive={dragonColor} emissiveIntensity={0.06} roughness={0.4} metalness={0.5} />
        </mesh>
        {[0, 0.3, 0.6].map((offset, i) => (
          <mesh key={i} position={[0, -0.3 - offset, 0.15 + offset * 0.1]} rotation={[-0.5, 0, 0]}>
            <coneGeometry args={[0.04 - i * 0.01, 0.2 - i * 0.04, 5]} />
            <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
      {/* BACK SPINES */}
      {([
        { pos: [0, 0.88, -0.3] as [number,number,number], sc: 1.0 },
        { pos: [0, 0.82, -0.1] as [number,number,number], sc: 0.8 },
        { pos: [0, 0.75,  0.1] as [number,number,number], sc: 0.65 },
      ]).map(({ pos, sc }, i) => (
        <mesh key={i} position={pos} rotation={[0.15, 0, 0]}>
          <coneGeometry args={[0.045 * sc, 0.35 * sc, 5]} />
          <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.5} roughness={0.1} />
        </mesh>
      ))}
      {/* DRAGON LIGHT */}
      <pointLight color={dragonColor} intensity={2.5} distance={4} decay={2} />
      {/* FIRE BREATH */}
      {fireActive && <FireBreath color={dragonColor} />}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRE BREATH
// ─────────────────────────────────────────────────────────────────────────────
function FireBreath({ color }: { color: THREE.Color }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.x = 0.9 + Math.sin(clock.elapsedTime * 8) * 0.1;
  });
  return (
    <group ref={ref} position={[-0.4, 1.45, 1.0]} rotation={[0, -0.5, 0.2]}>
      <Sparkles count={40} scale={[1.5, 0.4, 0.4]} size={3} speed={1.2} color="#f59e0b" />
      <Sparkles count={25} scale={[1.2, 0.3, 0.3]} size={2} speed={1.8} color="#ef4444" />
      <mesh>
        <coneGeometry args={[0.08, 0.8, 6]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} transparent opacity={0.4} />
      </mesh>
      <pointLight color="#f59e0b" intensity={3} distance={2.5} decay={2} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HIT BURST
// ─────────────────────────────────────────────────────────────────────────────
function HitBurst({ active }: { active: boolean }) {
  const ref      = useRef<THREE.Group>(null!);
  const progress = useRef(0);
  useFrame(() => {
    if (!ref.current) return;
    if (active) progress.current = Math.min(progress.current + 0.12, 1);
    else        progress.current = Math.max(progress.current - 0.08, 0);
    ref.current.scale.setScalar(progress.current * 2.5);
    ref.current.children.forEach((c) => {
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (mat) mat.opacity = (1 - progress.current) * 0.8;
    });
  });
  return (
    <group ref={ref} position={[0, 0.5, 0]}>
  {[0,1,2,3,4,5,6,7].map((i) => {
    const angle = (i / 8) * Math.PI * 2;
    return (
      <mesh key={i} position={[Math.cos(angle) * 1.2, Math.sin(angle) * 0.6, 0]}>
        <sphereGeometry args={[0.08, 5, 5]} />
        <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
    );
  })}
</group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARENA FLOOR
// ─────────────────────────────────────────────────────────────────────────────
function ArenaFloor({ dragonColor }: { dragonColor: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.05 + Math.sin(clock.elapsedTime * 0.5) * 0.03;
    }
  });
  return (
    <>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#0a0010" emissive={dragonColor} emissiveIntensity={0.05} roughness={0.9} metalness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.18, 0]}>
        <ringGeometry args={[2.5, 2.7, 64]} />
        <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.6} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.17, 0]}>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshStandardMaterial color={dragonColor} emissive={dragonColor} emissiveIntensity={0.8} transparent opacity={0.4} />
      </mesh>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING DAMAGE TEXT
// ─────────────────────────────────────────────────────────────────────────────
function DamageFloat({ text, good }: { text: string; good: boolean }) {
  const ref   = useRef<THREE.Group>(null!);
  const start = useRef(Date.now());
  useFrame(() => {
    if (!ref.current) return;
    const elapsed = (Date.now() - start.current) / 1000;
    ref.current.position.y = 1.5 + elapsed * 1.8;
    ref.current.children.forEach((c) => {
      const mat = (c as any).material as THREE.MeshStandardMaterial | undefined;
      if (mat) mat.opacity = Math.max(0, 1 - elapsed * 1.2);
    });
  });
  return (
    <group ref={ref} position={[good ? 0.5 : -0.5, 1.5, 1]}>
      <Billboard>
        <Text
          fontSize={0.5}
          color={good ? '#d946ef' : '#ef4444'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {text}
        </Text>
      </Billboard>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE
// ─────────────────────────────────────────────────────────────────────────────
function Scene({ hpPct, isHit, isDead, floats }: {
  hpPct: number; isHit: boolean; isDead: boolean;
  floats: { id: number; text: string; good: boolean }[];
}) {
  const dragonHex = hpPct > 0.6 ? '#d946ef' : hpPct > 0.3 ? '#f59e0b' : '#ef4444';
  const fireActive = hpPct < 0.5 && !isDead;
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 4, 3]}   intensity={1.5} color="#7c3aed" />
      <pointLight position={[-3, 1, 2]}  intensity={1.0} color="#4c1d95" />
      <pointLight position={[3, 1, 2]}   intensity={0.8} color="#2d1b5e" />
      {fireActive && <pointLight position={[-1.5, 1.5, 2]} intensity={2} color="#f59e0b" />}
      <Stars radius={40} depth={30} count={1200} factor={3} saturation={0.5} fade speed={0.4} />
      <Sparkles count={60} scale={8} size={1.5} speed={0.3} color={dragonHex} opacity={0.4} />
      <ArenaFloor dragonColor={dragonHex} />
      <Float speed={0} rotationIntensity={0} floatIntensity={0}>
        <DragonBody hpPct={hpPct} isHit={isHit} isDead={isDead} fireActive={fireActive} />
      </Float>
      <HitBurst active={isHit} />
      {floats.map(f => <DamageFloat key={f.id} text={f.text} good={f.good} />)}
      <fog attach="fog" args={['#0a0010', 8, 20]} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HP FILL
// ─────────────────────────────────────────────────────────────────────────────
function HpFill({ pct, type }: { pct: number; type: 'player' | 'boss' }) {
  const color = type === 'player'
    ? pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444'
    : pct > 0.6 ? '#d946ef' : pct > 0.3  ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ height: '100%', width: `${Math.max(0, pct * 100)}%`, background: color, borderRadius: '4px', transition: 'width 0.4s ease, background 0.4s', boxShadow: `0 0 8px ${color}` }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMER SVG
// ─────────────────────────────────────────────────────────────────────────────
function TimerSVG({ seconds, max }: { seconds: number; max: number }) {
  const r = 20, circ = 2 * Math.PI * r;
  const prog = (seconds / max) * circ;
  const col  = seconds > 8 ? '#a855f7' : seconds > 4 ? '#f59e0b' : '#ef4444';
  return (
    <svg viewBox="0 0 48 48" width="48" height="48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#1a1a26" strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={col} strokeWidth="4"
        strokeDasharray={`${prog} ${circ}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s linear' }} />
      <text x="24" y="29" textAnchor="middle" fill={col}
        style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 800 }}>
        {seconds}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function ResultScreen({ type, score, isFinalBoss, onRetry, onContinue, onExit }: {
  type: 'victory' | 'defeat'; score: number; isFinalBoss: boolean;
  onRetry: () => void; onContinue: () => void; onExit: () => void;
}) {
  const isWin = type === 'victory';
  return (
    <div style={s({ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' })}>
      <div style={s({ background: '#0a0a0f', border: '1px solid #44445a', borderRadius: '16px', padding: '48px 40px', textAlign: 'center', maxWidth: '400px', width: '90%' })}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
          {isWin ? (isFinalBoss ? '🏆' : '⚔') : '💀'}
        </div>
        <h2 style={s({ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#fff', letterSpacing: '-0.03em', marginBottom: '10px' })}>
          {isWin ? (isFinalBoss ? 'Dragon Slain!' : 'Boss Defeated!') : 'You Were Slain'}
        </h2>
        <p style={s({ fontSize: '0.8rem', color: '#9999bb', lineHeight: 1.7, marginBottom: '24px' })}>
          {isWin
            ? isFinalBoss ? 'The dragon falls. You have mastered this course.' : 'Well fought. Next lesson unlocked.'
            : 'The dragon was too strong. Study and try again.'}
        </p>
        <div style={s({ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '3rem', color: '#d946ef', textShadow: '0 0 24px rgba(217,70,239,0.5)', marginBottom: '4px' })}>{score}%</div>
        <div style={s({ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9999bb', marginBottom: '8px' })}>accuracy</div>
        {isWin && (
          <div style={s({ fontSize: '0.72rem', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px', padding: '5px 16px', display: 'inline-block', marginBottom: '24px' })}>
            +{isFinalBoss ? 150 : 50} XP earned
          </div>
        )}
        <div style={s({ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: !isWin ? '24px' : '0' })}>
          <button onClick={isWin ? onContinue : onRetry} style={s({ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '13px 28px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' })}>
            {isWin ? (isFinalBoss ? 'Claim Certificate' : 'Continue →') : '↺ Try Again'}
          </button>
          <button onClick={onExit} style={s({ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '11px 28px', background: 'transparent', color: '#9999bb', border: '1px solid #44445a', borderRadius: '6px', cursor: 'pointer' })}>
            Back to Course
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function BattleDemo2Client() {
  const questions   = DEMO_QUESTIONS;
  const isFinalBoss = true;
  const maxBossHp   = questions.length * CORRECT_DAMAGE;

  const [qIndex,    setQIndex]    = useState(0);
  const [bossHp,    setBossHp]    = useState(maxBossHp);
  const [playerHp,  setPlayerHp]  = useState(MAX_PLAYER_HP);
  const [selected,  setSelected]  = useState<'A'|'B'|'C'|'D'|null>(null);
  const [revealed,  setRevealed]  = useState(false);
  const [bossHit,   setBossHit]   = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(ANSWER_TIMEOUT);
  const [correct,   setCorrect]   = useState(0);
  const [gameState, setGameState] = useState<'playing'|'victory'|'defeat'>('playing');
  const [floats,    setFloats]    = useState<{ id: number; text: string; good: boolean }[]>([]);

  const floatId  = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = questions[qIndex];

  const spawnFloat = (text: string, good: boolean) => {
    const id = floatId.current++;
    setFloats(f => [...f, { id, text, good }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1400);
  };

  const advance = (nextIdx: number, pHp: number, bHp: number, corr: number) => {
    if (nextIdx >= questions.length) {
      setGameState(corr >= Math.ceil(questions.length * 0.6) ? 'victory' : 'defeat');
      return;
    }
    setQIndex(nextIdx);
    setSelected(null);
    setRevealed(false);
    setTimeLeft(ANSWER_TIMEOUT);
  };

  // Need stable ref for handleTimeout inside interval
  const stateRef = useRef({ playerHp, bossHp, correct, qIndex, revealed, gameState });
  useEffect(() => { stateRef.current = { playerHp, bossHp, correct, qIndex, revealed, gameState }; });

  useEffect(() => {
    if (gameState !== 'playing' || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // timeout damage
          const newHp = stateRef.current.playerHp - WRONG_DAMAGE;
          setPlayerHp(newHp);
          setRevealed(true);
          spawnFloat(`-${WRONG_DAMAGE} HP`, false);
          if (newHp <= 0) { setTimeout(() => setGameState('defeat'), 800); }
          else { setTimeout(() => advance(stateRef.current.qIndex + 1, newHp, stateRef.current.bossHp, stateRef.current.correct), 1400); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [qIndex, revealed, gameState]); // eslint-disable-line

  const handleAnswer = (opt: 'A'|'B'|'C'|'D') => {
    if (revealed) return;
    clearInterval(timerRef.current!);
    setSelected(opt);
    setRevealed(true);
    const isCorrect = opt === currentQ.correctAnswer;

    if (isCorrect) {
      const newBoss = bossHp - CORRECT_DAMAGE;
      const newCorr = correct + 1;
      setBossHp(newBoss);
      setBossHit(true);
      setCorrect(newCorr);
      spawnFloat(`-${CORRECT_DAMAGE}`, true);
      setTimeout(() => setBossHit(false), 500);
      if (newBoss <= 0) { setTimeout(() => setGameState('victory'), 800); return; }
      setTimeout(() => advance(qIndex + 1, playerHp, newBoss, newCorr), 1400);
    } else {
      const newHp = playerHp - WRONG_DAMAGE;
      setPlayerHp(newHp);
      spawnFloat(`-${WRONG_DAMAGE} HP`, false);
      if (newHp <= 0) { setTimeout(() => setGameState('defeat'), 800); return; }
      setTimeout(() => advance(qIndex + 1, newHp, bossHp, correct), 1400);
    }
  };

  const handleRetry = () => {
    setBossHp(maxBossHp); setPlayerHp(MAX_PLAYER_HP);
    setQIndex(0); setSelected(null); setRevealed(false);
    setTimeLeft(ANSWER_TIMEOUT); setCorrect(0);
    setGameState('playing'); setFloats([]);
  };

  const score = Math.round((correct / questions.length) * 100);
  const OPTS  = ['A','B','C','D'] as const;
  const VALS  = [currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD];

  const getState = (o: 'A'|'B'|'C'|'D'): AnswerState => {
    if (!revealed) return selected === o ? 'selected' : 'idle';
    if (o === currentQ.correctAnswer) return 'correct';
    if (o === selected) return 'wrong';
    return 'idle';
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={ROOT}>
        {/* 3-D CANVAS */}
        <div style={CANVAS}>
          <Canvas shadows camera={{ position: [0, 0.5, 5.5], fov: 48 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
            <Suspense fallback={null}>
              <Scene hpPct={bossHp / maxBossHp} isHit={bossHit} isDead={gameState === 'victory'} floats={floats} />
            </Suspense>
          </Canvas>
        </div>

        {/* HTML OVERLAY */}
        <div style={OVERLAY}>
          {/* Header */}
          <header style={HEADER}>
            <button style={EXIT_BTN} onClick={() => window.history.back()}>← Exit</button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={H_TITLE}>🐉 SLAY THE DRAGON</span>
              <span style={H_SUB}>JavaScript &amp; The DOM</span>
            </div>
            <div style={Q_COUNTER}>{qIndex + 1} / {questions.length}</div>
          </header>

          {/* Arena viewport space */}
          <div style={ARENA} />

          {/* Bottom UI */}
          <div style={BOTTOM}>
            {/* HP + Timer row */}
            <div style={HP_ROW}>
              <div style={HP_BLOCK}>
                <div style={{ ...HP_LABEL, color: '#22c55e' }}>
                  <span>⚔ You</span><span>{Math.max(0, playerHp)} HP</span>
                </div>
                <div style={HP_BAR}><HpFill pct={playerHp / MAX_PLAYER_HP} type="player" /></div>
              </div>
              <div style={TIMER_BLK}>
                <TimerSVG seconds={timeLeft} max={ANSWER_TIMEOUT} />
              </div>
              <div style={HP_BLOCK}>
                <div style={{ ...HP_LABEL, color: '#d946ef' }}>
                  <span>🐉 Dragon</span><span>{Math.max(0, bossHp)} HP</span>
                </div>
                <div style={HP_BAR}><HpFill pct={bossHp / maxBossHp} type="boss" /></div>
              </div>
            </div>

            {/* Question */}
            <div style={Q_BOX}>
              <p style={Q_TEXT}>{currentQ.question}</p>
            </div>

            {/* Options */}
            <div style={OPTS_GRID}>
              {OPTS.map((o, i) => {
                const st = getState(o);
                return (
                  <button key={o} style={optionStyle(st)} onClick={() => handleAnswer(o)} disabled={revealed}>
                    <span style={optionLetterStyle(st)}>{o}</span>
                    <span style={{ flex: 1 }}>{VALS[i]}</span>
                    {st === 'correct' && <span style={{ color: '#22c55e' }}>✓</span>}
                    {st === 'wrong'   && <span style={{ color: '#ef4444' }}>✗</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result overlay */}
        {gameState !== 'playing' && (
          <ResultScreen
            type={gameState} score={score} isFinalBoss={isFinalBoss}
            onRetry={handleRetry}
            onContinue={() => console.log('victory — wire to router.push')}
            onExit={() => window.history.back()}
          />
        )}
      </div>
    </>
  );
}