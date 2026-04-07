import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import Modal from '../components/Modal';

// ── Helpers ────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#94a3b8', '#3b82f6', '#f59e0b', '#a855f7',
  '#22c55e', '#ef4444', '#f97316', '#06b6d4',
  '#ec4899', '#84cc16',
];

function categoryDot(cat, categories) {
  const found = categories.find(c => c.name === cat);
  return found?.color || '#94a3b8';
}

function parseTags(str) {
  return str ? str.split(',').map(t => t.trim()).filter(Boolean) : [];
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: diffDays > 365 ? 'numeric' : undefined });
}

// ── Folder sidebar item ────────────────────────────────────────

function FolderItem({ folder, selected, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const inputRef = useRef(null);

  const commit = () => {
    if (name.trim() && name.trim() !== folder.name) onRename(folder.id, name.trim());
    else setName(folder.name);
    setEditing(false);
  };

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  return (
    <div
      className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${
        selected ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={() => !editing && onSelect(folder.id)}
    >
      <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 16 16">
        <path d="M2 4a1 1 0 011-1h3.586a1 1 0 01.707.293L8 4h5a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" fill="currentColor"/>
      </svg>
      {editing ? (
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setName(folder.name); setEditing(false); } }}
          className="flex-1 min-w-0 text-sm bg-white border border-blue-300 rounded px-1 py-0 focus:outline-none"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 min-w-0 truncate">{folder.name}</span>
      )}
      {!editing && (
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); setEditing(true); }}
            className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            title="Rename"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
              <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(folder.id); }}
            className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
            title="Delete folder"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Note list item ─────────────────────────────────────────────

function NoteCard({ note, selected, onSelect, categories }) {
  const tags = parseTags(note.tags);
  return (
    <div
      onClick={() => onSelect(note.id)}
      className={`px-3 py-3 cursor-pointer border-b border-gray-100 transition-colors ${
        selected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        {note.pinned && (
          <svg className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 12 12">
            <path d="M8 1L9.5 2.5 7 5l.5 3.5L6 10 4.5 7H1.5L3 5.5.5 3 2 1.5 4.5 4 6 2.5 8 1z"/>
          </svg>
        )}
        {note.category && (
          <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryDot(note.category, categories) }} />
        )}
        <span className={`flex-1 text-sm font-medium truncate ${selected ? 'text-blue-800' : 'text-gray-900'}`}>
          {note.title || 'Untitled'}
        </span>
      </div>
      {note.snippet && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-1.5 ml-4 leading-relaxed">
          {note.snippet.replace(/[#*`_~\[\]]/g, '')}
        </p>
      )}
      <div className="flex items-center justify-between ml-4">
        <div className="flex gap-1 flex-wrap">
          {tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
        <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(note.updated_at)}</span>
      </div>
    </div>
  );
}

// ── Main Notes page ────────────────────────────────────────────

