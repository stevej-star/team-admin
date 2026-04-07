import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateStr(iso) {
  return iso ? iso.split('T')[0] : null;
}

export default function NotificationBell() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const today = todayStr();
      setTasks(
        data.filter(t => t.status !== 'done' && dateStr(t.due_date) && dateStr(t.due_date) <= today)
      );
    } catch (_) {}
  };

  useEffect(() => {
    load();
    const onVisibility = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const today = todayStr();
  const overdue = tasks.filter(t => dateStr(t.due_date) < today);
  const dueToday = tasks.filter(t => dateStr(t.due_date) === today);
  const count = tasks.length;

  const goToTasks = () => {
    navigate('/tasks');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        className={`sidebar-link w-full${open ? ' active' : ''}`}
      >
        <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10 2a6 6 0 00-6 6v2.586l-1.707 1.707A1 1 0 003 14h14a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6z"/>
            <path d="M10 18a2 2 0 01-2-2h4a2 2 0 01-2 2z"/>
          </svg>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </span>
        Alerts
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-full bottom-0 ml-3 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
            style={{ borderColor: 'var(--card-border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Task Reminders
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {count === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">No urgent tasks — you&apos;re all caught up!</p>
          ) : (
            <>
              <div className="overflow-y-auto max-h-80">
                {overdue.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wide px-4 pt-3 pb-1.5">
                      Overdue — {overdue.length}
                    </p>
                    {overdue.map(t => (
                      <TaskRow key={t.id} task={t} onClick={goToTasks} />
                    ))}
                  </div>
                )}
                {dueToday.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide px-4 pt-3 pb-1.5">
                      Due Today — {dueToday.length}
                    </p>
                    {dueToday.map(t => (
                      <TaskRow key={t.id} task={t} onClick={goToTasks} />
                    ))}
                  </div>
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100" style={{ borderColor: 'var(--card-border)' }}>
                <button
                  onClick={goToTasks}
                  className="text-xs font-medium w-full text-center py-1 rounded transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Go to My Tasks →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
    >
      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
        {task.title}
      </p>
      {task.project_name && (
        <p className="text-xs text-gray-400 truncate mt-0.5">{task.project_name}</p>
      )}
    </button>
  );
}
