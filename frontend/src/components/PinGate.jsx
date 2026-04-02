import { useEffect, useRef, useState } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinGate({ children }) {
  const { teamPin, pinTimeout, unlockTeam, lockTeam, isTeamUnlocked } = useAppSettings();
  const [entry, setEntry] = useState('');
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(() => isTeamUnlocked());
  const lockTimerRef = useRef(null);

  // Inactivity lock timer (only active when unlocked)
  useEffect(() => {
    if (!teamPin || !unlocked) return;
    const schedule = () => {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => {
        lockTeam();
        setUnlocked(false);
      }, pinTimeout * 60 * 1000);
    };
    schedule();
    const reset = () => schedule();
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(lockTimerRef.current);
      events.forEach((e) => document.removeEventListener(e, reset));
    };
  }, [teamPin, unlocked, pinTimeout, lockTeam]);

  // Keyboard digit entry — must live before any early returns (Rules of Hooks)
  useEffect(() => {
    if (unlocked || !teamPin) return;
    const onKey = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        setEntry((prev) => prev.length < 4 ? prev + e.key : prev);
      }
      if (e.key === 'Backspace') setEntry((prev) => prev.slice(0, -1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [unlocked, teamPin]);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (!teamPin || entry.length !== 4) return;
    if (entry === teamPin) {
      unlockTeam();
      setUnlocked(true);
      setEntry('');
    } else {
      setShake(true);
      const t = setTimeout(() => { setShake(false); setEntry(''); }, 600);
      return () => clearTimeout(t);
    }
  }, [entry, teamPin, unlockTeam]);

  // ── Early returns (all hooks are above this line) ──────────
  if (!teamPin) return children;
  if (unlocked) return children;

  // ── Lock screen ────────────────────────────────────────────
  const handleDigit = (d) => {
    if (d === '⌫') { setEntry((e) => e.slice(0, -1)); return; }
    if (d === '' || entry.length >= 4) return;
    setEntry((e) => e + d);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="text-center">
        <div className="text-4xl mb-1">🔒</div>
        <h2 className="text-xl font-semibold">Team is locked</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your PIN to continue</p>
      </div>

      {/* 4-dot display */}
      <div className={`flex gap-4 ${shake ? 'animate-shake' : ''}`}>
        {[0,1,2,3].map((i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border-2 transition-colors"
            style={{
              borderColor: i < entry.length ? 'var(--accent)' : '#9ca3af',
              backgroundColor: i < entry.length ? 'var(--accent)' : 'transparent',
            }}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-56">
        {DIGITS.map((d, i) => (
          <button
            key={i}
            onClick={() => handleDigit(d)}
            disabled={d === ''}
            className={`h-14 rounded-xl text-lg font-semibold transition-all select-none ${
              d === ''
                ? 'invisible'
                : d === '⌫'
                ? 'bg-transparent text-gray-500 hover:text-gray-700 text-2xl'
                : 'bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 shadow-sm'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
