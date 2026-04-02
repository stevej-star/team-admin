const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all tasks (with optional project filter)
router.get('/', async (req, res) => {
  try {
    const { project_id, status } = req.query;
    const conditions = [];
    const params = [];

    if (project_id) {
      params.push(project_id);
      conditions.push(`t.project_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT t.*, p.name AS project_name
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
       ${where}
       ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single task
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, p.name AS project_name FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create task
router.post('/', async (req, res) => {
  const { title, description, status, project_id, due_date } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, project_id, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, status || 'todo', project_id || null, due_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  const { title, description, status, project_id, due_date } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, status=$3, project_id=$4, due_date=$5
       WHERE id=$6 RETURNING *`,
      [title, description, status, project_id || null, due_date || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
