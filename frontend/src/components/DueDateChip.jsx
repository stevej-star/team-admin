export default function DueDateChip({ dueDate, isDone = false }) {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const now = new Date();

  // Normalise to midnight for day-level comparisons
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const daysUntil = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

  let icon, label, chipClass;

  if (isDone) {
    icon = '📅';
    label = due.toLocaleDateString();
    chipClass = 'bg-gray-100 text-gray-400 line-through';
  } else if (daysUntil < 0) {
    icon = '⚠️';
    label = `Overdue · ${due.toLocaleDateString()}`;
    chipClass = 'bg-red-100 text-red-700';
  } else if (daysUntil === 0) {
    icon = '🔥';
    label = 'Due today';
    chipClass = 'bg-amber-100 text-amber-700';
  } else if (daysUntil <= 3) {
    icon = '⏰';
    label = `Due in ${daysUntil}d`;
    chipClass = 'bg-yellow-100 text-yellow-700';
  } else {
    icon = '📅';
    label = due.toLocaleDateString();
    chipClass = 'bg-gray-100 text-gray-500';
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${chipClass}`}>
      <span>{icon}</span>
      {label}
    </span>
  );
}
