import { useState } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

const themes = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic blue & gray',
    sidebar: '#111827',
    canvas: '#f9fafb',
    accent: '#2563eb',
  },
  {
    id: 'modern',
    name: 'Modern Sleek',
    description: 'Deep navy, indigo accents',
    sidebar: '#1e1b4b',
    canvas: '#f8fafc',
    accent: '#7c3aed',
  },
  {
    id: 'techy',
    name: 'Techy',
    description: 'Dark mode, cyan accents',
    sidebar: '#020617',
    canvas: '#0f172a',
    accent: '#06b6d4',
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    description: 'Clean black & white',
    sidebar: '#18181b',
    canvas: '#ffffff',
    accent: '#18181b',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm amber tones',
    sidebar: '#7c2d12',
    canvas: '#fffbf7',
    accent: '#ea580c',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Earthy greens',
    sidebar: '#14532d',
    canvas: '#f7fdf9',
    accent: '#16a34a',
  },
  {
    id: 'notepad',
    name: 'Notepad',
    description: 'Lined paper, handwritten',
    sidebar: '#4a3728',
    canvas: '#fefce8',
    accent: '#1d4ed8',
  },
];

const TIMEOUT_OPTIONS = [
  { value: 1,  label: '1 minute' },
  { value: 2,  label: '2 minutes' },
  { value: 5,  label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
];

// Controlled 4-digit PIN input displayed as dots
function PinInput({ value, onChange, placeholder = 'Enter PIN' }) {
  return (
    <div className="flex gap-3 items-center">
      {[0,1,2,3].map((i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full border-2 transition-colors"
          style={{
            borderColor: i < value.length ? 'var(--accent)' : undefined,
            backgroundColor: i < value.length ? 'var(--accent)' : undefined,
          }}
        />
      ))}
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder={placeholder}
        className="sr-only"
        autoFocus
      />
    </div>
  );
}

function TeamPrivacySection() {
  const { teamPin, saveTeamPin, removeTeamPin, pinTimeout, savePinTimeout, lockTeam } = useAppSettings();

  const [mode, setMode] = useState('idle'); // idle | set | verify | change | confirm | remove
  const [step1, setStep1] = useState('');
  const [step2, setStep2] = useState('');
  const [error, setError] = useState('');
  const [currentEntry, setCurrentEntry] = useState('');

  const resetFlow = () => { setMode('idle'); setStep1(''); setStep2(''); setError(''); setCurrentEntry(''); };

  const handleVerifyCurrent = () => {
    if (currentEntry !== teamPin) { setError('Incorrect PIN'); setCurrentEntry(''); return; }
    setCurrentEntry('');
    setError('');
    setMode(mode === 'verify' ? 'change' : 'remove');
  };

  const handleSetPin = () => {
    if (step1.length < 4) { setError('PIN must be 4 digits'); return; }
    setMode('confirm');
    setError('');
  };

  const handleConfirm = () => {
    if (step2 !== step1) { setError('PINs do not match'); setStep2(''); return; }
    saveTeamPin(step1);
    resetFlow();
  };

  const handleRemove = () => {
    removeTeamPin();
    resetFlow();
  };

  if (!teamPin) {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-4">
          No PIN set. The Team tab is currently visible to anyone.
        </p>
        {mode === 'idle' && (
          <button className="btn-primary" onClick={() => setMode('set')}>Set a PIN</button>
        )}
        {mode === 'set' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Choose a 4-digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={step1}
                autoFocus
                onChange={(e) => { setStep1(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                className="input w-32 tracking-widest text-center text-lg"
                placeholder="••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button className="btn-primary" onClick={handleSetPin} disabled={step1.length < 4}>Next</button>
              <button className="btn-secondary" onClick={resetFlow}>Cancel</button>
            </div>
          </div>
        )}
        {mode === 'confirm' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Confirm your PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={step2}
                autoFocus
                onChange={(e) => { setStep2(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                className="input w-32 tracking-widest text-center text-lg"
                placeholder="••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button className="btn-primary" onClick={handleConfirm} disabled={step2.length < 4}>Save PIN</button>
              <button className="btn-secondary" onClick={resetFlow}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PIN is set
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-medium">🔒 PIN is active</span>
      </div>

      {/* Timeout */}
      <div>
        <label className="block text-sm font-medium mb-1">Lock after inactivity</label>
        <select
          value={pinTimeout}
          onChange={(e) => savePinTimeout(Number(e.target.value))}
          className="input w-48"
        >
          {TIMEOUT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {mode === 'idle' && (
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => { setMode('verify'); setError(''); }}>Change PIN</button>
          <button className="btn-secondary text-red-600" onClick={() => { setMode('remove'); setError(''); }}>Remove PIN</button>
          <button className="btn-secondary" onClick={() => { lockTeam(); }}>Lock now</button>
        </div>
      )}

      {/* Step 0 of change: verify current PIN */}
      {mode === 'verify' && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter your current PIN</label>
            <input
              type="password" inputMode="numeric" maxLength={4} value={currentEntry} autoFocus
              onChange={(e) => { setCurrentEntry(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              className="input w-32 tracking-widest text-center text-lg" placeholder="••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleVerifyCurrent} disabled={currentEntry.length < 4}>Next</button>
            <button className="btn-secondary" onClick={resetFlow}>Cancel</button>
          </div>
        </div>
      )}

      {mode === 'change' && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-sm font-medium mb-2">New PIN</label>
            <input
              type="password" inputMode="numeric" maxLength={4} value={step1} autoFocus
              onChange={(e) => { setStep1(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              className="input w-32 tracking-widest text-center text-lg" placeholder="••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleSetPin} disabled={step1.length < 4}>Next</button>
            <button className="btn-secondary" onClick={resetFlow}>Cancel</button>
          </div>
        </div>
      )}

      {mode === 'confirm' && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Confirm new PIN</label>
            <input
              type="password" inputMode="numeric" maxLength={4} value={step2} autoFocus
              onChange={(e) => { setStep2(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              className="input w-32 tracking-widest text-center text-lg" placeholder="••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleConfirm} disabled={step2.length < 4}>Save PIN</button>
            <button className="btn-secondary" onClick={resetFlow}>Cancel</button>
          </div>
        </div>
      )}

      {mode === 'remove' && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter current PIN to confirm removal</label>
            <input
              type="password" inputMode="numeric" maxLength={4} value={currentEntry} autoFocus
              onChange={(e) => { setCurrentEntry(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              className="input w-32 tracking-widest text-center text-lg" placeholder="••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button className="btn-primary bg-red-600 hover:bg-red-700" onClick={() => {
              if (currentEntry !== teamPin) { setError('Incorrect PIN'); setCurrentEntry(''); return; }
              handleRemove();
            }} disabled={currentEntry.length < 4}>Remove PIN</button>
            <button className="btn-secondary" onClick={resetFlow}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const {
    appName, updateAppName, theme, updateTheme, logoDataUrl, saveLogo, removeLogo,
    userProfile, updateUserProfile, enabledFeatures, updateEnabledFeatures,
    resetOnboarding, ALL_FEATURES,
  } = useAppSettings();
  const [draft, setDraft] = useState(appName);
  const [saved, setSaved] = useState(false);
  const [logoError, setLogoError] = useState('');

  // Profile
  const [profileName, setProfileName] = useState(userProfile.name || '');
  const [profileRole, setProfileRole] = useState(userProfile.role || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateAppName(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile({ name: profileName.trim(), role: profileRole.trim() });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const toggleFeature = (key) => {
    const next = enabledFeatures.includes(key)
      ? enabledFeatures.filter((k) => k !== key)
      : [...enabledFeatures, key];
    if (next.length > 0) updateEnabledFeatures(next);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setLogoError('Please select an image file.'); return; }
    setLogoError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 128;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/png');
        try {
          saveLogo(dataUrl);
        } catch {
          setLogoError('Image too large for storage. Please use a smaller file.');
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      {/* Profile */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-semibold mb-1">Your profile</h3>
        <p className="text-sm text-gray-500 mb-4">Your name and role shown within the app.</p>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => { setProfileName(e.target.value); setProfileSaved(false); }}
              placeholder="e.g. Jane Smith"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job title / role</label>
            <input
              type="text"
              value={profileRole}
              onChange={(e) => { setProfileRole(e.target.value); setProfileSaved(false); }}
              placeholder="e.g. Senior Engineer"
              className="input"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save</button>
            {profileSaved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
          </div>
        </form>
      </div>

      {/* General */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-semibold mb-4">General</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">App name</label>
            <input
              type="text"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
              placeholder="e.g. Blue Team"
              className="input"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save</button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
          </div>
        </form>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-semibold mb-1">Logo</h3>
        <p className="text-sm text-gray-500 mb-4">Displayed next to the app name in the sidebar.</p>
        <div className="flex items-center gap-4">
          {logoDataUrl ? (
            <>
              <img src={logoDataUrl} alt="logo preview" className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-gray-50 p-1" />
              <div className="space-y-2">
                <label className="btn-secondary cursor-pointer inline-block">
                  Replace
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <button onClick={removeLogo} className="block text-sm text-red-500 hover:text-red-700">
                  Remove logo
                </button>
              </div>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <span className="text-2xl mb-1">🖼️</span>
              <span className="text-xs text-gray-500">Upload logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          )}
        </div>
        {logoError && <p className="text-sm text-red-500 mt-2">{logoError}</p>}
      </div>

      {/* Theme */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-semibold mb-1">Theme</h3>
        <p className="text-sm text-gray-500 mb-4">Choose a colour scheme for the app.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updateTheme(t.id)}
              style={theme === t.id ? { borderColor: t.accent } : {}}
              className={`text-left rounded-lg border-2 p-3 transition-all ${
                theme === t.id ? '' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex rounded overflow-hidden mb-2" style={{ height: 48 }}>
                <div style={{ backgroundColor: t.sidebar, width: '32%' }} />
                <div
                  style={{
                    backgroundColor: t.canvas,
                    flex: 1,
                    padding: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <div style={{ backgroundColor: t.accent, height: 5, borderRadius: 3, width: '55%' }} />
                  <div style={{ backgroundColor: '#d1d5db', height: 4, borderRadius: 3, width: '80%' }} />
                  <div style={{ backgroundColor: '#d1d5db', height: 4, borderRadius: 3, width: '65%' }} />
                </div>
              </div>
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-semibold mb-1">Features</h3>
        <p className="text-sm text-gray-500 mb-4">Toggle which modules appear in the sidebar. At least one must be enabled.</p>
        <div className="space-y-3">
          {[
            { key: 'tasks',    icon: '✅', label: 'My Tasks',          description: 'Personal task tracking with due dates.' },
            { key: 'projects', icon: '📁', label: 'Projects',          description: 'Projects, milestones and linked resources.' },
            { key: 'team',     icon: '👥', label: 'Team Management',   description: 'Team member profiles and roles.' },
            { key: 'releases', icon: '🚀', label: 'Release TA',        description: 'Release technical approval workflow.' },
            { key: 'notes',    icon: '📝', label: 'Notes',             description: 'Markdown notes with folders and tags.' },
          ].map(({ key, icon, label, description }) => {
            const enabled = enabledFeatures.includes(key);
            return (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleFeature(key)}
                  disabled={enabled && enabledFeatures.length === 1}
                  className="mt-0.5"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div>
                  <span className="text-sm font-medium">{icon} {label}</span>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Team Privacy */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-semibold mb-1">Team privacy</h3>
        <p className="text-sm text-gray-500 mb-4">
          Require a PIN to view the Team tab. The lock re-activates after a period of inactivity.
        </p>
        <TeamPrivacySection />
      </div>

      {/* Setup */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold mb-1">Setup wizard</h3>
        <p className="text-sm text-gray-500 mb-4">Re-run the first-time setup to change your profile, branding and features from scratch.</p>
        <button
          onClick={resetOnboarding}
          className="btn-secondary text-sm"
        >
          🔄 Redo setup
        </button>
      </div>
    </div>
  );
}