export default function Notes() {
  const [folders, setFolders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('__all__');
  const [selectedTagFilter, setSelectedTagFilter] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState(null); // full note loaded from API
  const [editorView, setEditorView] = useState('edit'); // 'edit' | 'preview' | 'split'
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [saving, setSaving] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const newFolderRef = useRef(null);
  // Category management state
  const [newCatInput, setNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[1]);
  const [selectedCatFilter, setSelectedCatFilter] = useState(null);
  const newCatRef = useRef(null);
  const saveTimer = useRef(null);
  const [tagInput, setTagInput] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });

  const openConfirm = (message, onConfirm) => setConfirmModal({ open: true, message, onConfirm });
  const closeConfirm = () => setConfirmModal({ open: false, message: '', onConfirm: null });
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef(null);

  // ── Load data ──────────────────────────────────────────────

  const loadFolders = async () => {
    const res = await fetch(`/api/notes/folders`);
    setFolders(await res.json());
  };

  const loadCategories = async () => {
    const res = await fetch(`/api/notes/categories`);
    setCategories(await res.json());
  };

  const loadNotes = async () => {
    const res = await fetch(`/api/notes`);
    setNotes(await res.json());
  };

  useEffect(() => {
    loadFolders();
    loadCategories();
    loadNotes();
  }, []);

  useEffect(() => { if (newFolderInput) setTimeout(() => newFolderRef.current?.focus(), 50); }, [newFolderInput]);
  useEffect(() => { if (newCatInput) setTimeout(() => newCatRef.current?.focus(), 50); }, [newCatInput]);

  useEffect(() => {
    if (editingTitle) setTimeout(() => titleRef.current?.select(), 30);
  }, [editingTitle]);

  // ── Load full note when selection changes ──────────────────

  useEffect(() => {
    if (!selectedNoteId) { setNoteContent(null); return; }
    fetch(`/api/notes/${selectedNoteId}`)
      .then(r => r.json())
      .then(n => { setNoteContent(n); setTagInput(n.tags || ''); });
  }, [selectedNoteId]);

  // ── Auto-save (debounced 800ms) ────────────────────────────

  const scheduleSave = useCallback((patch) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!selectedNoteId) return;
      setSaving(true);
      await fetch(`/api/notes/${selectedNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      setSaving(false);
      // Refresh list summary
      const res = await fetch(`/api/notes`);
      setNotes(await res.json());
    }, 800);
  }, [selectedNoteId]);

  const updateNoteField = (field, value) => {
    setNoteContent(n => ({ ...n, [field]: value }));
    scheduleSave({ ...noteContent, [field]: value });
  };

  // ── Folders CRUD ───────────────────────────────────────────

  const createFolder = async () => {
    if (!newFolderName.trim()) { setNewFolderInput(false); return; }
    const res = await fetch(`/api/notes/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    if (res.ok) { await loadFolders(); }
    setNewFolderName('');
    setNewFolderInput(false);
  };

  const renameFolder = async (id, name) => {
    await fetch(`/api/notes/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    await loadFolders();
  };

  const deleteFolder = (id) => {
    openConfirm('Delete this folder? Notes inside will be moved to All Notes.', async () => {
      await fetch(`/api/notes/folders/${id}`, { method: 'DELETE' });
      if (selectedFolderFilter === id) setSelectedFolderFilter('__all__');
      await loadFolders();
      await loadNotes();
    });
  };

  // ── Categories CRUD ────────────────────────────────────────

  const createCategory = async () => {
    if (!newCatName.trim()) { setNewCatInput(false); return; }
    await fetch(`/api/notes/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
    });
    setNewCatName('');
    setNewCatColor(PRESET_COLORS[1]);
    setNewCatInput(false);
    await loadCategories();
  };

  const deleteCategory = (id, name) => {
    openConfirm(`Delete category "${name}"? Notes will keep the category name but the colour will be removed.`, async () => {
      await fetch(`/api/notes/categories/${id}`, { method: 'DELETE' });
      if (selectedCatFilter === name) setSelectedCatFilter(null);
      await loadCategories();
    });
  };

  // ── Notes CRUD ─────────────────────────────────────────────

  const createNote = async () => {
    const body = {
      title: 'Untitled',
      folder_id: selectedFolderFilter !== '__all__' && selectedFolderFilter !== '__pinned__'
        ? selectedFolderFilter : null,
    };
    const res = await fetch(`/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const note = await res.json();
    await loadNotes();
    setSelectedNoteId(note.id);
    setEditingTitle(true);
  };

  const deleteNote = (id) => {
    openConfirm('Delete this note?', async () => {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (selectedNoteId === id) { setSelectedNoteId(null); setNoteContent(null); }
      await loadNotes();
    });
  };

  const togglePin = async () => {
    if (!noteContent) return;
    const newPinned = !noteContent.pinned;
    await fetch(`/api/notes/${noteContent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...noteContent, pinned: newPinned }),
    });
    setNoteContent(n => ({ ...n, pinned: newPinned }));
    await loadNotes();
  };

  const commitTags = () => {
    updateNoteField('tags', tagInput);
  };

  // ── Filtering / sorting ────────────────────────────────────

  const allTags = [...new Set(notes.flatMap(n => parseTags(n.tags)))].sort();

  const filteredNotes = notes
    .filter(n => {
      if (selectedFolderFilter === '__pinned__') return n.pinned;
      if (selectedFolderFilter !== '__all__') return n.folder_id === selectedFolderFilter;
      return true;
    })
    .filter(n => !selectedTagFilter || parseTags(n.tags).includes(selectedTagFilter))
    .filter(n => !selectedCatFilter || n.category === selectedCatFilter)
    .filter(n => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || (n.snippet || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'created') return new Date(b.created_at) - new Date(a.created_at);
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
    <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Panel 1: Folder sidebar ── */}
      <aside className="w-48 shrink-0 border-r border-gray-200 flex flex-col bg-white overflow-y-auto"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</p>

          {/* Static filters */}
          {[
            { id: '__all__',    label: 'All Notes', icon: '📋' },
            { id: '__pinned__', label: 'Pinned',    icon: '📌' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setSelectedFolderFilter(f.id); setSelectedTagFilter(null); }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5 ${
                selectedFolderFilter === f.id && !selectedTagFilter
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {f.id === '__all__' && (
                <span className="ml-auto text-xs text-gray-400">{notes.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Folders */}
        <div className="p-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</p>
            <button
              onClick={() => setNewFolderInput(true)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="New folder"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {newFolderInput && (
            <input
              ref={newFolderRef}
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onBlur={createFolder}
              onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') { setNewFolderName(''); setNewFolderInput(false); } }}
              placeholder="Folder name…"
              className="w-full text-sm border border-blue-300 rounded-lg px-2 py-1 mb-1 focus:outline-none"
            />
          )}

          {folders.map(f => (
            <FolderItem
              key={f.id}
              folder={f}
              selected={selectedFolderFilter === f.id && !selectedTagFilter}
              onSelect={id => { setSelectedFolderFilter(id); setSelectedTagFilter(null); }}
              onRename={renameFolder}
              onDelete={deleteFolder}
            />
          ))}

          {folders.length === 0 && !newFolderInput && (
            <p className="text-xs text-gray-400 italic px-2">No folders yet</p>
          )}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {allTags.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTagFilter(selectedTagFilter === t ? null : t)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    selectedTagFilter === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
            <button
              onClick={() => setNewCatInput(v => !v)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="New category"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {newCatInput && (
            <div className="mb-2 space-y-1.5">
              <input
                ref={newCatRef}
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createCategory(); if (e.key === 'Escape') { setNewCatName(''); setNewCatInput(false); } }}
                placeholder="Category name…"
                className="w-full text-sm border border-blue-300 rounded-lg px-2 py-1 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewCatColor(c)}
                    className="w-4 h-4 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: newCatColor === c ? '#1d4ed8' : 'transparent' }}
                  />
                ))}
              </div>
              <button onClick={createCategory} className="btn-primary text-xs py-0.5 px-2 w-full">Add</button>
            </div>
          )}

          {categories.map(cat => (
            <div
              key={cat.id}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${
                selectedCatFilter === cat.name ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => setSelectedCatFilter(selectedCatFilter === cat.name ? null : cat.name)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="flex-1 truncate">{cat.name}</span>
              <button
                onClick={e => { e.stopPropagation(); deleteCategory(cat.id, cat.name); }}
                className="hidden group-hover:block text-gray-400 hover:text-red-500 transition-colors leading-none"
                title="Delete category"
              >×</button>
            </div>
          ))}

          {categories.length === 0 && !newCatInput && (
            <p className="text-xs text-gray-400 italic px-2">No categories yet</p>
          )}
        </div>
      </aside>

      {/* ── Panel 2: Notes list ── */}
      <div className="w-64 shrink-0 border-r border-gray-200 flex flex-col bg-white"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1"
            style={{ '--tw-ring-color': 'var(--accent-ring)' }}
          />
          <button
            onClick={createNote}
            className="btn-primary text-xs py-1.5 px-2.5 shrink-0"
            title="New note"
          >+ New</button>
        </div>

        {/* Sort */}
        <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          {[['updated', 'Updated'], ['created', 'Created'], ['title', 'A–Z']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSortBy(val)}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                sortBy === val ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
              }`}
            >{label}</button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              {search ? 'No notes match your search.' : 'No notes here yet.'}
              <br />
              <button onClick={createNote} className="mt-2 text-blue-500 hover:underline text-xs">
                Create one
              </button>
            </div>
          ) : (
            filteredNotes.map(n => (
              <NoteCard
                key={n.id}
                note={n}
                selected={n.id === selectedNoteId}
                onSelect={setSelectedNoteId}
                categories={categories}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Panel 3: Editor ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white"
        style={{ backgroundColor: 'var(--card-bg)' }}>
        {noteContent ? (
          <>
            {/* Editor toolbar */}
            <div className="px-5 py-2.5 border-b border-gray-200 flex items-center gap-3"
              style={{ borderColor: 'var(--card-border)' }}>
              {/* Title */}
              {editingTitle ? (
                <input
                  ref={titleRef}
                  value={noteContent.title}
                  onChange={e => setNoteContent(n => ({ ...n, title: e.target.value }))}
                  onBlur={() => { setEditingTitle(false); updateNoteField('title', noteContent.title); }}
                  onKeyDown={e => { if (e.key === 'Enter') { setEditingTitle(false); updateNoteField('title', noteContent.title); } }}
                  className="flex-1 text-base font-semibold border-b border-blue-400 focus:outline-none bg-transparent"
                />
              ) : (
                <h2
                  className="flex-1 text-base font-semibold text-gray-900 cursor-text hover:text-blue-700 truncate"
                  onClick={() => setEditingTitle(true)}
                  title="Click to rename"
                >
                  {noteContent.title || 'Untitled'}
                </h2>
              )}

              {saving && <span className="text-xs text-gray-400">Saving…</span>}

              {/* Category */}
              <select
                value={noteContent.category || ''}
                onChange={e => updateNoteField('category', e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Folder */}
              <select
                value={noteContent.folder_id || ''}
                onChange={e => updateNoteField('folder_id', e.target.value || null)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="">No folder</option>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>

              {/* Pin */}
              <button
                onClick={togglePin}
                title={noteContent.pinned ? 'Unpin' : 'Pin note'}
                className={`text-sm transition-colors ${noteContent.pinned ? 'text-amber-500' : 'text-gray-400 hover:text-amber-400'}`}
              >📌</button>

              {/* Delete */}
              <button
                onClick={() => deleteNote(noteContent.id)}
                title="Delete note"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <path d="M6 2h4M3 4h10l-1 9H4L3 4zM6 7v4M10 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                {[['edit', 'Edit'], ['split', 'Split'], ['preview', 'Preview']].map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setEditorView(v)}
                    className={`text-xs px-2.5 py-1 transition-colors ${
                      editorView === v ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >{label}</button>
                ))}
              </div>

              {/* Markdown reference */}
              <a
                href="https://commonmark.org/help/"
                target="_blank"
                rel="noreferrer"
                title="Markdown syntax reference"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 11V8M8 5.5v-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </a>
            </div>

            {/* Tags bar */}
            <div className="px-5 py-2 border-b border-gray-100 flex items-center gap-2"
              style={{ borderColor: 'var(--card-border)' }}>
              <span className="text-xs text-gray-400">Tags:</span>
              <div className="flex flex-wrap gap-1 flex-1">
                {parseTags(noteContent.tags).map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {t}
                    <button
                      onClick={() => {
                        const newTags = parseTags(noteContent.tags).filter(x => x !== t).join(', ');
                        setTagInput(newTags);
                        updateNoteField('tags', newTags);
                      }}
                      className="text-gray-400 hover:text-red-500 leading-none"
                    >×</button>
                  </span>
                ))}
                <input
                  value={tagInput.includes(',') ? '' : tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const raw = tagInput.trim().replace(/,$/, '');
                      if (!raw) return;
                      const existing = parseTags(noteContent.tags);
                      if (!existing.includes(raw)) {
                        const newTags = [...existing, raw].join(', ');
                        setTagInput('');
                        updateNoteField('tags', newTags);
                      } else {
                        setTagInput('');
                      }
                    }
                  }}
                  onBlur={() => {
                    const raw = tagInput.trim();
                    if (!raw) return;
                    const existing = parseTags(noteContent.tags);
                    if (!existing.includes(raw)) {
                      const newTags = [...existing, raw].join(', ');
                      setTagInput('');
                      updateNoteField('tags', newTags);
                    } else {
                      setTagInput('');
                    }
                  }}
                  placeholder="Add tag…"
                  className="text-xs px-1 py-0.5 focus:outline-none bg-transparent min-w-16"
                />
              </div>
            </div>

            {/* Editor / Preview body */}
            <div className="flex-1 flex min-h-0">
              {/* Edit pane */}
              {(editorView === 'edit' || editorView === 'split') && (
                <textarea
                  value={noteContent.content}
                  onChange={e => updateNoteField('content', e.target.value)}
                  placeholder="Start writing… Markdown is supported."
                  className="flex-1 resize-none p-5 text-sm font-mono leading-relaxed focus:outline-none border-0"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderRight: editorView === 'split' ? '1px solid var(--card-border)' : 'none',
                  }}
                  spellCheck
                />
              )}

              {/* Preview pane */}
              {(editorView === 'preview' || editorView === 'split') && (
                <div className="flex-1 overflow-y-auto p-5 prose prose-sm max-w-none"
                  style={{ color: 'var(--text-primary)' }}>
                  {noteContent.content ? (
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                      {noteContent.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-400 italic text-sm">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-base font-semibold text-gray-600 mb-1">No note selected</h3>
            <p className="text-sm text-gray-400 mb-4">Pick a note from the list or create a new one.</p>
            <button onClick={createNote} className="btn-primary text-sm px-4 py-2">+ New Note</button>
          </div>
        )}
      </div>
    </div>

    {confirmModal.open && (
      <Modal title="Confirm deletion" onClose={closeConfirm}>
        <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={closeConfirm} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button
            onClick={() => { confirmModal.onConfirm(); closeConfirm(); }}
            className="text-sm font-medium px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    )}
    </>
  );
}
