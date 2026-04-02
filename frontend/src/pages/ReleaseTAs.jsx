import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  pending:  'bg-yellow-100 text-yellow-700',
};

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function ReleaseTAs() {
  const [releases, setReleases] = useState([]);
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ release_name: '', release_date: todayStr() });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/release-tas').then((r) => r.json()).then(setReleases);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/release-tas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const created = await res.json();
    setShowModal(false);
    setForm({ release_name: '', release_date: todayStr() });
    navigate(`/releases/${created.id}`);
  };

  const visible = filter === 'all' ? releases : releases.filter((r) => r.status === filter);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Release TA</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ New Review</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={filter === s ? { backgroundColor: 'var(--accent)', color: 'white' } : {}}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === s ? '' : 'bg-white border hover:bg-gray-50 text-gray-600'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-gray-500">No release reviews yet.</p>
      )}

      <div className="space-y-3">
        {visible.map((r) => (
          <Link
            key={r.id}
            to={`/releases/${r.id}`}
            className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 hover:border-[color:var(--accent)] transition-colors group"
          >
            <div>
              <div className="font-semibold group-hover:underline">{r.release_name}</div>
              {r.release_date && (
                <div className="text-sm text-gray-500 mt-0.5">
                  {new Date(r.release_date).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </div>
              )}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 ${STATUS_STYLES[r.status]}`}>
              {r.status}
            </span>
          </Link>
        ))}
      </div>

      {showModal && (
        <Modal title="New Release Review" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Release name</label>
              <input
                required
                className="input"
                placeholder="e.g. v2.45.0"
                value={form.release_name}
                onChange={(e) => setForm({ ...form, release_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Release date</label>
              <input
                type="date"
                className="input"
                value={form.release_date}
                onChange={(e) => setForm({ ...form, release_date: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create &amp; Open</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
