const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all members
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM team_members ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single member + their projects
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM team_members WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const { rows: projects } = await pool.query(
      `SELECT p.* FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.member_id = $1 ORDER BY p.name`,
      [req.params.id]
    );
    res.json({ ...rows[0], projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create member
router.post('/', async (req, res) => {
  const { name, role, email, avatar_url, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO team_members (name, role, email, avatar_url, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, role, email, avatar_url, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update member
router.put('/:id', async (req, res) => {
  const { name, role, email, avatar_url, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE team_members SET name=$1, role=$2, email=$3, avatar_url=$4, notes=$5
       WHERE id=$6 RETURNING *`,
      [name, role, email, avatar_url, notes, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
