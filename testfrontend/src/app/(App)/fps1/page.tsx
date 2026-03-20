'use client';
import dynamic from 'next/dynamic';

const FPSBattle = dynamic(() => import('./FPSBattleClient'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed', inset: 0, background: '#04000a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
    }}>
      <div style={{
        width: '48px', height: '48px',
        border: '3px solid #44445a', borderTopColor: '#a855f7',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{
        fontFamily: 'monospace', fontSize: '0.7rem',
        letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9999bb',
      }}>
        Loading arena...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function FPSPage() {
  return <FPSBattle />;
}