'use client';

import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
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
// // ── Course 4: Law ─────────────────────────────────────────────
// const QUESTIONS = [
//   { question: 'What does "habeas corpus" mean?', options: ['Right to remain silent', 'Right to an attorney', 'Trial by jury', 'You must have the body'], correct: 3 },
//   { question: 'What is the presumption of innocence?', options: ['Guilty until proven innocent', 'No presumption either way', 'Innocent if no evidence', 'Innocent until proven guilty'], correct: 3 },
//   { question: 'What is a "tort" in law?', options: ['A criminal offence', 'A legal contract', 'A court order', 'A civil wrong causing harm'], correct: 3 },
//   { question: 'What does "pro bono" mean?', options: ['In favour of evidence', 'Against the prosecution', 'For monetary gain', 'For the public good / free legal work'], correct: 3 },
//   { question: 'What is "mens rea"?', options: ['The physical act of a crime', 'The evidence presented', 'The jury\'s verdict', 'The guilty mind / criminal intent'], correct: 3 },
//   { question: 'What is a subpoena?', options: ['A type of verdict', 'A court fee', 'A defence strategy', 'A legal order to appear or produce evidence'], correct: 3 },
//   { question: 'What does "prima facie" mean?', options: ['Beyond reasonable doubt', 'Without prejudice', 'In good faith', 'At first appearance / on the face of it'], correct: 3 },
// ];

const MAX_PLAYER_HP  = 100;
const CORRECT_DAMAGE = 20;
const WRONG_DAMAGE   = 15;
const ANSWER_TIMEOUT = 15;
type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong';
const c = (x: React.CSSProperties): React.CSSProperties => x;

