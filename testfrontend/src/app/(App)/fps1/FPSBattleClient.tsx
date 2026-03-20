'use client';

import React, {
  useRef, useState, useEffect, useMemo, Suspense, useCallback,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Sparkles, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { question: 'Which is the CORRECT HTML tag for the largest heading?', options: ['<h1>', '<head>', '<heading>', '<h6>'], correct: 0 },
  { question: 'Which property makes text bold in CSS?', options: ['font-style', 'text-weight', 'font-weight', 'bold'], correct: 2 },
  { question: 'What does JS stand for?', options: ['JavaStyle', 'JustScript', 'JavaScript', 'JavaSystem'], correct: 2 },
  { question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'append()'], correct: 0 },
  { question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Syntax', 'Coded Style System'], correct: 1 },
  { question: 'Which tag creates a hyperlink?', options: ['<link>', '<href>', '<a>', '<url>'], correct: 2 },
  { question: 'What is the correct way to declare a JS variable?', options: ['variable x = 5', 'v x = 5', 'x = var 5', 'let x = 5'], correct: 3 },
];

const MAX_HP       = 100;
const WRONG_DAMAGE = 0;    // player takes no damage for shooting wrong answer correctly
const SELF_DAMAGE  = 20;   // player shoots the CORRECT answer (bad move)
const BOSS_DAMAGE  = 15;   // each wrong answer destroyed damages boss

// Target layout — 4 positions in a loose arc
const TARGET_POSITIONS: [number, number, number][] = [
  [-3.2,  1.2, -2],
  [-1.0,  2.2, -3],
  [ 1.2,  1.8, -2.5],
  [ 3.0,  0.8, -2],
];

type GameState = 'playing' | 'victory' | 'defeat';

// ─────────────────────────────────────────────────────────────────────────────
// CSS helper
// ─────────────────────────────────────────────────────────────────────────────
const s = (x: React.CSSProperties): React.CSSProperties => x;

