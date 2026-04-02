const express = require('express');
const router = express.Router();
const pool = require('../db');

// ── Categories ─────────────────────────────────────────────────

router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM note_categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO note_categories (name, color) VALUES ($1, $2) RETURNING *',
      [name.trim(), color || '#94a3b8']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const { rows } = await pool.query(
      'UPDATE note_categories SET name=$1, color=$2 WHERE id=$3 RETURNING *',
      [name.trim(), color || '#94a3b8', req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM note_categories WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Folders ────────────────────────────────────────────────────

router.get('/folders', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM note_folders ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/folders', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO note_folders (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/folders/:id', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const { rows } = await pool.query(
      'UPDATE note_folders SET name=$1 WHERE id=$2 RETURNING *',
      [name.trim(), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/folders/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM note_folders WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Notes ──────────────────────────────────────────────────────

// GET all (summary — no content for list performance)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT n.id, n.title, n.folder_id, n.category, n.tags, n.pinned,
             n.created_at, n.updated_at,
             LEFT(n.content, 200) AS snippet
      FROM notes n
      ORDER BY n.pinned DESC, n.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single (full content)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notes WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  const { title, content, folder_id, category, tags } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO notes (title, content, folder_id, category, tags)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        title?.trim() || 'Untitled',
        content || '',
        folder_id || null,
        category || '',
        tags || '',
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  const { title, content, folder_id, category, tags, pinned } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE notes
       SET title=$1, content=$2, folder_id=$3, category=$4, tags=$5,
           pinned=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [
        title?.trim() || 'Untitled',
        content ?? '',
        folder_id || null,
        category || '',
        tags || '',
        pinned ?? false,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
