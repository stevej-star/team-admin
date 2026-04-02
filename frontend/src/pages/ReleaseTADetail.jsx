import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

const SECTIONS = [
  { key: 'database_migrations', label: 'Database Migrations' },
  { key: 'config',              label: 'Config' },
  { key: 'java_connector',      label: 'Java Connector' },
  { key: 'java_common',         label: 'Java Common' },
  { key: 'foundation',          label: 'Foundation' },
  { key: 'generated_source',    label: 'Generated Source Code' },
  { key: 'java_server',         label: 'Java Server' },
  { key: 'build_logic',         label: 'Build Logic' },
];

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  pending:  'bg-yellow-100 text-yellow-700',
};

// ── Helpers ────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  // datetime-local needs "YYYY-MM-DDTHH:MM"
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function generateDemoSentence(start, end) {
  if (!start && !end) return null;
  const startTime = start ? `~${formatTime(start)}` : '?';
  const endTime   = end   ? `~${formatTime(end)}`   : '?';

  const startDate = start ? formatDate(start) : null;
  const endDate   = end   ? formatDate(end)   : null;

  const sameDay = startDate && endDate && startDate === endDate;
  const datePart = sameDay
    ? `on ${startDate}`
    : [startDate && `from ${startDate}`, endDate && `to ${endDate}`].filter(Boolean).join(' ');

  return `This version was in DEMO exclusively from ${startTime} - ${endTime} ${datePart}.`;
}

// ── Demo Consistency structured section ────────────────────────
function DemoConsistencySection({ demoStart, demoEnd, onSave }) {
  const todayNine = () => {
    const d = new Date();
    d.setHours(9, 30, 0, 0);
    return toLocalInputValue(d.toISOString());
  };
  const todayTwelve = () => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return toLocalInputValue(d.toISOString());
  };

  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(toLocalInputValue(demoStart) || todayNine());
  const [end,   setEnd]   = useState(toLocalInputValue(demoEnd)   || todayTwelve());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStart(toLocalInputValue(demoStart) || todayNine());
    setEnd(toLocalInputValue(demoEnd)     || todayTwelve());
  }, [demoStart, demoEnd]);

  const preview = generateDemoSentence(
    start ? new Date(start).toISOString() : null,
    end   ? new Date(end).toISOString()   : null,
  );

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      demo_start: start ? new Date(start).toISOString() : null,
      demo_end:   end   ? new Date(end).toISOString()   : null,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setStart(toLocalInputValue(demoStart));
    setEnd(toLocalInputValue(demoEnd));
    setEditing(false);
  };

  const saved = generateDemoSentence(demoStart, demoEnd);

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50 border-gray-100">
        <h3 className="text-sm font-semibold tracking-wide text-gray-700">Demo Consistency</h3>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1 px-3">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={handleCancel} className="btn-secondary text-xs py-1 px-3">Cancel</button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-white">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Demo start</label>
                <input
                  type="datetime-local"
                  className="input text-sm"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Demo end</label>
                <input
                  type="datetime-local"
                  className="input text-sm"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>
            {preview && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm text-gray-700 italic">
                {preview}
              </div>
            )}
          </div>
        ) : saved ? (
          <p className="text-sm text-gray-700">{saved}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No demo window set — click Edit to add.</p>
        )}
      </div>
    </div>
  );
}

// ── Decisions structured section ───────────────────────────────

const DECISION_FIELDS = [
  { key: 'decision_safety',        label: 'Safety of Release' },
  { key: 'decision_critical_path', label: 'Critical Path Impact' },
  { key: 'decision_rollback',      label: 'Rollback',            checkbox: true, checkboxText: 'This release is safe to rollback.' },
  { key: 'decision_exceptions',    label: 'Exceptions & Alerts', checkbox: true, checkboxText: 'No release blocking alerts or exceptions.' },
  { key: 'decision_pipeline',      label: 'Pipeline',            checkbox: true, checkboxText: 'The payment schemes pipeline is green.' },
];

// Tech Approval is handled separately as a checkbox
const TECH_APPROVAL_KEY = 'decision_tech_approval';

