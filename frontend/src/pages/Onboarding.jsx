import { useState, useRef } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

const FEATURE_OPTIONS = [
  {
    key: 'tasks',
    icon: '✅',
    label: 'My Tasks',
    description: 'Track personal tasks with due dates and priorities.',
  },
  {
    key: 'projects',
    icon: '📁',
    label: 'Projects',
    description: 'Manage projects, milestones and linked resources.',
  },
  {
    key: 'team',
    icon: '👥',
    label: 'Team Management',
    description: 'View and manage team members, roles and profiles.',
  },
  {
    key: 'releases',
    icon: '🚀',
    label: 'Release TA',
    description: 'Structured release technical approval workflow.',
  },
  {
    key: 'notes',
    icon: '📝',
    label: 'Notes',
    description: 'Markdown notes with folders, tags and categories.',
  },
];

const STEPS = ['Welcome', 'Your Profile', 'Branding', 'Features'];

export default function Onboarding() {
  const {
    updateAppName, saveLogo, updateUserProfile,
    updateEnabledFeatures, completeOnboarding,
    appName, logoDataUrl, userProfile,
  } = useAppSettings();

  const [step, setStep] = useState(0);

  // Profile
  const [name, setName]       = useState(userProfile.name || '');
  const [role, setRole]       = useState(userProfile.role || '');

  // Branding
  const [nameInput, setNameInput]   = useState(appName === 'Team Manager' ? '' : appName);
  const [logoPreview, setLogoPreview] = useState(logoDataUrl);

  // Features
  const [features, setFeatures] = useState(
    FEATURE_OPTIONS.map((f) => f.key)
  );

  const logoInputRef = useRef(null);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      setLogoPreview(canvas.toDataURL('image/png'));
    };
    img.src = url;
  };

  const toggleFeature = (key) => {
    setFeatures((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFinish = async () => {
    // Save branding
    const finalName = nameInput.trim() || 'Team Manager';
    updateAppName(finalName);
    if (logoPreview) saveLogo(logoPreview);

    // Save profile
    const profile = { name: name.trim(), role: role.trim() };
    updateUserProfile(profile);

    // Save features (always at least one)
    const finalFeatures = features.length ? features : FEATURE_OPTIONS.map((f) => f.key);
    updateEnabledFeatures(finalFeatures);

    // Auto-create team member if team feature enabled and name provided
    if (finalFeatures.includes('team') && profile.name) {
      try {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: profile.name, role: profile.role || 'Team Member' }),
        });
      } catch (_) {
        // Non-fatal — team member can be added manually
      }
    }

    completeOnboarding();
  };

  const canAdvance = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen app-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < step
                      ? 'text-white border-transparent'
                      : i === step
                      ? 'border-transparent text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  style={i <= step ? { backgroundColor: 'var(--accent)' } : {}}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap ${i === step ? 'font-semibold' : 'text-gray-400'}`}
                  style={i === step ? { color: 'var(--accent)' } : {}}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mt-[-14px]"
                  style={{ backgroundColor: i < step ? 'var(--accent)' : '#e5e7eb' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
          style={{ backgroundColor: 'var(--card-bg)' }}>

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">👋</div>
              <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
              <p className="text-gray-500 mb-6">
                Let's take a minute to set things up. You'll tell us a bit about yourself,
                name the app, and choose which features you want to use.
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Everything is stored locally — nothing leaves your machine.
              </p>
              <button
                onClick={() => setStep(1)}
                className="btn-primary px-8 py-2.5 text-base"
              >
                Get started →
              </button>
            </div>
          )}

          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold mb-1">Your profile</h2>
              <p className="text-sm text-gray-500 mb-6">
                This will be used to identify you in the app. If you enable Team Management, you'll be added to the team automatically.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--accent-ring)' }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job title / role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Engineer"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--accent-ring)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Branding ── */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-bold mb-1">Branding</h2>
              <p className="text-sm text-gray-500 mb-6">
                Give the app a name your team will recognise. You can also add a logo.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">App name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Team Manager"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--accent-ring)' }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50">
                        <img src={logoPreview} alt="logo preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setLogoPreview(null)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none"
                        >×</button>
                      </div>
                    ) : (
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center cursor-pointer text-2xl transition-colors shrink-0"
                      >
                        🖼️
                      </div>
                    )}
                    <div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="btn-secondary text-sm px-3 py-2"
                      >
                        {logoPreview ? 'Change logo' : 'Upload logo'}
                      </button>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG — resized to 128px</p>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Features ── */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-bold mb-1">Choose your features</h2>
              <p className="text-sm text-gray-500 mb-6">
                Select the modules you want to use. You can change these later in Settings.
              </p>
              <div className="space-y-3">
                {FEATURE_OPTIONS.map(({ key, icon, label, description }) => {
                  const enabled = features.includes(key);
                  return (
                    <label
                      key={key}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        enabled ? 'border-transparent' : 'border-gray-200'
                      }`}
                      style={enabled ? { borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)' } : {}}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 shrink-0 w-4 h-4 accent-current"
                        checked={enabled}
                        onChange={() => toggleFeature(key)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <span className="font-semibold text-sm">{label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {features.length === 0 && (
                <p className="text-xs text-amber-500 mt-3">Pick at least one feature to continue.</p>
              )}
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-secondary text-sm px-4 py-2">
                ← Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="btn-primary text-sm px-6 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={features.length === 0}
                className="btn-primary text-sm px-6 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Let's go 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
