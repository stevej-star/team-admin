import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Avatar } from './TeamMembers';
import StatusBadge from '../components/StatusBadge';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const load = () =>
    fetch(`/api/members/${id}`)
      .then((r) => r.json())
      .then((m) => {
        setMember(m);
        setForm({ name: m.name, role: m.role, email: m.email, avatar_url: m.avatar_url, notes: m.notes });
      });

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    await fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setEditing(false);
    load();
  };

  const deleteMember = async () => {
    if (!confirm('Delete this team member?')) return;
    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    navigate('/team');
  };

  if (!member) return <div className="text-gray-500">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/team" className="text-sm text-gray-400 hover:text-gray-600">← Team</Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl border p-6 flex items-center gap-5">
        <Avatar name={editing ? form.name : member.name} url={editing ? form.avatar_url : member.avatar_url} size="lg" />
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input className="input block" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input block" placeholder="Role" value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <input className="input block" placeholder="Email" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input block" placeholder="Avatar URL" type="url" value={form.avatar_url || ''} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold">{member.name}</h1>
              {member.role && <div className="text-gray-500 text-sm">{member.role}</div>}
              {member.email && <div className="text-gray-400 text-sm mt-1">✉️ {member.email}</div>}
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          {editing ? (
            <>
              <button onClick={save} className="btn-primary text-sm">Save</button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
              <button onClick={deleteMember} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      <section className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-2">Notes</h2>
        {editing ? (
          <textarea
            className="input w-full"
            rows={4}
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        ) : (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {member.notes || <span className="italic text-gray-400">No notes.</span>}
          </p>
        )}
      </section>

      {/* Projects */}
      <section className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-3">Projects</h2>
        {member.projects?.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Not assigned to any projects.</p>
        ) : (
          <ul className="space-y-2">
            {member.projects?.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