function TechApprovalBar({ release, onSave }) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const reasonRef = useRef(null);

  const isApproved = release[TECH_APPROVAL_KEY] === 'Tech approved.';
  const rawValue   = release[TECH_APPROVAL_KEY] || '';
  const isRejected = rawValue.startsWith('Tech rejected.');
  const rejectionReason = isRejected
    ? rawValue.replace(/^Tech rejected\.\s*/, '').trim()
    : '';

  // All decision fields must be filled before approval is allowed.
  // If already approved/rejected, still allow toggling (to revoke).
  const allDecisionsFilled = DECISION_FIELDS.every(({ key }) => !!release[key]);
  const canAct = allDecisionsFilled || isApproved || isRejected;

  const handleApprovalToggle = async () => {
    setApproving(true);
    await onSave({
      [TECH_APPROVAL_KEY]: isApproved ? '' : 'Tech approved.',
      status: isApproved ? 'pending' : 'approved',
    });
    setApproving(false);
  };

  const openRejectModal = () => {
    if (isRejected) { handleRevokeRejection(); return; }
    setRejectReason('');
    setRejectModalOpen(true);
    setTimeout(() => reasonRef.current?.focus(), 50);
  };

  const handleRevokeRejection = async () => {
    setRejecting(true);
    await onSave({ [TECH_APPROVAL_KEY]: '', status: 'pending' });
    setRejecting(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) return;
    setRejectModalOpen(false);
    setRejecting(true);
    await onSave({
      [TECH_APPROVAL_KEY]: `Tech rejected. ${rejectReason.trim()}`,
      status: 'rejected',
    });
    setRejecting(false);
  };

  return (
    <>
      <div className="border-t border-gray-200 bg-white px-5 py-3 flex items-start justify-between gap-4"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="min-w-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tech Approval</span>
          {!canAct && (
            <p className="text-xs text-amber-600 mt-0.5 italic">Complete all decision fields to enable approval.</p>
          )}
          {isApproved && <p className="text-sm mt-0.5 text-green-700">Tech approved.</p>}
          {isRejected && (
            <>
              <p className="text-sm mt-0.5 text-red-600 font-medium">Tech rejected.</p>
              {rejectionReason && (
                <p className="text-sm mt-1 text-red-500 italic break-words">{rejectionReason}</p>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <button
            onClick={handleApprovalToggle}
            disabled={approving || rejecting || !canAct}
            title={!canAct ? 'Complete all decisions first' : isApproved ? 'Revoke approval' : 'Mark as tech approved'}
            className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
              !canAct
                ? 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                : isApproved
                ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {isApproved && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button
            onClick={openRejectModal}
            disabled={approving || rejecting || !canAct}
            title={!canAct ? 'Complete all decisions first' : isRejected ? 'Revoke rejection' : 'Mark as tech rejected'}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
              !canAct
                ? 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                : isRejected
                ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
                : 'border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400'
            }`}
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {isRejected ? 'Rejected' : 'Reject'}
          </button>
        </div>
      </div>

      {rejectModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Reject Release</h2>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejecting this tech approval. This will be visible on the release record.</p>
            <textarea
              ref={reasonRef}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleConfirmReject(); }}
              placeholder="Enter rejection reason…"
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--accent-ring)' }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setRejectModalOpen(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function DecisionsSection({ release, onSave }) {
  // Local state mirrors each field value for controlled inputs
  const [values, setValues] = useState(() => {
    const v = {};
    DECISION_FIELDS.forEach(({ key }) => { v[key] = release[key] || ''; });
    return v;
  });
  const [saving, setSaving] = useState(null); // key of field currently saving

  // Keep local state in sync if release prop changes externally
  useEffect(() => {
    setValues(v => {
      const next = { ...v };
      DECISION_FIELDS.forEach(({ key }) => { next[key] = release[key] || ''; });
      return next;
    });
  }, [release]);

  const saveField = async (key, value) => {
    setSaving(key);
    await onSave({ [key]: value });
    setSaving(null);
  };

  const handleCheckbox = (key, checkboxText, checked) => {
    const val = checked ? checkboxText : '';
    setValues(v => ({ ...v, [key]: val }));
    saveField(key, val);
  };

  const handleBlur = (key) => {
    const current = values[key];
    if (current !== (release[key] || '')) saveField(key, current);
  };

  return (
    <div className="rounded-lg border border-blue-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-blue-50 border-blue-100">
        <h3 className="text-sm font-semibold tracking-wide text-blue-800">Decisions</h3>
      </div>

      <div className="bg-white divide-y divide-gray-100 p-4 space-y-4">
        {DECISION_FIELDS.map(({ key, label, checkbox, checkboxText }) => (
          <div key={key}>
            {checkbox ? (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!values[key]}
                  onChange={(e) => handleCheckbox(key, checkboxText, e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                  disabled={saving === key}
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide mr-2">{label}</span>
                  {checkboxText}
                </span>
                {saving === key && <span className="text-xs text-gray-400 ml-1">Saving…</span>}
              </label>
            ) : (
              <>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <textarea
                  value={values[key]}
                  onChange={(e) => setValues(v => ({ ...v, [key]: e.target.value }))}
                  onBlur={() => handleBlur(key)}
                  placeholder={`${label}…`}
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-y focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--accent-ring)' }}
                />
                {saving === key && <p className="text-xs text-gray-400 mt-1">Saving…</p>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Markdown export generator ──────────────────────────────────

function generateMarkdown(release) {
  const lines = [];

  // Demo Consistency
  lines.push('### Demo Consistency');
  const demoSentence = generateDemoSentence(release.demo_start, release.demo_end);
  lines.push(demoSentence || '_Not set_');
  lines.push('');

  // Standard text sections
  SECTIONS.forEach(({ key, label }) => {
    lines.push(`### ${label}`);
    lines.push(release[key] || '_None_');
    lines.push('');
  });

  // Decisions
  lines.push('### Decisions');
  const decisions = [
    { key: 'decision_safety',        label: 'Safety of Release' },
    { key: 'decision_rollback',      label: 'Rollback' },
    { key: 'decision_critical_path', label: 'Critical Path Impact' },
    { key: 'decision_exceptions',    label: 'Exceptions & Alerts' },
    { key: 'decision_pipeline',      label: 'Pipeline' },
    { key: 'decision_tech_approval', label: 'Tech Approval' },
  ];
  decisions.forEach(({ key, label }) => {
    lines.push(`[${label}] ${release[key] || ''}`);
  });

  return lines.join('\n');
}

// ── Markdown export panel ──────────────────────────────────────

function ExportPanel({ release }) {
  const [copied, setCopied] = useState(false);
  const markdown = generateMarkdown(release);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${release.release_name.replace(/\s+/g, '-')}-TA.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Markdown export</span>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-secondary text-xs py-1 px-2.5">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="btn-secondary text-xs py-1 px-2.5">
            ↓ .md
          </button>
        </div>
      </div>
      <textarea
        readOnly
        value={markdown}
        className="flex-1 w-full resize-none overflow-y-auto text-xs leading-relaxed font-mono bg-gray-900 text-gray-100 rounded-lg p-4 border-0 outline-none"
      />
    </div>
  );
}


// ── Structured line editor (services + detail) ────────────────

const SERVICES = [
  'all', 
  'bacs', 
  'bottomline',
  'currencycloud',
  'fasterpaymentsproxy',
  'fasterpaymentsstip',
  'funding', 
  'isatransfer',
  'payment', 
  'paymentorder',
  'paymentschemestracker', 
  'sepa',
  'slasentinel', 
  'swift',
  'swiftproxy'
];

function parseLines(text) {
  if (!text) return [];
  return text.split('\n').filter((l) => l.trim()).map((line) => {
    const match = line.match(/^\[([^\]]+)\]\s*-?\s*(.*)/);
    if (match) {
      return {
        id: Math.random().toString(36).slice(2),
        services: match[1].split('|').map((s) => s.trim()),
        detail: match[2].trim(),
      };
    }
    return { id: Math.random().toString(36).slice(2), services: [], detail: line };
  });
}

