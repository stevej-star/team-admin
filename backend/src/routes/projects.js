const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all projects (with their links and member count)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', pl.id, 'label', pl.label, 'url', pl.url))
          FILTER (WHERE pl.id IS NOT NULL), '[]'
        ) AS links,
        COUNT(DISTINCT pm.member_id)::int AS member_count
      FROM projects p
      LEFT JOIN project_links pl ON pl.project_id = p.id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project (with links, members, tasks)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const [{ rows: links }, { rows: members }, { rows: tasks }] = await Promise.all([
      pool.query('SELECT * FROM project_links WHERE project_id = $1', [req.params.id]),
      pool.query(
        `SELECT tm.* FROM team_members tm
         JOIN project_members pm ON pm.member_id = tm.id
         WHERE pm.project_id = $1 ORDER BY tm.name`,
        [req.params.id]
      ),
      pool.query(
        'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
        [req.params.id]
      ),
    ]);

    res.json({ ...rows[0], links, members, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  const { name, description, status, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO projects (name, description, status, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, status || 'active', notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update project
router.put('/:id', async (req, res) => {
  const { name, description, status, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE projects SET name=$1, description=$2, status=$3, notes=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, description, status, notes, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Project Links ---

// POST add link
router.post('/:id/links', async (req, res) => {
  const { label, url } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO project_links (project_id, label, url) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, label, url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE link
router.delete('/:id/links/:linkId', async (req, res) => {
  try {
    await pool.query('DELETE FROM project_links WHERE id=$1 AND project_id=$2', [
      req.params.linkId,
      req.params.id,
    ]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Project Members ---

// POST assign member
router.post('/:id/members', async (req, res) => {
  const { member_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO project_members (project_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, member_id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove member
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM project_members WHERE project_id=$1 AND member_id=$2',
      [req.params.id, req.params.memberId]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
