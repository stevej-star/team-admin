import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const AppSettingsContext = createContext(null);

const ALL_FEATURES = ['tasks', 'projects', 'team', 'releases', 'notes'];

export function AppSettingsProvider({ children }) {
  const [appName, setAppName] = useState(
    () => localStorage.getItem('appName') || 'Team Manager'
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem('appTheme') || 'default'
  );

  const [teamPin, setTeamPin] = useState(
    () => localStorage.getItem('teamPin') || null
  );

  const [pinTimeout, setPinTimeout] = useState(
    () => parseInt(localStorage.getItem('pinTimeout') || '1', 10)
  );

  const [logoDataUrl, setLogoDataUrl] = useState(
    () => localStorage.getItem('appLogo') || null
  );

  const [onboardingComplete, setOnboardingComplete] = useState(
    () => localStorage.getItem('onboardingComplete') === 'true'
  );

  const [enabledFeatures, setEnabledFeatures] = useState(
    () => JSON.parse(localStorage.getItem('enabledFeatures') || 'null') || ALL_FEATURES
  );

  const [userProfile, setUserProfile] = useState(
    () => JSON.parse(localStorage.getItem('userProfile') || 'null') || { name: '', role: '' }
  );

  // In-memory only — clears on page refresh intentionally
  const [teamUnlockedAt, setTeamUnlockedAt] = useState(null);

  useEffect(() => {
    document.title = appName;
  }, [appName]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (logoDataUrl) {
      link.href = logoDataUrl;
    } else {
      link.href = '/favicon.ico';
    }
  }, [logoDataUrl]);

  const updateAppName = (name) => {
    const trimmed = name.trim() || 'Team Manager';
    localStorage.setItem('appName', trimmed);
    setAppName(trimmed);
  };

  const updateTheme = (newTheme) => {
    localStorage.setItem('appTheme', newTheme);
    setTheme(newTheme);
  };

  const saveLogo = (dataUrl) => {
    localStorage.setItem('appLogo', dataUrl);
    setLogoDataUrl(dataUrl);
  };

  const removeLogo = () => {
    localStorage.removeItem('appLogo');
    setLogoDataUrl(null);
  };

  const saveTeamPin = (pin) => {
    localStorage.setItem('teamPin', pin);
    setTeamPin(pin);
    setTeamUnlockedAt(null);
  };

  const removeTeamPin = () => {
    localStorage.removeItem('teamPin');
    setTeamPin(null);
    setTeamUnlockedAt(null);
  };

  const savePinTimeout = (minutes) => {
    localStorage.setItem('pinTimeout', String(minutes));
    setPinTimeout(minutes);
  };

  const unlockTeam = useCallback(() => {
    setTeamUnlockedAt(Date.now());
  }, []);

  const lockTeam = useCallback(() => {
    setTeamUnlockedAt(null);
  }, []);

  const isTeamUnlocked = useCallback(() => {
    if (!teamPin) return true;
    if (teamUnlockedAt === null) return false;
    return Date.now() - teamUnlockedAt < pinTimeout * 60 * 1000;
  }, [teamPin, teamUnlockedAt, pinTimeout]);

  // Refresh unlock timestamp on any user activity (so timeout is from last action)
  const activityRef = useRef(null);
  useEffect(() => {
    if (!teamPin || teamUnlockedAt === null) return;
    const refresh = () => setTeamUnlockedAt(Date.now());
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => document.addEventListener(e, refresh, { passive: true }));
    activityRef.current = refresh;
    return () => events.forEach((e) => document.removeEventListener(e, activityRef.current));
  }, [teamPin, teamUnlockedAt]);

  const updateEnabledFeatures = (features) => {
    localStorage.setItem('enabledFeatures', JSON.stringify(features));
    setEnabledFeatures(features);
  };

  const updateUserProfile = (profile) => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setUserProfile(profile);
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setOnboardingComplete(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    setOnboardingComplete(false);
  };

  return (
    <AppSettingsContext.Provider
      value={{
        appName, updateAppName,
        theme, updateTheme,
        logoDataUrl, saveLogo, removeLogo,
        teamPin, saveTeamPin, removeTeamPin,
        pinTimeout, savePinTimeout,
        unlockTeam, lockTeam, isTeamUnlocked,
        onboardingComplete, completeOnboarding, resetOnboarding,
        enabledFeatures, updateEnabledFeatures,
        userProfile, updateUserProfile,
        ALL_FEATURES,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