// ─────────────────────────────────────────────────────────────────────────────
// CROSSHAIR
// ─────────────────────────────────────────────────────────────────────────────
function Crosshair({ shooting }: { shooting: boolean }) {
  const size = shooting ? 18 : 22;
  const col  = shooting ? '#f0abfc' : '#ffffff';
  return (
    <div style={s({
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 50, pointerEvents: 'none',
      transition: 'all 0.08s ease',
    })}>
      {/* Horizontal */}
      <div style={s({ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })}>
        <div style={s({ width: size, height: 2, background: col, borderRadius: 1, boxShadow: `0 0 6px ${col}` })} />
      </div>
      {/* Vertical */}
      <div style={s({ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })}>
        <div style={s({ width: 2, height: size, background: col, borderRadius: 1, boxShadow: `0 0 6px ${col}` })} />
      </div>
      {/* Center dot */}
      <div style={s({
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 4, height: 4, borderRadius: '50%',
        background: shooting ? '#f0abfc' : '#fff',
        boxShadow: shooting ? '0 0 10px #f0abfc' : '0 0 6px #fff',
      })} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BULLET PARTICLE (flies from center toward target on click)
// ─────────────────────────────────────────────────────────────────────────────
function Bullet({ startPos, targetPos, onDone }: {
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  onDone: () => void;
}) {
  const ref      = useRef<THREE.Mesh>(null!);
  const progress = useRef(0);
  const done     = useRef(false);

  useFrame((_, delta) => {
    if (done.current || !ref.current) return;
    progress.current += delta * 8;
    if (progress.current >= 1) {
      done.current = true;
      onDone();
      return;
    }
    ref.current.position.lerpVectors(startPos, targetPos, progress.current);
  });

  return (
    <mesh ref={ref} position={startPos.toArray() as [number,number,number]}>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshStandardMaterial color="#f0abfc" emissive="#f0abfc" emissiveIntensity={5} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPLOSION BURST (when a target is destroyed)
// ─────────────────────────────────────────────────────────────────────────────
function Explosion({ position, color, onDone }: {
  position: [number,number,number];
  color: string;
  onDone: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const progress = useRef(0);
  const done     = useRef(false);

  useFrame((_, delta) => {
    if (done.current || !groupRef.current) return;
    progress.current += delta * 2.5;
    if (progress.current >= 1) { done.current = true; onDone(); return; }
    groupRef.current.scale.setScalar(1 + progress.current * 3);
    groupRef.current.children.forEach(c => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (m) m.opacity = Math.max(0, 1 - progress.current * 1.5);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const r = 0.3 + Math.random() * 0.3;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, (Math.random() - 0.5) * 0.4]}>
            <octahedronGeometry args={[0.08 + Math.random() * 0.06, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANSWER TARGET — floating card in 3D space
// ─────────────────────────────────────────────────────────────────────────────
function AnswerTarget({
  position, text, isCorrect, isDestroyed, isFlashing,
  targetRef, index,
}: {
  position: [number,number,number];
  text: string;
  isCorrect: boolean;
  isDestroyed: boolean;
  isFlashing: boolean;
  targetRef: (el: THREE.Mesh | null) => void;
  index: number;
}) {
  const meshRef    = useRef<THREE.Mesh>(null!);
  const glowRef    = useRef<THREE.Mesh>(null!);
  const flashTimer = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!meshRef.current) return;

    if (isDestroyed) {
      meshRef.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.18);
      return;
    }

    // Gentle hover drift
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8 + index * 1.1) * 0.12;
    meshRef.current.rotation.y = Math.sin(t * 0.4 + index * 0.7) * 0.08;
    meshRef.current.rotation.z = Math.sin(t * 0.6 + index * 0.5) * 0.03;

    // Glow pulse for correct answer
    if (glowRef.current && isCorrect) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(t * 2.5) * 0.3;
    }

    // Flash red when incorrectly shot
    if (isFlashing) {
      flashTimer.current = 1;
    }
    if (flashTimer.current > 0) {
      flashTimer.current = Math.max(0, flashTimer.current - 0.05);
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(flashTimer.current > 0.5 ? 0xff0000 : 0x000000);
    }
  });

  const setRef = useCallback((el: THREE.Mesh | null) => {
    (meshRef as React.MutableRefObject<THREE.Mesh | null>).current = el;
    targetRef(el);
  }, [targetRef]);

  if (isDestroyed) {
    return (
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1.8, 0.7, 0.08]} />
        <meshStandardMaterial color="#333" transparent opacity={0} />
      </mesh>
    );
  }

  return (
    <group position={position}>
      {/* Card backing */}
      <mesh ref={setRef} castShadow>
        <boxGeometry args={[2.0, 0.75, 0.1]} />
        <meshStandardMaterial
          color={isCorrect ? '#1a0a28' : '#0f0520'}
          emissive={isCorrect ? new THREE.Color('#7c3aed') : new THREE.Color('#1a0530')}
          emissiveIntensity={isCorrect ? 0.6 : 0.12}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Border glow for correct */}
      {isCorrect && (
        <mesh ref={glowRef} position={[0, 0, -0.01]}>
          <boxGeometry args={[2.08, 0.83, 0.08]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.6}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}

      {/* Wrong answer — red border hint */}
      {!isCorrect && (
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[2.08, 0.83, 0.07]} />
          <meshStandardMaterial
            color="#dc2626"
            emissive="#dc2626"
            emissiveIntensity={0.15}
            transparent
            opacity={0.25}
          />
        </mesh>
      )}

      {/* Text label */}
      <Billboard>
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.18}
          maxWidth={1.7}
          textAlign="center"
          color={isCorrect ? '#e9d5ff' : '#fce7f3'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#000"
          font="https://fonts.gstatic.com/s/ibmplexmono/v19/-F6pfjptAgt5VM-kVkGkTCcgfA.woff"
        >
          {text}
        </Text>
      </Billboard>

      {/* Correct answer shield icon */}
      {isCorrect && (
        <Billboard>
          <Text position={[-0.75, 0, 0.14]} fontSize={0.22} anchorX="center" anchorY="middle">
            🛡️
          </Text>
        </Billboard>
      )}

      {/* Wrong answer target icon */}
      {!isCorrect && (
        <Billboard>
          <Text position={[-0.75, 0, 0.14]} fontSize={0.22} anchorX="center" anchorY="middle">
            💀
          </Text>
        </Billboard>
      )}

      {/* Point light per card */}
      <pointLight
        color={isCorrect ? '#a855f7' : '#dc2626'}
        intensity={isCorrect ? 1.2 : 0.4}
        distance={2}
        decay={2}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DARK ARENA ENVIRONMENT
// ─────────────────────────────────────────────────────────────────────────────
function Arena({ wrongLeft }: { wrongLeft: number }) {
  const floorRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (floorRef.current) {
      (floorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.06 + Math.sin(clock.elapsedTime * 0.4) * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.06} color="#1a0030" />
      <pointLight position={[0, 5, 0]}  intensity={2}   color="#7c3aed" />
      <pointLight position={[-4, 2, 0]} intensity={1.2} color="#6d28d9" />
      <pointLight position={[4, 2, 0]}  intensity={0.8} color="#4c1d95" />
      <pointLight position={[0, 0, 3]}  intensity={1.5} color={wrongLeft > 0 ? '#dc2626' : '#22c55e'} />

      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20, 16, 16]} />
        <meshStandardMaterial color="#0a0010" emissive="#4c1d95" emissiveIntensity={0.06} roughness={0.9} />
      </mesh>

      {/* Rune rings on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.48, 0]}>
        <ringGeometry args={[3, 3.2, 64]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.47, 0]}>
        <ringGeometry args={[1.5, 1.6, 48]} />
        <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={1.5} transparent opacity={0.4} />
      </mesh>

      <Stars radius={60} depth={30} count={1500} factor={3} saturation={0.5} fade speed={0.3} />
      <Sparkles count={50} scale={8} size={1.5} speed={0.3} color="#a855f7" opacity={0.4} />

      <fog attach="fog" args={['#0d0014', 10, 28]} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RAYCASTING SCENE — wires everything together
// ─────────────────────────────────────────────────────────────────────────────
interface Shot {
  id: number;
  start: THREE.Vector3;
  target: THREE.Vector3;
}

interface ExplodeFx {
  id: number;
  position: [number, number, number];
  color: string;
}

function ShooterScene({
  question,
  onWrongShot,
  onCorrectShot,
  onRoundClear,
  bossHp,
  maxBossHp,
}: {
  question: typeof QUESTIONS[0];
  onWrongShot: () => void;
  onCorrectShot: () => void;
  onRoundClear: () => void;
  bossHp: number;
  maxBossHp: number;
}) {
  const { camera, gl } = useThree();
  const raycaster     = useMemo(() => new THREE.Raycaster(), []);
  const targetMeshes  = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);
  const [destroyed,   setDestroyed]  = useState<boolean[]>([false, false, false, false]);
  const [flashing,    setFlashing]   = useState<boolean[]>([false, false, false, false]);
  const [shots,       setShots]      = useState<Shot[]>([]);
  const [explosions,  setExplosions] = useState<ExplodeFx[]>([]);
  const shotId   = useRef(0);
  const explId   = useRef(0);
  const roundDone = useRef(false);

  // Reset state on question change
  useEffect(() => {
    setDestroyed([false, false, false, false]);
    setFlashing([false, false, false, false]);
    setShots([]);
    setExplosions([]);
    roundDone.current = false;
  }, [question]);

  // Count wrong ones destroyed
  const wrongIndices = useMemo(
    () => question.options.map((_, i) => i).filter(i => i !== question.correct),
    [question]
  );

  const checkRoundClear = useCallback((newDestroyed: boolean[]) => {
    if (roundDone.current) return;
    const allWrongGone = wrongIndices.every(i => newDestroyed[i]);
    if (allWrongGone) {
      roundDone.current = true;
      setTimeout(onRoundClear, 900);
    }
  }, [wrongIndices, onRoundClear]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (roundDone.current) return;

    // Convert mouse to NDC
    const rect = gl.domElement.getBoundingClientRect();
    const x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const validMeshes = targetMeshes.current.filter((m): m is THREE.Mesh => m !== null);
    const hits = raycaster.intersectObjects(validMeshes, false);

    if (hits.length === 0) return;

    const hitMesh = hits[0].object as THREE.Mesh;
    const idx     = targetMeshes.current.indexOf(hitMesh);
    if (idx === -1 || destroyed[idx]) return;

    const hitPos = hits[0].point;
    const camPos = camera.position.clone();

    const id = shotId.current++;
    setShots(s => [...s, { id, start: camPos, target: hitPos }]);

    if (idx === question.correct) {
      // Shot the correct answer — bad!
      setFlashing(f => { const n = [...f]; n[idx] = true; return n; });
      setTimeout(() => setFlashing(f => { const n = [...f]; n[idx] = false; return n; }), 400);
      onCorrectShot();
    } else {
      // Shot a wrong answer — good!
      const explId2 = explId.current++;
      setExplosions(ex => [...ex, {
        id: explId2,
        position: TARGET_POSITIONS[idx],
        color: '#dc2626',
      }]);
      setDestroyed(d => {
        const n = [...d]; n[idx] = true;
        checkRoundClear(n);
        return n;
      });
      onWrongShot();
    }
  }, [camera, gl, raycaster, question, destroyed, onWrongShot, onCorrectShot, checkRoundClear]);

  useEffect(() => {
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [handleClick, gl]);

  const wrongLeft = wrongIndices.filter(i => !destroyed[i]).length;

  return (
    <>
      <Arena wrongLeft={wrongLeft} />

      {question.options.map((opt, i) => (
        <AnswerTarget
          key={`${question.question}-${i}`}
          position={TARGET_POSITIONS[i]}
          text={opt}
          isCorrect={i === question.correct}
          isDestroyed={destroyed[i]}
          isFlashing={flashing[i]}
          index={i}
          targetRef={(el) => { targetMeshes.current[i] = el; }}
        />
      ))}

      {shots.map(shot => (
        <Bullet
          key={shot.id}
          startPos={shot.start}
          targetPos={shot.target}
          onDone={() => setShots(s => s.filter(x => x.id !== shot.id))}
        />
      ))}

      {explosions.map(ex => (
        <Explosion
          key={ex.id}
          position={ex.position}
          color={ex.color}
          onDone={() => setExplosions(e => e.filter(x => x.id !== ex.id))}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD components
// ─────────────────────────────────────────────────────────────────────────────
function HpSegments({ pct, type }: { pct: number; type: 'player' | 'boss' }) {
  const cp    = Math.max(0, Math.min(1, pct));
  const color = type === 'player'
    ? cp > 0.5 ? '#22c55e' : cp > 0.25 ? '#f59e0b' : '#ef4444'
    : cp > 0.6 ? '#a855f7' : cp > 0.3  ? '#f59e0b' : '#ef4444';
  return (
    <div style={s({ display: 'flex', gap: '2px' })}>
      {[...Array(20)].map((_, i) => (
        <div key={i} style={s({
          flex: 1, height: '10px', borderRadius: '2px',
          background: (i / 20) < cp ? color : 'rgba(255,255,255,0.07)',
          boxShadow: (i / 20) < cp ? `0 0 5px ${color}` : 'none',
          transition: 'background 0.3s',
          clipPath: 'polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)',
        })} />
      ))}
    </div>
  );
}

function ResultScreen({ type, score, onRetry, onExit }: {
  type: 'victory' | 'defeat'; score: number;
  onRetry: () => void; onExit: () => void;
}) {
  const win = type === 'victory';
  return (
    <div style={s({ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' })}>
      <div style={s({ background: 'linear-gradient(160deg, #0f0518, #1a0a28)', border: `1px solid ${win ? 'rgba(168,85,247,0.4)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '20px', padding: '52px 44px', textAlign: 'center', maxWidth: '420px', width: '90%', boxShadow: win ? '0 0 60px rgba(168,85,247,0.2)' : '0 0 40px rgba(239,68,68,0.15)' })}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{win ? '🏆' : '💀'}</div>
        <h2 style={s({ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em', marginBottom: '10px', background: win ? 'linear-gradient(135deg, #e879f9, #a855f7)' : 'linear-gradient(135deg, #f87171, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' })}>
          {win ? 'Target Destroyed!' : 'You Were Hit Too Much'}
        </h2>
        <p style={s({ fontSize: '0.82rem', color: '#9d8ab8', lineHeight: 1.8, marginBottom: '24px' })}>
          {win ? 'All wrong answers eliminated. The correct one survives.' : 'You shot the correct answer too many times. Reload and retry.'}
        </p>
        <div style={s({ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3rem', background: 'linear-gradient(135deg, #e879f9, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' })}>{score}%</div>
        <div style={s({ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b5b8a', marginBottom: '28px' })}>accuracy</div>
        <div style={s({ display: 'flex', flexDirection: 'column', gap: '10px' })}>
          <button onClick={onRetry} style={s({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', padding: '14px 32px', background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 0 28px rgba(124,58,237,0.35)' })}>
            ↺ Play Again
          </button>
          <button onClick={onExit} style={s({ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '11px 32px', background: 'transparent', color: '#6b5b8a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer' })}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function FPSBattlePage() {
  const maxBossHp = QUESTIONS.length * (3 * BOSS_DAMAGE); // 3 wrong targets × per question

  const [qIndex,    setQIndex]    = useState(0);
  const [bossHp,    setBossHp]    = useState(maxBossHp);
  const [playerHp,  setPlayerHp]  = useState(MAX_HP);
  const [correct,   setCorrect]   = useState(0);  // rounds completed cleanly
  const [totalShots,setTotalShots]= useState(0);
  const [goodShots, setGoodShots] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [shooting,  setShooting]  = useState(false);

  const currentQ  = QUESTIONS[qIndex];
  const score     = totalShots > 0 ? Math.round((goodShots / totalShots) * 100) : 0;

  const handleWrongShot = useCallback(() => {
    setShooting(true);
    setTimeout(() => setShooting(false), 120);
    setTotalShots(t => t + 1);
    setGoodShots(g => g + 1);
    setBossHp(h => Math.max(0, h - BOSS_DAMAGE));
  }, []);

  const handleCorrectShot = useCallback(() => {
    setShooting(true);
    setTimeout(() => setShooting(false), 120);
    setTotalShots(t => t + 1);
    setPlayerHp(h => {
      const next = Math.max(0, h - SELF_DAMAGE);
      if (next <= 0) setTimeout(() => setGameState('defeat'), 600);
      return next;
    });
  }, []);

  const handleRoundClear = useCallback(() => {
    setCorrect(c => c + 1);
    const next = qIndex + 1;
    if (next >= QUESTIONS.length) {
      setGameState('victory');
    } else {
      setQIndex(next);
    }
  }, [qIndex]);

  const handleRetry = () => {
    setBossHp(maxBossHp); setPlayerHp(MAX_HP); setQIndex(0);
    setCorrect(0); setTotalShots(0); setGoodShots(0);
    setGameState('playing');
  };

  const bossHpPct   = bossHp / maxBossHp;
  const playerHpPct = playerHp / MAX_HP;
  const progress    = (qIndex / QUESTIONS.length) * 100;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { cursor: none !important; }
      `}</style>

      <div style={s({ position: 'fixed', inset: 0, background: '#04000a', overflow: 'hidden', userSelect: 'none' })}>

        {/* 3-D CANVAS — fills everything */}
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 70 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Suspense fallback={null}>
            {gameState === 'playing' && (
              <ShooterScene
                question={currentQ}
                onWrongShot={handleWrongShot}
                onCorrectShot={handleCorrectShot}
                onRoundClear={handleRoundClear}
                bossHp={bossHp}
                maxBossHp={maxBossHp}
              />
            )}
          </Suspense>
        </Canvas>

        {/* CROSSHAIR */}
        {gameState === 'playing' && <Crosshair shooting={shooting} />}

        {/* ── TOP HUD ── */}
        <div style={s({
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px',
          background: 'linear-gradient(180deg, rgba(4,0,10,0.97) 0%, rgba(15,5,30,0.88) 100%)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(168,85,247,0.15)',
        })}>
          {/* Player HP */}
          <div style={s({ minWidth: '200px' })}>
            <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' })}>
              <span style={s({ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#22c55e', fontWeight: 600 })}>⚔ YOU</span>
              <span style={s({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: playerHpPct > 0.5 ? '#22c55e' : playerHpPct > 0.25 ? '#f59e0b' : '#ef4444' })}>
                {Math.max(0, playerHp)} HP
              </span>
            </div>
            <HpSegments pct={playerHpPct} type="player" />
          </div>

          {/* Center — title + question progress */}
          <div style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' })}>
            <span style={s({ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'linear-gradient(135deg, #e879f9, #a855f7, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' })}>
              🎯 Target Practice
            </span>
            <div style={s({ display: 'flex', gap: '4px' })}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={s({
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: i < qIndex ? '#7c3aed' : i === qIndex ? '#e879f9' : 'rgba(255,255,255,0.1)',
                  boxShadow: i === qIndex ? '0 0 6px #e879f9' : 'none',
                  transition: 'all 0.3s',
                })} />
              ))}
            </div>
          </div>

          {/* Boss HP */}
          <div style={s({ minWidth: '200px' })}>
            <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' })}>
              <span style={s({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: bossHpPct > 0.6 ? '#a855f7' : bossHpPct > 0.3 ? '#f59e0b' : '#ef4444' })}>
                {Math.max(0, bossHp)} HP
              </span>
              <span style={s({ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a855f7', fontWeight: 600 })}>BOSS 🐉</span>
            </div>
            <HpSegments pct={bossHpPct} type="boss" />
          </div>
        </div>

        {/* ── BOTTOM HUD — question + legend ── */}
        <div style={s({
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'linear-gradient(0deg, rgba(4,0,10,0.97) 0%, rgba(10,3,20,0.92) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(168,85,247,0.15)',
          padding: '16px 28px 20px',
        })}>
          {/* Question */}
          <div style={s({
            background: 'linear-gradient(135deg, rgba(20,8,35,0.95), rgba(15,5,28,0.95))',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '12px', padding: '14px 20px',
            marginBottom: '12px',
            boxShadow: '0 0 24px rgba(168,85,247,0.06)',
          })}>
            <div style={s({ display: 'flex', alignItems: 'flex-start', gap: '12px' })}>
              <div style={s({ width: '3px', flexShrink: 0, alignSelf: 'stretch', borderRadius: '2px', background: 'linear-gradient(180deg, #a855f7, #7c3aed)' })} />
              <p style={s({ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 1rem)', color: '#f0e8ff', lineHeight: 1.5, margin: 0 })}>
                {currentQ.question}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div style={s({ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center' })}>
            <div style={s({ display: 'flex', alignItems: 'center', gap: '8px' })}>
              <div style={s({ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' })}>💀</div>
              <span style={s({ fontSize: '0.72rem', color: '#9d8ab8' })}>Shoot these</span>
            </div>
            <div style={s({ width: '1px', height: '20px', background: 'rgba(168,85,247,0.2)' })} />
            <div style={s({ display: 'flex', alignItems: 'center', gap: '8px' })}>
              <div style={s({ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' })}>🛡️</div>
              <span style={s({ fontSize: '0.72rem', color: '#9d8ab8' })}>Spare this one</span>
            </div>
            <div style={s({ width: '1px', height: '20px', background: 'rgba(168,85,247,0.2)' })} />
            <div style={s({ fontSize: '0.72rem', color: '#6b5b8a' })}>
              Round <span style={{ color: '#e879f9', fontWeight: 700 }}>{qIndex + 1}</span> / {QUESTIONS.length}
            </div>
            <div style={s({ fontSize: '0.72rem', color: '#6b5b8a' })}>
              Accuracy <span style={{ color: '#a855f7', fontWeight: 700 }}>{score}%</span>
            </div>
          </div>
        </div>

        {/* EXIT BUTTON */}
        <button
          onClick={() => window.history.back()}
          style={s({
            position: 'absolute', top: '72px', left: '28px', zIndex: 10,
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.04)', color: '#7c6a9a',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px',
            padding: '7px 16px', cursor: 'pointer',
          })}
        >← Exit</button>

        {/* RESULT OVERLAY */}
        {gameState !== 'playing' && (
          <ResultScreen
            type={gameState}
            score={score}
            onRetry={handleRetry}
            onExit={() => window.history.back()}
          />
        )}
      </div>
    </>
  );
}