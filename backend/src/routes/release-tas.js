const express = require('express');
const router = express.Router();
const pool = require('../db');

const SECTION_FIELDS = [
  'demo_consistency', 'database_migrations', 'config', 'java_connector',
  'java_common', 'foundation', 'generated_source', 'java_server',
  'build_logic', 'decisions',
  'decision_safety', 'decision_rollback', 'decision_critical_path',
  'decision_exceptions', 'decision_pipeline', 'decision_tech_approval',
];

// GET all (summary only — no section text for performance)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, release_name, release_date, status, created_at, updated_at
      FROM release_tas
      ORDER BY release_date DESC NULLS LAST, created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single (full, including all section text)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM release_tas WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  const { release_name, release_date, status } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO release_tas (release_name, release_date, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [release_name, release_date || null, status || 'pending']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update (full record including sections)
router.put('/:id', async (req, res) => {
  const { release_name, release_date, status, demo_start, demo_end } = req.body;
  const sections = SECTION_FIELDS.map((f) => req.body[f] ?? '');
  try {
    const { rows } = await pool.query(
      `UPDATE release_tas
       SET release_name=$1, release_date=$2, status=$3,
           demo_start=$4, demo_end=$5,
           demo_consistency=$6, database_migrations=$7, config=$8,
           java_connector=$9, java_common=$10, foundation=$11,
           generated_source=$12, java_server=$13, build_logic=$14,
           decisions=$15,
           decision_safety=$16, decision_rollback=$17, decision_critical_path=$18,
           decision_exceptions=$19, decision_pipeline=$20, decision_tech_approval=$21,
           updated_at=NOW()
       WHERE id=$22 RETURNING *`,
      [release_name, release_date || null, status,
       demo_start || null, demo_end || null,
       ...sections, req.params.id]
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
    await pool.query('DELETE FROM release_tas WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
