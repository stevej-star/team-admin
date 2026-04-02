import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import LinkBadge from '../components/LinkBadge';
import Modal from '../components/Modal';
import { useAppSettings } from '../context/AppSettingsContext';

const LINK_PRESETS = ['Jira', 'Confluence', 'Atlas', 'Slack'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enabledFeatures } = useAppSettings();
  const teamEnabled = enabledFeatures.includes('team');
  const [project, setProject] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ label: 'Jira', url: '' });
  const [showMemberModal, setShowMemberModal] = useState(false);

  const load = () =>
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch('/api/members').then((r) => r.json()),
    ]).then(([p, m]) => {
      setProject(p);
      setForm({ name: p.name, description: p.description, status: p.status, notes: p.notes });
      setAllMembers(m);
    });

  useEffect(() => { load(); }, [id]);

  const saveProject = async () => {
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setEditing(false);
    load();
  };

  const deleteProject = async () => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    navigate('/projects');
  };

  const addLink = async (e) => {
    e.preventDefault();
    await fetch(`/api/projects/${id}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkForm),
    });
    setShowLinkModal(false);
    setLinkForm({ label: 'Jira', url: '' });
    load();
  };

  const removeLink = async (linkId) => {
    await fetch(`/api/projects/${id}/links/${linkId}`, { method: 'DELETE' });
    load();
  };

  const addMember = async (memberId) => {
    await fetch(`/api/projects/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId }),
    });
    setShowMemberModal(false);
    load();
  };

  const removeMember = async (memberId) => {
    await fetch(`/api/projects/${id}/members/${memberId}`, { method: 'DELETE' });
    load();
  };

  const updateTaskStatus = async (taskId, status) => {
    const task = project.tasks.find((t) => t.id === taskId);
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status }),
    });
    load();
  };

  if (!project) return <div className="text-gray-500">Loading…</div>;

  const unassigned = allMembers.filter((m) => !project.members.find((pm) => pm.id === m.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/projects" className="text-sm text-gray-400 hover:text-gray-600">← Projects</Link>
          {editing ? (
            <input
              className="input text-2xl font-bold mt-1 block"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          ) : (
            <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={saveProject} className="btn-primary text-sm">Save</button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
              <button onClick={deleteProject} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      {editing ? (
        <select
          className="input w-40"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      ) : (
        <StatusBadge status={project.status} />
      )}

      {/* Description */}
      <section className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-2">Description</h2>
        {editing ? (
          <textarea
            className="input w-full"
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        ) : (
          <p className="text-sm text-gray-600">{project.description || <span className="italic text-gray-400">No description.</span>}</p>
        )}
      </section>

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
            {project.notes || <span className="italic text-gray-400">No notes yet.</span>}
          </p>
        )}
      </section>

      {/* Links */}
      <section className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">External Links</h2>
          <button onClick={() => setShowLinkModal(true)} className="text-xs btn-secondary">
            + Add Link
          </button>
        </div>
        {project.links.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No links added.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.links.map((l) => (
              <div key={l.id} className="flex items-center gap-1">
                <LinkBadge label={l.label} url={l.url} />
                <button
                  onClick={() => removeLink(l.id)}
                  className="text-gray-400 hover:text-red-500 text-xs"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Team */}
      {teamEnabled && (
      <section className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Team</h2>
          <button onClick={() => setShowMemberModal(true)} className="text-xs btn-secondary">
            + Assign
          </button>
        </div>
        {project.members.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No engineers assigned.</p>
        ) : (
          <ul className="space-y-2">
            {project.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <Link to={`/team/${m.id}`} className="font-medium hover:text-blue-600">
                  {m.name}
                  {m.role && <span className="text-gray-400 font-normal ml-2">· {m.role}</span>}
                </Link>
                <button
                  onClick={() => removeMember(m.id)}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {/* Tasks */}
      <section className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-3">Related Tasks</h2>
        {project.tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No tasks linked to this project.</p>
        ) : (
          <ul className="space-y-2">
            {project.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span className={t.status === 'done' ? 'line-through text-gray-400' : ''}>{t.title}</span>
                <select
                  value={t.status}
                  onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modals */}
      {showLinkModal && (
        <Modal title="Add External Link" onClose={() => setShowLinkModal(false)}>
          <form onSubmit={addLink} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <div className="flex gap-2 mb-1">
                {LINK_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setLinkForm({ ...linkForm, label: p })}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      linkForm.label === p ? 'text-white' : 'hover:bg-gray-50'
                    }`}
                    style={linkForm.label === p ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setLinkForm({ ...linkForm, label: '' })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    !LINK_PRESETS.includes(linkForm.label) ? 'text-white' : 'hover:bg-gray-50'
                  }`}
                  style={!LINK_PRESETS.includes(linkForm.label) ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                >
                  Custom
                </button>
              </div>
              {!LINK_PRESETS.includes(linkForm.label) && (
                <input
                  className="input"
                  placeholder="Label"
                  value={linkForm.label}
                  onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                className="input"
                type="url"
                placeholder="https://…"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                required
              />
              {linkForm.label === 'Slack' && (
                <p className="text-xs text-gray-400 mt-1">
                  💡 For direct channel navigation, use the{' '}
                  <code className="bg-gray-100 px-1 rounded">app.slack.com/client/TEAM_ID/CHANNEL_ID</code>{' '}
                  URL format — open Slack in your browser to get this.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowLinkModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Link</button>
            </div>
          </form>
        </Modal>
      )}

      {teamEnabled && showMemberModal && (
        <Modal title="Assign Engineer" onClose={() => setShowMemberModal(false)}>
          {unassigned.length === 0 ? (
            <p className="text-sm text-gray-500">All team members are already assigned.</p>
          ) : (
            <ul className="space-y-1">
              {unassigned.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => addMember(m.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium">{m.name}</span>
                    {m.role && <span className="text-gray-400 ml-2">· {m.role}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}
