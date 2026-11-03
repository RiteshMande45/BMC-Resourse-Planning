const pool = require('../config/db');

const getProjects = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const createProject = async (req, res) => {
    const { name, description, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO projects (name, description, status) VALUES ($1, $2, $3) RETURNING *',
            [name, description, status || 'active']
        );
        res.status(201).json({ message: 'Project created successfully', project: result.rows[0] });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [name, description, status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json({ message: 'Project updated successfully', project: result.rows[0] });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
