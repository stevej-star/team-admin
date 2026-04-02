import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const STATUSES = ['active', 'on_hold', 'completed'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'active', notes: '' });

  const load = () => fetch('/api/projects').then((r) => r.json()).then(setProjects);
  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ name: '', description: '', status: 'active', notes: '' });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + New Project
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={filter === s ? { backgroundColor: 'var(--accent)', color: 'white' } : {}}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? '' : 'bg-white border hover:bg-gray-50 text-gray-600'
            }`}
          >
            {s === 'all' ? 'All' : s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-500">No projects found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="bg-white rounded-xl border p-5 hover:border-blue-400 transition-colors block"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold">{p.name}</h2>
              <StatusBadge status={p.status} />
            </div>
            {p.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>👥 {p.member_count} engineer{p.member_count !== 1 ? 's' : ''}</span>
              {p.links?.length > 0 && <span>🔗 {p.links.length} link{p.links.length !== 1 ? 's' : ''}</span>}
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <Field label="Name" required>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Description">
              <textarea
                className="input"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">Create</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}
