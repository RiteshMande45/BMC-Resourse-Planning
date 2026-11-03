const pool = require('../config/db');

const getTasks = async (req, res) => {
    const { project_id } = req.query;
    try {
        let query = 'SELECT * FROM tasks';
        let params = [];
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const createTask = async (req, res) => {
    const { project_id, title, description, status, assigned_to } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (project_id, title, description, status, assigned_to) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [project_id, title, description, status || 'todo', assigned_to]
        );
        res.status(201).json({ message: 'Task created successfully', task: result.rows[0] });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, assigned_to } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status), assigned_to = COALESCE($4, assigned_to), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [title, description, status, assigned_to, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task updated successfully', task: result.rows[0] });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
