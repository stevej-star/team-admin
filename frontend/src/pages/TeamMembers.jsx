import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', email: '', avatar_url: '', notes: '' });

  const load = () => fetch('/api/members').then((r) => r.json()).then(setMembers);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ name: '', role: '', email: '', avatar_url: '', notes: '' });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Team</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add Member</button>
      </div>

      {members.length === 0 && <p className="text-sm text-gray-500">No team members yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <Link
            key={m.id}
            to={`/team/${m.id}`}
            className="bg-white rounded-xl border p-5 hover:border-blue-400 transition-colors block"
          >
            <div className="flex items-center gap-3 mb-2">
              <Avatar name={m.name} url={m.avatar_url} />
              <div>
                <div className="font-semibold">{m.name}</div>
                {m.role && <div className="text-xs text-gray-500">{m.role}</div>}
              </div>
            </div>
            {m.email && <div className="text-xs text-gray-400">✉️ {m.email}</div>}
          </Link>
        ))}
      </div>

      {showModal && (
        <Modal title="Add Team Member" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <Field label="Name" required>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Role">
              <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Avatar URL">
              <input className="input" type="url" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function Avatar({ name, url, size = 'md' }) {
  const sz = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-base';
  if (url) {
    return <img src={url} alt={name} className={`${sz} rounded-full object-cover`} />;
  }
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div className={`${sz} rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}