function serializeLines(lines) {
  return lines
    .map((l) => {
      const prefix = l.services.length ? `[${l.services.join('|')}] ` : '';
      return `${prefix}${l.detail}`;
    })
    .join('\n');
}

function ServiceSelect({ selected, onChange }) {
  const [open, setOpen]     = useState(false);
  const [pos, setPos]       = useState({ top: 0, left: 0 });
  const [search, setSearch] = useState('');
  const btnRef    = useRef(null);
  const dropRef   = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!open) { setSearch(''); return; }
    const handler = (e) => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    setTimeout(() => searchRef.current?.focus(), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen((o) => !o);
  };

  const filtered = SERVICES.filter((svc) =>
    svc.toLowerCase().includes(search.toLowerCase())
  );
  const trimmed = search.trim().toLowerCase();
  const showCustomOption =
    trimmed.length > 0 && !SERVICES.some((s) => s.toLowerCase() === trimmed);

  const addCustom = () => {
    const val = trimmed;
    if (!val || selected.includes(val)) return;
    const base = selected.filter((s) => s !== 'all');
    onChange([...base, val]);
    setSearch('');
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="font-mono text-xs border border-gray-300 rounded px-2 py-1.5 bg-white hover:bg-gray-50 text-left min-w-[140px] max-w-[220px] shrink-0 flex flex-wrap items-center gap-1"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">select service(s)</span>
        ) : (
          selected.map((svc) => (
            <span
              key={svc}
              className="inline-block rounded px-1.5 py-0.5 text-white text-xs leading-tight"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {svc}
            </span>
          ))
        )}
        <svg className="w-3 h-3 text-gray-400 shrink-0 ml-auto" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, minWidth: 210 }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && showCustomOption) addCustom(); }}
              placeholder="Search or add custom…"
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': 'var(--accent-ring)' }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 && !showCustomOption ? (
              <p className="text-xs text-gray-400 px-2 py-2 text-center">No match</p>
            ) : filtered.map((svc) => {
              const isAll    = svc === 'all';
              const disabled = !isAll && selected.includes('all');
              return (
                <label key={svc} className={`flex items-center gap-2 px-2 py-1.5 rounded ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected.includes(svc)}
                    onChange={(e) => {
                      if (isAll) {
                        onChange(e.target.checked ? ['all'] : []);
                      } else {
                        const base = selected.filter((s) => s !== 'all' && s !== svc);
                        onChange(e.target.checked ? [...base, svc] : base);
                      }
                    }}
                  />
                  <span className="text-sm font-mono">{svc}</span>
                </label>
              );
            })}
            {showCustomOption && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addCustom(); }}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-sm font-mono cursor-pointer border-t border-gray-100 mt-0.5 pt-1.5"
              >
                <span className="text-gray-400">+</span>
                <span>Add <span className="font-semibold" style={{ color: 'var(--accent)' }}>"{trimmed}"</span></span>
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const sortLines = (lines) =>
  [...lines].sort((a, b) => {
    const sa = (a.services[0] || '').toLowerCase();
    const sb = (b.services[0] || '').toLowerCase();
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });

// Always-on inline line editor: existing lines shown with remove, + Add line at bottom
function SectionCard({ label, value, onSave }) {
  const [lines, setLines]       = useState(() => sortLines(parseLines(value)));
  const [pending, setPending]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [pendingError, setPendingError] = useState('');

  useEffect(() => { setLines(sortLines(parseLines(value))); }, [value]);

  const commitRemove = async (id) => {
    const next = sortLines(lines.filter((l) => l.id !== id));
    setLines(next);
    setSaving(true);
    await onSave(serializeLines(next));
    setSaving(false);
  };

  const openPending = () => {
    setPending({ services: [], detail: '' });
    setPendingError('');
  };

  const cancelPending = () => { setPending(null); setPendingError(''); };

  const commitPending = async () => {
    if (!pending.services.length || !pending.detail.trim()) {
      setPendingError('Select a service and enter detail text.');
      return;
    }
    const next = sortLines([...lines, { id: Math.random().toString(36).slice(2), ...pending }]);
    setLines(next);
    setPending(null);
    setPendingError('');
    setSaving(true);
    await onSave(serializeLines(next));
    setSaving(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50 border-gray-100">
        <h3 className="text-sm font-semibold tracking-wide text-gray-700">{label}</h3>
        {saving && <span className="text-xs text-gray-400">Saving…</span>}
      </div>

      <div className="p-4 bg-white space-y-2">
        {/* Existing lines */}
        {lines.map((line) => (
          <div key={line.id} className="flex items-start gap-2 group rounded-lg px-3 py-2 bg-gray-50 border border-gray-100">
            <div className="flex flex-wrap gap-1 shrink-0 pt-0.5">
              {line.services.map((svc) => (
                <span
                  key={svc}
                  className="inline-block rounded px-1.5 py-0.5 text-white text-xs leading-tight font-mono"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {svc}
                </span>
              ))}
            </div>
            <span className="flex-1 text-sm text-gray-800 pt-0.5">{line.detail}</span>
            <button
              type="button"
              onClick={() => commitRemove(line.id)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0 px-1 opacity-0 group-hover:opacity-100"
              title="Remove line"
            >
              ×
            </button>
          </div>
        ))}

        {lines.length === 0 && !pending && (
          <p className="text-sm text-gray-400 italic">No entries yet.</p>
        )}

        {/* Pending new line */}
        {pending && (
          <div className="flex items-start gap-2 pt-1 border-t border-gray-100 mt-1">
            <ServiceSelect
              selected={pending.services}
              onChange={(svc) => { setPending((p) => ({ ...p, services: svc })); setPendingError(''); }}
            />
            <textarea
              value={pending.detail}
              onChange={(e) => { setPending((p) => ({ ...p, detail: e.target.value })); setPendingError(''); }}
              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitPending(); } if (e.key === 'Escape') cancelPending(); }}
              placeholder="Detail of change…"
              autoFocus
              rows={1}
              className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:border-transparent resize-none overflow-hidden"
              style={{ '--tw-ring-color': 'var(--accent-ring)' }}
            />
            <button
              type="button"
              onClick={commitPending}
              className="btn-primary text-xs py-1.5 px-2.5 shrink-0"
              title="Confirm (Enter)"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={cancelPending}
              className="btn-secondary text-xs py-1.5 px-2 shrink-0 text-gray-500"
              title="Cancel (Esc)"
            >
              ×
            </button>
          </div>
        )}

        {pendingError && <p className="text-xs text-red-500">{pendingError}</p>}

        {/* Add line button */}
        {!pending && (
          <button
            type="button"
            onClick={openPending}
            className="w-full text-sm text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors mt-1"
          >
            + Add line
          </button>
        )}
      </div>
    </div>
  );
}

// ── Detail page ────────────────────────────────────────────────
export default function ReleaseTADetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState(null);
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({});

  // Resizable split — stored as left-panel percentage (must be before any early return)
  const [splitPct, setSplitPct] = useState(
    () => parseFloat(localStorage.getItem('rta_split') || '50')
  );
  const containerRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    fetch(`/api/release-tas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRelease(data);
        setHeaderForm({
          release_name: data.release_name,
          release_date: data.release_date?.split('T')[0] || '',
          status: data.status,
        });
      });
  }, [id]);

  const save = async (updates) => {
    const res = await fetch(`/api/release-tas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...release, ...updates }),
    });
    const updated = await res.json();
    setRelease(updated);
    return updated;
  };

  const saveSection = (key) => (value) => save({ [key]: value });
  const saveDemoWindow = (updates) => save(updates);
  const saveDecisions = (updates) => save(updates);

  const handleHeaderSave = async (e) => {
    e.preventDefault();
    await save(headerForm);
    setEditingHeader(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete review for "${release.release_name}"?`)) return;
    await fetch(`/api/release-tas/${id}`, { method: 'DELETE' });
    navigate('/releases');
  };

  const onDividerMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    const onMove = (ev) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.min(75, Math.max(25, ((ev.clientX - rect.left) / rect.width) * 100));
      setSplitPct(pct);
      localStorage.setItem('rta_split', String(pct));
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  if (!release) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div ref={containerRef} className="flex items-start min-h-full" style={{ gap: 0 }}>
      {/* Left panel: flex column, scrollable content + sticky footer */}
      <div className="min-w-0 flex flex-col" style={{ width: `${splitPct}%`, height: 'calc(100vh - 3rem)', position: 'sticky', top: 0 }}>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pr-1">
        <Link to="/releases" className="text-sm text-gray-500 hover:text-gray-700 mb-5 inline-block">
          ← Release TA
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          {editingHeader ? (
            <form onSubmit={handleHeaderSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Release name</label>
                <input
                  required className="input"
                  value={headerForm.release_name}
                  onChange={(e) => setHeaderForm({ ...headerForm, release_name: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Release date</label>
                  <input
                    type="date" className="input"
                    value={headerForm.release_date}
                    onChange={(e) => setHeaderForm({ ...headerForm, release_date: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input"
                    value={headerForm.status}
                    onChange={(e) => setHeaderForm({ ...headerForm, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setEditingHeader(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{release.release_name}</h1>
                {release.release_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(release.release_date).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-2 ${STATUS_STYLES[release.status]}`}>
                  {release.status}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditingHeader(true)} className="btn-secondary text-sm">Edit</button>
                <button onClick={handleDelete} className="btn-secondary text-sm text-red-600">Delete</button>
              </div>
            </div>
          )}
        </div>

        {/* Section cards */}
        <div className="space-y-4">
          <DemoConsistencySection
            demoStart={release.demo_start}
            demoEnd={release.demo_end}
            onSave={saveDemoWindow}
          />
          {SECTIONS.map(({ key, label }) => (
            <SectionCard
              key={key}
              label={label}
              value={release[key]}
              onSave={saveSection(key)}
            />
          ))}
          <DecisionsSection release={release} onSave={saveDecisions} />
        </div>
        </div>

        {/* Sticky footer: Tech Approval */}
        <TechApprovalBar release={release} onSave={save} />
      </div>

      {/* ── Drag divider ────────────────────────────────────── */}
      <div
        onMouseDown={onDividerMouseDown}
        className="shrink-0 flex items-center justify-center cursor-col-resize select-none group"
        style={{ width: 12 }}
        title="Drag to resize"
      >
        <div className="w-0.5 h-full min-h-screen bg-gray-200 group-hover:bg-gray-400 transition-colors" />
      </div>

      {/* ── Right: live markdown export ─────────────────────── */}
      <div className="min-w-0 sticky top-0" style={{ width: `calc(${100 - splitPct}% - 12px)`, height: 'calc(100vh - 3rem)' }}>
        <ExportPanel release={release} />
      </div>
    </div>
  );
}
