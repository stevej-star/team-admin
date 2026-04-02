import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import DueDateChip from '../components/DueDateChip';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/members').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
    ]).then(([p, m, t]) => {
      setProjects(p);
      setMembers(m);
      setTasks(t);
    });
  }, []);

  const active = projects.filter((p) => p.status === 'active');
  const openTasks = tasks.filter((t) => t.status !== 'done');
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Active Projects" value={active.length} to="/projects" />
        <SummaryCard label="Team Members" value={members.length} to="/team" />
        <SummaryCard label="Open Tasks" value={openTasks.length} to="/tasks" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent projects */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent Projects</h2>
          {active.length === 0 && (
            <p className="text-sm text-gray-500">No active projects.</p>
          )}
          <ul className="space-y-2">
            {active.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-400 transition-colors"
                >
                  <span className="font-medium text-sm">{p.name}</span>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/projects" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View all projects →
          </Link>
        </section>

        {/* Open + overdue tasks */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Open Tasks</h2>
          {openTasks.length === 0 && (
            <p className="text-sm text-gray-500">No open tasks.</p>
          )}
          <ul className="space-y-2">
            {openTasks.slice(0, 5).map((t) => (
              <li
                key={t.id}
                className={`p-3 bg-white rounded-lg border text-sm ${
                  overdue.find((o) => o.id === t.id) ? 'border-red-300' : ''
                }`}
              >
                <div className="font-medium">{t.title}</div>
                {t.project_name && (
                  <div className="text-gray-500 text-xs mt-0.5">📁 {t.project_name}</div>
                )}
                {t.due_date && (
                  <div className="mt-1">
                    <DueDateChip dueDate={t.due_date} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Link to="/tasks" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View all tasks →
          </Link>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, to }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl border p-5 flex flex-col gap-1 hover:border-blue-400 transition-colors"
    >
      <span className="text-3xl font-bold text-blue-600">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </Link>
  );
}
