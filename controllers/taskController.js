const pool = require('../db/connection');

// GET all tasks for logged-in user
const getTasks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

// CREATE a task
const createTask = async (req, res) => {
  const { title, description, deadline } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required.' });

  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, deadline) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description || null, deadline || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

// UPDATE a task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline } = req.body;

  try {
    const check = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0)
      return res.status(404).json({ message: 'Task not found or not yours.' });

    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, deadline = $3 WHERE id = $4 RETURNING *',
      [title, description, deadline, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

// DELETE a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0)
      return res.status(404).json({ message: 'Task not found or not yours.' });

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };