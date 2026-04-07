import { NavLink } from 'react-router-dom';
import { useAppSettings } from '../context/AppSettingsContext';
import NotificationBell from './NotificationBell';

const ALL_LINKS = [
  { to: '/dashboard', label: 'Dashboard',  icon: '🏠', feature: null },
  { to: '/tasks',     label: 'My Tasks',   icon: '✅', feature: 'tasks' },
  { to: '/projects',  label: 'Projects',   icon: '📁', feature: 'projects' },
  { to: '/team',      label: 'Team',       icon: '👥', feature: 'team' },
  { to: '/releases',  label: 'Release TA', icon: '🚀', feature: 'releases' },
  { to: '/notes',     label: 'Notes',      icon: '📝', feature: 'notes' },
];

export default function Sidebar() {
  const { appName, logoDataUrl, enabledFeatures, featureOrder } = useAppSettings();

  const dashboardLink = ALL_LINKS.find(l => l.feature === null);
  const orderedLinks = featureOrder
    .map(key => ALL_LINKS.find(l => l.feature === key))
    .filter(l => l && enabledFeatures.includes(l.feature));
  const links = [dashboardLink, ...orderedLinks];

  return (
    <aside className={`${logoDataUrl ? 'w-64' : 'w-56'} flex flex-col shrink-0 sidebar`}>
      <div className="px-4 py-4 border-b sidebar-divider flex items-center gap-3">
        {logoDataUrl && (
          <img
            src={logoDataUrl}
            alt="logo"
            className="w-8 h-8 rounded object-contain shrink-0"
          />
        )}
        <h1 className="text-lg font-bold tracking-wide">{appName}</h1>
      </div>
      <nav className="flex-1 py-4">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t sidebar-divider py-2">
        {enabledFeatures.includes('tasks') && <NotificationBell />}
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <span>⚙️</span>
          Settings
        </NavLink>
      </div>
    </aside>
  );
}

