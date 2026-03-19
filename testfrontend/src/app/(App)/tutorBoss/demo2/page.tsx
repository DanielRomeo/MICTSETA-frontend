
import dynamic from 'next/dynamic';

// R3F uses WebGL — it cannot run on the server.
// dynamic + ssr:false tells Next.js to only load it in the browser.
const BattleDemo2 = dynamic(
  () => import('./BattleDemo2Client'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid #44445a',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{
          fontFamily: 'monospace', fontSize: '0.7rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#9999bb',
        }}>
          Summoning dragon...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export default function BattleDemo2Page() {
  return <BattleDemo2 />;
}
