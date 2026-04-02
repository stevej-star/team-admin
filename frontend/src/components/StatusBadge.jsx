const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
