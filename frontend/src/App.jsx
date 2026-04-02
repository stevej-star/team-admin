import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppSettingsProvider, useAppSettings } from './context/AppSettingsContext';
import Sidebar from './components/Sidebar';
import PinGate from './components/PinGate';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TeamMembers from './pages/TeamMembers';
import MemberDetail from './pages/MemberDetail';
import Tasks from './pages/Tasks';
import ReleaseTAs from './pages/ReleaseTAs';
import ReleaseTADetail from './pages/ReleaseTADetail';
import Settings from './pages/Settings';

function AppShell() {
  const { onboardingComplete } = useAppSettings();

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="flex h-screen app-canvas">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/team" element={<PinGate><TeamMembers /></PinGate>} />
          <Route path="/team/:id" element={<PinGate><MemberDetail /></PinGate>} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/releases" element={<ReleaseTAs />} />
          <Route path="/releases/:id" element={<ReleaseTADetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppSettingsProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppSettingsProvider>
  );
}