// ─────────────────────────────────────────────────────────────────────────────
// LAVA GROUND — bubbling displacement
// ─────────────────────────────────────────────────────────────────────────────
function LavaGround({ color }: { color: string }) {
  const geoRef = useRef<THREE.PlaneGeometry>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (matRef.current) matRef.current.emissiveIntensity = 0.4 + Math.sin(t * 0.7) * 0.2;
    if (geoRef.current) {
      const pos = geoRef.current.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 1.5 + t * 1.2) * 0.08 + Math.cos(y * 1.8 + t * 0.9) * 0.06);
      }
      pos.needsUpdate = true;
      geoRef.current.computeVertexNormals();
    }
  });

  return (
    <group position={[0, -2.5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry ref={geoRef} args={[14, 14, 32, 32]} />
        <meshStandardMaterial ref={matRef} color="#1a0000" emissive={color} emissiveIntensity={0.4} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Lava cracks */}
      {[0, 0.8, -0.6, 1.4].map((rz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, rz]} position={[0, 0.01, 0]}>
          <planeGeometry args={[5 - i * 0.5, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.9} />
        </mesh>
      ))}
      {/* Rune rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.8, 3.0, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.4, 1.5, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>
      <pointLight color={color} intensity={4} distance={6} decay={2} position={[0, 0.5, 0]} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAGON — organic capsule/sphere-based body, swept wings, sculpted head
// ─────────────────────────────────────────────────────────────────────────────
function Dragon({ hpPct, isHit, isDead, fireActive }: {
  hpPct: number; isHit: boolean; isDead: boolean; fireActive: boolean;
}) {
  const rootRef  = useRef<THREE.Group>(null!);
  const bodyRef  = useRef<THREE.Mesh>(null!);
  const neckRef  = useRef<THREE.Group>(null!);
  const headRef  = useRef<THREE.Group>(null!);
  const jawRef   = useRef<THREE.Mesh>(null!);
  const wingLRef = useRef<THREE.Group>(null!);
  const wingRRef = useRef<THREE.Group>(null!);
  const tailRef  = useRef<THREE.Group>(null!);
  const eyeLRef  = useRef<THREE.Mesh>(null!);
  const eyeRRef  = useRef<THREE.Mesh>(null!);
  const hitFlash = useRef(0);

  const col = useMemo(() => {
    if (hpPct > 0.6) return new THREE.Color('#c026d3');
    if (hpPct > 0.3) return new THREE.Color('#ea580c');
    return new THREE.Color('#dc2626');
  }, [hpPct]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!rootRef.current) return;

    if (isDead) {
      rootRef.current.rotation.z = THREE.MathUtils.lerp(rootRef.current.rotation.z, -1.1, 0.02);
      rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, -3.5, 0.018);
      return;
    }

    rootRef.current.position.y = Math.sin(t * 0.7) * 0.22 + 0.1;
    rootRef.current.position.x = Math.sin(t * 0.35) * 0.12;
    rootRef.current.rotation.y = Math.sin(t * 0.28) * 0.14;
    rootRef.current.rotation.z = Math.sin(t * 0.5) * 0.04;

    if (neckRef.current) {
      neckRef.current.rotation.x = 0.22 + Math.sin(t * 0.9) * 0.06;
      neckRef.current.rotation.y = Math.sin(t * 0.45) * 0.12;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 1.1) * 0.07 - 0.05;
      headRef.current.rotation.y = Math.sin(t * 0.6) * 0.18;
    }
    if (jawRef.current) {
      jawRef.current.rotation.x = fireActive
        ? 0.35 + Math.sin(t * 8) * 0.1
        : 0.04 + Math.abs(Math.sin(t * 0.4)) * 0.06;
    }
    if (wingLRef.current) {
      wingLRef.current.rotation.z = 0.3 + Math.sin(t * 2.1) * 0.35 + Math.sin(t * 4.3) * 0.05;
      wingLRef.current.rotation.x = Math.sin(t * 1.3) * 0.08;
    }
    if (wingRRef.current) {
      wingRRef.current.rotation.z = -0.3 - Math.sin(t * 2.1 + 0.3) * 0.35;
      wingRRef.current.rotation.x = Math.sin(t * 1.3 + 0.2) * 0.08;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 1.8) * 0.45;
      tailRef.current.rotation.z = Math.sin(t * 1.2) * 0.12;
    }

    const eyeI = 1.2 + Math.sin(t * 2.5) * 0.4;
    if (eyeLRef.current) (eyeLRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = eyeI;
    if (eyeRRef.current) (eyeRRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = eyeI;

    if (isHit) hitFlash.current = 1.0;
    if (hitFlash.current > 0) {
      hitFlash.current = Math.max(0, hitFlash.current - 0.07);
      const m = bodyRef.current?.material as THREE.MeshStandardMaterial | undefined;
      if (m) { m.emissiveIntensity = hitFlash.current * 5; m.emissive.setHex(0xffffff); }
    } else {
      const m = bodyRef.current?.material as THREE.MeshStandardMaterial | undefined;
      if (m) { m.emissiveIntensity = 0.15; m.emissive.copy(col); }
    }
  });

  const skin = '#1c0a28';
  const dark = '#0e0516';

  return (
    <group ref={rootRef} position={[0, 0.3, 0]}>
      {/* TORSO */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[1.0, 24, 18]} />
        <meshStandardMaterial color={skin} emissive={col} emissiveIntensity={0.15} roughness={0.35} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.1, 0.65]}>
        <sphereGeometry args={[0.6, 16, 12]} />
        <meshStandardMaterial color={skin} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.55, 0.35]}>
        <sphereGeometry args={[0.55, 14, 10]} />
        <meshStandardMaterial color="#2d1040" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Soul gem */}
      <mesh position={[0, 0.05, 0.85]}>
        <octahedronGeometry args={[0.18, 1]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={4} transparent opacity={0.9} roughness={0} metalness={1} />
      </mesh>
      <pointLight color={col} intensity={3} distance={3} decay={2} position={[0, 0.05, 0.9]} />
      {/* Shoulders */}
      {([-0.75, 0.75] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0.15]}>
          <sphereGeometry args={[0.42, 12, 10]} />
          <meshStandardMaterial color={skin} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* NECK */}
      <group ref={neckRef} position={[0, 0.85, 0.45]}>
        <mesh rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.45, 0.6, 12]} />
          <meshStandardMaterial color={skin} roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.45, 0.12]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.32, 0.5, 10]} />
          <meshStandardMaterial color={skin} roughness={0.35} metalness={0.6} />
        </mesh>
        {[0, 0.18, 0.36].map((y, i) => (
          <mesh key={i} position={[0, y, -0.12 - i * 0.04]} rotation={[-0.3, 0, 0]}>
            <coneGeometry args={[0.06 - i * 0.01, 0.2 - i * 0.03, 5]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} roughness={0.2} />
          </mesh>
        ))}

        {/* HEAD */}
        <group ref={headRef} position={[0, 0.75, 0.3]}>
          <mesh castShadow>
            <sphereGeometry args={[0.58, 18, 14]} />
            <meshStandardMaterial color={skin} emissive={col} emissiveIntensity={0.1} roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Brow */}
          <mesh position={[0, 0.22, 0.42]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.7, 0.12, 0.3]} />
            <meshStandardMaterial color={dark} roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Snout */}
          <mesh position={[0, -0.08, 0.52]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.44, 0.22, 0.58]} />
            <meshStandardMaterial color={skin} roughness={0.35} metalness={0.55} />
          </mesh>
          <mesh position={[0, -0.1, 0.82]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial color={dark} roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Nostrils */}
          {([-0.1, 0.1] as number[]).map((x, i) => (
            <mesh key={i} position={[x, -0.06, 0.9]}>
              <sphereGeometry args={[0.045, 7, 7]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={3} />
            </mesh>
          ))}
          {/* Jaw */}
          <mesh ref={jawRef} position={[0, -0.24, 0.38]}>
            <boxGeometry args={[0.38, 0.16, 0.52]} />
            <meshStandardMaterial color={dark} roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Upper teeth */}
          {[-0.14, -0.05, 0.05, 0.14].map((x, i) => (
            <mesh key={i} position={[x, -0.16, 0.66]}>
              <coneGeometry args={[0.025, 0.1, 4]} />
              <meshStandardMaterial color="#e8e0f0" emissive="#ffffff" emissiveIntensity={0.3} roughness={0.1} />
            </mesh>
          ))}
          {/* Lower teeth */}
          {[-0.1, 0, 0.1].map((x, i) => (
            <mesh key={i} position={[x, -0.28, 0.62]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.022, 0.08, 4]} />
              <meshStandardMaterial color="#d8d0e8" roughness={0.1} />
            </mesh>
          ))}
          {/* EYES */}
          {([-0.3, 0.3] as number[]).map((x, i) => (
            <group key={i} position={[x, 0.1, 0.44]}>
              <mesh>
                <sphereGeometry args={[0.16, 12, 10]} />
                <meshStandardMaterial color="#03000a" roughness={0.1} metalness={0.9} />
              </mesh>
              <mesh ref={i === 0 ? eyeLRef : eyeRRef} position={[0, 0, 0.1]}>
                <sphereGeometry args={[0.1, 10, 10]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.5} roughness={0} metalness={1} />
              </mesh>
              <mesh position={[0, 0, 0.18]}>
                <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
                <meshStandardMaterial color="#000000" roughness={0.1} />
              </mesh>
              <pointLight color={col} intensity={1.2} distance={1.5} decay={3} />
            </group>
          ))}
          {/* HORNS */}
          {([-1, 1] as number[]).map((side, i) => (
            <group key={i} position={[side * 0.28, 0.48, -0.05]}>
              <mesh rotation={[0.1, side * 0.3, side * -0.35]}>
                <coneGeometry args={[0.065, 0.7, 7]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} roughness={0.15} metalness={0.8} />
              </mesh>
              <mesh position={[side * 0.08, 0.35, -0.04]} rotation={[0.2, side * 0.5, side * -0.5]}>
                <coneGeometry args={[0.035, 0.4, 6]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} roughness={0.2} />
              </mesh>
            </group>
          ))}
          {/* Crest spikes */}
          {[-0.22, 0, 0.22].map((x, i) => (
            <mesh key={i} position={[x, 0.58 - i * 0.04, -0.08]} rotation={[-0.2, 0, x * 0.5]}>
              <coneGeometry args={[0.03, 0.28 - i * 0.04, 5]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} roughness={0.1} />
            </mesh>
          ))}
          {/* Dead X eyes */}
          {isDead && ([-0.3, 0.3] as number[]).map((x, i) => (
            <group key={i}>
              {[Math.PI / 4, -Math.PI / 4].map((rot, j) => (
                <mesh key={j} position={[x, 0.1, 0.54]} rotation={[0, 0, rot]}>
                  <boxGeometry args={[0.28, 0.035, 0.02]} />
                  <meshStandardMaterial color="white" emissive="white" emissiveIntensity={3} />
                </mesh>
              ))}
            </group>
          ))}
          {/* Fire breath */}
          {fireActive && (
            <group position={[0, -0.12, 1.05]}>
              <Sparkles count={50} scale={[1.8, 0.5, 0.5]} size={4} speed={2} color="#f97316" />
              <Sparkles count={30} scale={[1.4, 0.35, 0.35]} size={2.5} speed={2.8} color="#fbbf24" />
              <Sparkles count={20} scale={[1.0, 0.25, 0.25]} size={2} speed={3.5} color="#ef4444" />
              <pointLight color="#f97316" intensity={5} distance={3} decay={2} />
            </group>
          )}
        </group>
      </group>

      {/* WINGS */}
      {([
        { side: -1, pos: [-1.0, 0.35, -0.15] as [number,number,number], rot: [0.15, -0.25, 0.35] as [number,number,number] },
        { side:  1, pos: [ 1.0, 0.35, -0.15] as [number,number,number], rot: [0.15,  0.25,-0.35] as [number,number,number] },
      ]).map(({ side, pos, rot }, wi) => (
        <group key={wi} ref={wi === 0 ? wingLRef : wingRRef} position={pos} rotation={rot}>
          <mesh>
            <boxGeometry args={[1.7, 0.035, 1.05]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.12} transparent opacity={0.72} roughness={0.15} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[side * 0.7, 0, -0.3]} rotation={[0, side * 0.3, side * 0.1]}>
            <boxGeometry args={[0.5, 0.025, 0.6]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.1} transparent opacity={0.6} roughness={0.15} side={THREE.DoubleSide} />
          </mesh>
          {/* Ribs */}
          {[
            { x: side * -0.2, len: 1.2 },
            { x: side *  0.2, len: 1.0 },
            { x: side *  0.6, len: 0.8 },
          ].map((rib, i) => (
            <mesh key={i} position={[rib.x, 0, -0.4]} rotation={[0, 0, 0.1 * side]}>
              <cylinderGeometry args={[0.028, 0.012, rib.len, 6]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.55} roughness={0.1} metalness={0.8} />
            </mesh>
          ))}
          {/* Wingtip claw */}
          <mesh position={[side * 0.92, 0, -0.58]} rotation={[0, 0, side * 0.6]}>
            <coneGeometry args={[0.04, 0.3, 5]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* ARMS */}
      {([-1, 1] as number[]).map((side, si) => (
        <group key={si} position={[side * 0.88, -0.25, 0.55]} rotation={[0.4, 0, side * 0.55]}>
          <mesh>
            <capsuleGeometry args={[0.1, 0.45, 6, 8]} />
            <meshStandardMaterial color={skin} roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[0, -0.42, 0.15]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.08, 0.35, 6, 8]} />
            <meshStandardMaterial color={skin} roughness={0.4} metalness={0.55} />
          </mesh>
          {[-0.12, 0, 0.12].map((cx, ci) => (
            <mesh key={ci} position={[cx + side * 0.02, -0.72, 0.38]} rotation={[0.9, 0, side * 0.15 * (ci - 1)]}>
              <coneGeometry args={[0.03, 0.22, 5]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} roughness={0.1} metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* DORSAL SPINES */}
      {[
        { z: -0.55, y: 1.02, sc: 1.1 },
        { z: -0.30, y: 0.98, sc: 0.9 },
        { z: -0.05, y: 0.94, sc: 0.75 },
        { z:  0.20, y: 0.88, sc: 0.6 },
        { z:  0.42, y: 0.82, sc: 0.45 },
      ].map(({ z, y, sc }, i) => (
        <mesh key={i} position={[0, y, z]} rotation={[-0.15, 0, 0]}>
          <coneGeometry args={[0.05 * sc, 0.42 * sc, 6]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.65} roughness={0.1} metalness={0.85} />
        </mesh>
      ))}

      {/* TAIL */}
      <group ref={tailRef} position={[0.15, -0.5, -0.95]}>
        <mesh rotation={[0.5, 0.2, 0.1]}>
          <capsuleGeometry args={[0.2, 0.9, 6, 8]} />
          <meshStandardMaterial color={skin} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.15, -0.7, -0.5]} rotation={[0.6, 0.4, 0.15]}>
          <capsuleGeometry args={[0.13, 0.7, 5, 7]} />
          <meshStandardMaterial color={skin} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.35, -1.2, -0.85]} rotation={[0.5, 0.5, 0.1]}>
          <capsuleGeometry args={[0.07, 0.55, 4, 6]} />
          <meshStandardMaterial color={skin} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.5, -1.65, -1.1]} rotation={[0.4, 0.6, 0.3]}>
          <coneGeometry args={[0.12, 0.38, 4]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* HIND LEGS */}
      {([-1, 1] as number[]).map((side, si) => (
        <group key={si} position={[side * 0.65, -0.7, -0.35]}>
          <mesh rotation={[0.2, 0, side * 0.2]}>
            <capsuleGeometry args={[0.14, 0.5, 6, 8]} />
            <meshStandardMaterial color={skin} roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[side * 0.05, -0.55, 0.2]} rotation={[0.6, 0, 0]}>
            <capsuleGeometry args={[0.11, 0.4, 5, 7]} />
            <meshStandardMaterial color={skin} roughness={0.4} metalness={0.55} />
          </mesh>
          {[-0.1, 0, 0.1].map((cx, ci) => (
            <mesh key={ci} position={[cx, -0.88, 0.38]} rotation={[0.7, 0, 0]}>
              <coneGeometry args={[0.035, 0.2, 5]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.35} roughness={0.1} metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      <pointLight color={col} intensity={3} distance={5} decay={2} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBITING RUNE SHARDS
// ─────────────────────────────────────────────────────────────────────────────
function RuneShards({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.4; });
  return (
    <group ref={ref} position={[0, -0.2, 0]}>
      {[...Array(14)].map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const r = 1.9 + Math.sin(i * 1.3) * 0.3;
        const sc = 0.5 + Math.sin(i * 1.7) * 0.3;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, Math.sin(i * 0.8) * 0.6, Math.sin(angle) * r]}
            rotation={[i * 0.4, i * 0.7, i * 0.3]}>
            <octahedronGeometry args={[0.08 * sc, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} roughness={0} metalness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HIT SHOCKWAVE RINGS
// ─────────────────────────────────────────────────────────────────────────────
function HitShockwave({ active }: { active: boolean }) {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const p  = useRef(0);
  useFrame(() => {
    if (active) p.current = Math.min(p.current + 0.1, 1);
    else        p.current = Math.max(p.current - 0.06, 0);
    if (r1.current) { r1.current.scale.setScalar(1 + p.current * 3); (r1.current.material as THREE.MeshStandardMaterial).opacity = (1 - p.current) * 0.7; }
    if (r2.current) { r2.current.scale.setScalar(1 + p.current * 2); (r2.current.material as THREE.MeshStandardMaterial).opacity = (1 - p.current) * 0.5; }
  });
  return (
    <group position={[0, 0.3, 0]}>
      <mesh ref={r1} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.65, 32]} />
        <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={4} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING DAMAGE NUMBERS
// ─────────────────────────────────────────────────────────────────────────────
function DamageFloat({ text, good }: { text: string; good: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const t0  = useRef(Date.now());
  useFrame(() => {
    if (!ref.current) return;
    const e = (Date.now() - t0.current) / 1000;
    ref.current.position.y = 2.0 + e * 2.2;
    ref.current.position.x = (good ? 0.6 : -0.6) + Math.sin(e * 3) * 0.1;
    ref.current.scale.setScalar(Math.max(0, 1 - e * 0.6) * 1.4);
  });
  return (
    <group ref={ref} position={[good ? 0.6 : -0.6, 2, 1.2]}>
      <Billboard>
        <Text fontSize={good ? 0.7 : 0.55} color={good ? '#e879f9' : '#f87171'}
          anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000">
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
  const hex = hpPct > 0.6 ? '#c026d3' : hpPct > 0.3 ? '#ea580c' : '#dc2626';
  const fire = hpPct < 0.5 && !isDead;
  return (
    <>
      <ambientLight intensity={0.08} color="#200030" />
      <pointLight position={[0, 6, 2]}  intensity={2.5} color="#9333ea" />
      <pointLight position={[-5, 2, 1]} intensity={1.8} color="#6d28d9" />
      <pointLight position={[5, 2, 1]}  intensity={1.2} color="#4c1d95" />
      <pointLight position={[0, -1, 4]} intensity={1.0} color={hex} />
      <pointLight position={[0, -2, 0]} intensity={3.5} color={hex} />
      {fire && <pointLight position={[-0.5, 2.5, 2.5]} intensity={4} color="#f97316" />}
      <Stars radius={60} depth={40} count={2000} factor={4} saturation={0.6} fade speed={0.3} />
      <Sparkles count={80} scale={10} size={2}   speed={0.4} color={hex}     opacity={0.5} />
      <Sparkles count={40} scale={6}  size={1.5} speed={0.8} color="#fbbf24" opacity={0.3} />
      <LavaGround color={hex} />
      {!isDead && <RuneShards color={hex} />}
      <Dragon hpPct={hpPct} isHit={isHit} isDead={isDead} fireActive={fire} />
      <HitShockwave active={isHit} />
      {floats.map(f => <DamageFloat key={f.id} text={f.text} good={f.good} />)}
      <fog attach="fog" args={['#0d0014', 10, 28]} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD — SEGMENTED HP BAR
// ─────────────────────────────────────────────────────────────────────────────
function HpBar({ pct, type, shake }: { pct: number; type: 'player' | 'boss'; shake: boolean }) {
  const cp = Math.max(0, Math.min(1, pct));
  const color = type === 'player'
    ? cp > 0.5 ? '#22c55e' : cp > 0.25 ? '#f59e0b' : '#ef4444'
    : cp > 0.6 ? '#c026d3' : cp > 0.3  ? '#ea580c' : '#dc2626';
  const segs = 20;
  return (
    <div style={c({ display: 'flex', gap: '2px', animation: shake ? 'hpShake 0.35s ease' : 'none' })}>
      {[...Array(segs)].map((_, i) => {
        const filled = (i / segs) < cp;
        return (
          <div key={i} style={c({
            flex: 1, height: '14px',
            background: filled ? color : 'rgba(255,255,255,0.06)',
            borderRadius: '2px',
            boxShadow: filled ? `0 0 6px ${color}` : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
            clipPath: 'polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)',
          })} />
        );
      })}
    </div>
  );
}

// TIMER RING
function TimerRing({ seconds, max }: { seconds: number; max: number }) {
  const r = 26, circ = 2 * Math.PI * r;
  const prog = (seconds / max) * circ;
  const col = seconds > 8 ? '#a855f7' : seconds > 4 ? '#f59e0b' : '#ef4444';
  const urgent = seconds <= 4;
  return (
    <div style={c({ position: 'relative', width: '64px', height: '64px', flexShrink: 0 })}>
      <svg viewBox="0 0 60 60" width="64" height="64" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="30" cy="30" r={r} fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={`${prog} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s', filter: `drop-shadow(0 0 4px ${col})` }} />
      </svg>
      <div style={c({
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Syne', sans-serif", fontWeight: 800,
        fontSize: urgent ? '1.4rem' : '1.1rem', color: col,
        animation: urgent ? 'urgentPulse 0.5s ease-in-out infinite alternate' : 'none',
        textShadow: `0 0 12px ${col}`,
      })}>
        {seconds}
      </div>
    </div>
  );
}

// OPTION BUTTON
function OptionBtn({ letter, text, state, onClick, disabled }: {
  letter: string; text: string; state: AnswerState; onClick: () => void; disabled: boolean;
}) {
  const [hov, setHov] = useState(false);
  const cfgs: Record<AnswerState, { bg: string; border: string; shadow: string }> = {
    idle:     { bg: hov ? 'rgba(168,85,247,0.08)' : 'rgba(15,5,25,0.85)', border: hov ? '#7c3aed' : 'rgba(255,255,255,0.08)', shadow: hov ? '0 0 20px rgba(124,58,237,0.25)' : 'none' },
    selected: { bg: 'rgba(168,85,247,0.15)', border: '#a855f7', shadow: '0 0 24px rgba(168,85,247,0.35)' },
    correct:  { bg: 'rgba(34,197,94,0.12)',  border: '#22c55e', shadow: '0 0 28px rgba(34,197,94,0.4)' },
    wrong:    { bg: 'rgba(239,68,68,0.10)',  border: '#ef4444', shadow: '0 0 20px rgba(239,68,68,0.3)' },
  };
  const cfg = cfgs[state];
  const lc: Record<AnswerState, string> = { idle: '#a855f7', selected: '#c084fc', correct: '#22c55e', wrong: '#ef4444' };
  return (
    <button
      style={c({
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 18px', borderRadius: '10px',
        cursor: state === 'idle' ? 'pointer' : 'default',
        textAlign: 'left' as const,
        border: `1px solid ${cfg.border}`,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.76rem',
        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
        lineHeight: 1.35, background: cfg.bg, boxShadow: cfg.shadow, color: '#e8e0f8',
        transform: state === 'idle' && hov ? 'translateY(-1px)' : 'none',
        backdropFilter: 'blur(8px)',
      })}
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <span style={c({
        width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.85rem',
        color: lc[state],
        background: state === 'correct' ? 'rgba(34,197,94,0.15)' : state === 'wrong' ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.12)',
        border: `1px solid ${lc[state]}40`,
      })}>
        {letter}
      </span>
      <span style={{ flex: 1 }}>{text}</span>
      {state === 'correct' && <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>}
      {state === 'wrong'   && <span style={{ color: '#ef4444', fontSize: '1.1rem' }}>✗</span>}
    </button>
  );
}

// RESULT SCREEN
function ResultScreen({ type, score, isFinalBoss, onRetry, onContinue, onExit }: {
  type: 'victory' | 'defeat'; score: number; isFinalBoss: boolean;
  onRetry: () => void; onContinue: () => void; onExit: () => void;
}) {
  const win = type === 'victory';
  return (
    <div style={c({ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' })}>
      <div style={c({ position: 'absolute', inset: 0, background: win ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(192,38,211,0.12) 0%, transparent 70%)' : 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,38,38,0.08) 0%, transparent 70%)' })} />
      <div style={c({
        position: 'relative',
        background: 'linear-gradient(160deg, #0f0518 0%, #1a0a28 60%, #0f0518 100%)',
        border: `1px solid ${win ? 'rgba(192,38,211,0.4)' : 'rgba(239,68,68,0.3)'}`,
        borderRadius: '20px', padding: '52px 44px', textAlign: 'center',
        maxWidth: '440px', width: '90%',
        boxShadow: win ? '0 0 60px rgba(192,38,211,0.2)' : '0 0 40px rgba(220,38,38,0.15)',
      })}>
        <div style={c({ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: win ? 'linear-gradient(90deg, transparent, #c026d3, transparent)' : 'linear-gradient(90deg, transparent, #dc2626, transparent)' })} />
        <div style={{ fontSize: '4rem', marginBottom: '20px', filter: win ? 'drop-shadow(0 0 24px rgba(192,38,211,0.6))' : 'none' }}>
          {win ? (isFinalBoss ? '🏆' : '⚔️') : '💀'}
        </div>
        <h2 style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.03em', marginBottom: '10px', background: win ? 'linear-gradient(135deg, #e879f9, #a855f7)' : 'linear-gradient(135deg, #f87171, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' })}>
          {win ? (isFinalBoss ? 'Dragon Slain!' : 'Boss Defeated!') : 'You Were Slain'}
        </h2>
        <p style={c({ fontSize: '0.82rem', color: '#9d8ab8', lineHeight: 1.8, marginBottom: '28px' })}>
          {win ? (isFinalBoss ? 'The dragon falls. This course is now yours.' : 'Well fought. Next lesson unlocked.') : 'The dragon was too strong. Study and return.'}
        </p>
        <div style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3.5rem', lineHeight: 1, background: 'linear-gradient(135deg, #e879f9, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' })}>
          {score}%
        </div>
        <div style={c({ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b5b8a', marginTop: '4px', marginBottom: win ? '16px' : '28px' })}>accuracy</div>
        {win && (
          <div style={c({ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '999px', padding: '6px 18px', marginBottom: '28px', background: 'rgba(251,191,36,0.06)' })}>
            ⚡ +{isFinalBoss ? 150 : 50} XP earned
          </div>
        )}
        <div style={c({ display: 'flex', flexDirection: 'column', gap: '10px' })}>
          <button onClick={win ? onContinue : onRetry} style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '15px 32px', background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 0 30px rgba(124,58,237,0.35)' })}>
            {win ? (isFinalBoss ? '🏆 Claim Certificate' : 'Continue →') : '↺ Try Again'}
          </button>
          <button onClick={onExit} style={c({ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 32px', background: 'transparent', color: '#6b5b8a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer' })}>
            Back to Course
          </button>
        </div>
        <div style={c({ position: 'absolute', bottom: 0, left: '30%', right: '30%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)' })} />
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
  const [playerHit, setPlayerHit] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(ANSWER_TIMEOUT);
  const [correct,   setCorrect]   = useState(0);
  const [gameState, setGameState] = useState<'playing'|'victory'|'defeat'>('playing');
  const [floats,    setFloats]    = useState<{ id: number; text: string; good: boolean }[]>([]);

  const floatId  = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const stateRef = useRef({ playerHp, bossHp, correct, qIndex });
  useEffect(() => { stateRef.current = { playerHp, bossHp, correct, qIndex }; });

  const currentQ = questions[qIndex];

  const spawnFloat = (text: string, good: boolean) => {
    const id = floatId.current++;
    setFloats(f => [...f, { id, text, good }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1600);
  };

  const advance = (nextIdx: number, corr: number) => {
    if (nextIdx >= questions.length) { setGameState(corr >= Math.ceil(questions.length * 0.6) ? 'victory' : 'defeat'); return; }
    setQIndex(nextIdx); setSelected(null); setRevealed(false); setTimeLeft(ANSWER_TIMEOUT);
  };

  useEffect(() => {
    if (gameState !== 'playing' || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          const { playerHp: pH, correct: corr, qIndex: qi } = stateRef.current;
          const nHp = pH - WRONG_DAMAGE;
          setPlayerHp(nHp); setRevealed(true); setPlayerHit(true);
          spawnFloat(`-${WRONG_DAMAGE} HP`, false);
          setTimeout(() => setPlayerHit(false), 600);
          if (nHp <= 0) setTimeout(() => setGameState('defeat'), 800);
          else setTimeout(() => advance(qi + 1, corr), 1500);
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
    setSelected(opt); setRevealed(true);
    if (opt === currentQ.correctAnswer) {
      const nb = bossHp - CORRECT_DAMAGE, nc = correct + 1;
      setBossHp(nb); setBossHit(true); setCorrect(nc);
      spawnFloat(`-${CORRECT_DAMAGE}`, true);
      setTimeout(() => setBossHit(false), 600);
      if (nb <= 0) { setTimeout(() => setGameState('victory'), 900); return; }
      setTimeout(() => advance(qIndex + 1, nc), 1500);
    } else {
      const nh = playerHp - WRONG_DAMAGE;
      setPlayerHp(nh); setPlayerHit(true);
      spawnFloat(`-${WRONG_DAMAGE} HP`, false);
      setTimeout(() => setPlayerHit(false), 600);
      if (nh <= 0) { setTimeout(() => setGameState('defeat'), 800); return; }
      setTimeout(() => advance(qIndex + 1, correct), 1500);
    }
  };

  const handleRetry = () => {
    setBossHp(maxBossHp); setPlayerHp(MAX_PLAYER_HP); setQIndex(0);
    setSelected(null); setRevealed(false); setTimeLeft(ANSWER_TIMEOUT);
    setCorrect(0); setGameState('playing'); setFloats([]);
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
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes urgentPulse { from{transform:scale(1)} to{transform:scale(1.15)} }
        @keyframes hpShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 50%{transform:translateX(4px)} 70%{transform:translateX(-3px)} }
        @keyframes qSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hGlow { 0%,100%{box-shadow:0 1px 0 rgba(168,85,247,0.2)} 50%{box-shadow:0 1px 0 rgba(168,85,247,0.5),0 0 30px rgba(168,85,247,0.08)} }
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <div style={c({ position: 'fixed', inset: 0, background: '#04000a', display: 'flex', flexDirection: 'column', fontFamily: "'IBM Plex Mono', monospace", zIndex: 1000, overflow: 'hidden' })}>

        {/* 3-D CANVAS */}
        <div style={c({ position: 'absolute', inset: 0, zIndex: 1 })}>
          <Canvas shadows camera={{ position: [0, 1.2, 6.5], fov: 46 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}>
            <Suspense fallback={null}>
              <Scene hpPct={bossHp / maxBossHp} isHit={bossHit} isDead={gameState === 'victory'} floats={floats} />
            </Suspense>
          </Canvas>
        </div>

        {/* OVERLAY */}
        <div style={c({ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100vh', pointerEvents: 'none' })}>

          {/* ── HEADER ── */}
          <header style={c({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: 'linear-gradient(180deg, rgba(4,0,10,0.97) 0%, rgba(15,5,30,0.92) 100%)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(168,85,247,0.2)', pointerEvents: 'auto', animation: 'hGlow 4s ease-in-out infinite' })}>
            <button onClick={() => window.history.back()} style={c({ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', color: '#7c6a9a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '7px 16px', cursor: 'pointer' })}>← Exit</button>
            <div style={c({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' })}>
              <span style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1rem', letterSpacing: '0.18em', textTransform: 'uppercase', background: 'linear-gradient(135deg, #e879f9, #a855f7, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.5))' })}>
                🐉 Slay the Dragon
              </span>
              <span style={c({ fontSize: '0.58rem', color: '#5a4a7a', letterSpacing: '0.1em' })}>JavaScript &amp; The DOM</span>
            </div>
            <div style={c({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' })}>
              <span style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.78rem', color: '#7c6a9a' })}>
                {qIndex + 1} <span style={{ color: '#3d2f5a' }}>/ {questions.length}</span>
              </span>
              <div style={c({ display: 'flex', gap: '4px' })}>
                {questions.map((_, i) => (
                  <div key={i} style={c({ width: '6px', height: '6px', borderRadius: '50%', background: i < qIndex ? '#7c3aed' : i === qIndex ? '#e879f9' : 'rgba(255,255,255,0.1)', boxShadow: i === qIndex ? '0 0 6px #e879f9' : 'none', transition: 'all 0.3s' })} />
                ))}
              </div>
            </div>
          </header>

          <div style={c({ flex: 1 })} />

          {/* ── BOTTOM HUD ── */}
          <div style={c({ background: 'linear-gradient(0deg, rgba(4,0,10,0.98) 0%, rgba(10,3,20,0.95) 100%)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(168,85,247,0.15)', padding: '18px 28px 22px', pointerEvents: 'auto' })}>

            {/* HP + TIMER */}
            <div style={c({ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' })}>
              <div style={c({ flex: 1 })}>
                <div style={c({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' })}>
                  <span style={c({ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#22c55e', fontWeight: 500 })}>⚔ Hero</span>
                  <span style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: (playerHp/MAX_PLAYER_HP) > 0.5 ? '#22c55e' : (playerHp/MAX_PLAYER_HP) > 0.25 ? '#f59e0b' : '#ef4444' })}>
                    {Math.max(0, playerHp)}<span style={{ fontSize: '0.55rem', color: '#3d4a5a', marginLeft: '2px' }}>HP</span>
                  </span>
                </div>
                <HpBar pct={playerHp / MAX_PLAYER_HP} type="player" shake={playerHit} />
              </div>
              <TimerRing seconds={timeLeft} max={ANSWER_TIMEOUT} />
              <div style={c({ flex: 1 })}>
                <div style={c({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' })}>
                  <span style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: (bossHp/maxBossHp) > 0.6 ? '#c026d3' : (bossHp/maxBossHp) > 0.3 ? '#ea580c' : '#dc2626' })}>
                    {Math.max(0, bossHp)}<span style={{ fontSize: '0.55rem', color: '#4a2a5a', marginLeft: '2px' }}>HP</span>
                  </span>
                  <span style={c({ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c026d3', fontWeight: 500 })}>Dragon 🐉</span>
                </div>
                <HpBar pct={bossHp / maxBossHp} type="boss" shake={bossHit} />
              </div>
            </div>

            {/* QUESTION */}
            <div style={c({ background: 'linear-gradient(135deg, rgba(20,8,35,0.95) 0%, rgba(15,5,28,0.95) 100%)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', boxShadow: '0 0 30px rgba(168,85,247,0.06), inset 0 1px 0 rgba(255,255,255,0.04)', animation: 'qSlide 0.25s ease' })}>
              <div style={c({ display: 'flex', alignItems: 'flex-start', gap: '12px' })}>
                <div style={c({ width: '3px', flexShrink: 0, alignSelf: 'stretch', borderRadius: '2px', background: 'linear-gradient(180deg, #a855f7, #7c3aed)', marginTop: '2px' })} />
                <p style={c({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(0.88rem, 2vw, 1.05rem)', color: '#f0e8ff', lineHeight: 1.55 })}>
                  {currentQ.question}
                </p>
              </div>
            </div>

            {/* OPTIONS */}
            <div style={c({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' })}>
              {OPTS.map((o, i) => (
                <OptionBtn key={o} letter={o} text={VALS[i]} state={getState(o)} onClick={() => handleAnswer(o)} disabled={revealed} />
              ))}
            </div>
          </div>
        </div>

        {/* RESULT */}
        {gameState !== 'playing' && (
          <ResultScreen type={gameState} score={score} isFinalBoss={isFinalBoss}
            onRetry={handleRetry} onContinue={() => console.log('wire to router.push')} onExit={() => window.history.back()} />
        )}
      </div>
    </>
  );
}