const express = require('express');
const cors = require('cors');
const migrate = require('./migrate');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/members', require('./routes/members'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/release-tas', require('./routes/release-tas'));
app.use('/api/notes', require('./routes/notes'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;

migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
