import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import DueDateChip from '../components/DueDateChip';

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', color: 'bg-gray-100' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50' },
  { key: 'done', label: 'Done', color: 'bg-green-50' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', project_id: '', due_date: '' });

  const load = () =>
    Promise.all([
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ]).then(([t, p]) => {
      setTasks(t);
      setProjects(p);
    });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', status: 'todo', project_id: '', due_date: '' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      project_id: task.project_id || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, project_id: form.project_id || null, due_date: form.due_date || null };
    if (editTask) {
      await fetch(`/api/tasks/${editTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    load();
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    load();
  };

  const updateStatus = async (task, status) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status }),
    });
    load();
  };

  const filtered = filterProject
    ? tasks.filter((t) => t.project_id === filterProject)
    : tasks;

  const today = new Date();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + New Task
        </button>
      </div>

      {/* Project filter */}
      <div className="mb-5 flex items-center gap-2">
        <label className="text-sm text-gray-500">Filter by project:</label>
        <select
          className="input w-auto text-sm"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4">
        {STATUS_COLS.map(({ key, label, color }) => {
          const col = filtered.filter((t) => t.status === key);
          return (
            <div key={key} className={`${color} rounded-xl p-4 min-h-[200px]`}>
              <h2 className="font-semibold text-sm mb-3 text-gray-600 uppercase tracking-wide">
                {label} <span className="font-normal text-gray-400">({col.length})</span>
              </h2>
              <div className="space-y-2">
                {col.map((t) => {
                  const isOverdue = t.due_date && new Date(t.due_date) < today && t.status !== 'done';
                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-lg border p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className={`text-sm font-medium ${key === 'done' ? 'line-through text-gray-400' : ''}`}>
                          {t.title}
                        </span>
                        <button
                          onClick={() => openEdit(t)}
                          className="text-gray-400 hover:text-gray-700 text-xs shrink-0"
                          title="Edit"
                        >
                          ✎
                        </button>
                      </div>
                      {t.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.description}</p>
                      )}
                      {t.project_name && (
                        <div className="text-xs text-gray-400 mt-1">📁 {t.project_name}</div>
                      )}
                      {t.due_date && (
                        <div className="mt-1.5">
                          <DueDateChip dueDate={t.due_date} isDone={key === 'done'} />
                        </div>
                      )}
                      {/* Move buttons */}
                      <div className="flex gap-1 mt-2">
                        {STATUS_COLS.filter((c) => c.key !== key).map((c) => (
                          <button
                            key={c.key}
                            onClick={() => updateStatus(t, c.key)}
                            className="text-xs text-gray-400 hover:text-blue-600 border rounded px-1.5 py-0.5 hover:border-blue-400 transition-colors"
                          >
                            → {c.label}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="ml-auto text-xs text-gray-300 hover:text-red-500"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editTask ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="input"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select className="input" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                className="input"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editTask ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
