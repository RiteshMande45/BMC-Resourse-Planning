const pool = require('../config/db');

// Get all allocations (optional filter by project_id)
const getAllocations = async (req, res) => {
    const { project_id } = req.query;
    try {
        let query = 'SELECT * FROM allocations';
        let params = [];
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching allocations:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create a new resource allocation
const createAllocation = async (req, res) => {
    const { project_id, resource_name, role, allocation_percentage } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO allocations (project_id, resource_name, role, percent) VALUES ($1, $2, $3, $4) RETURNING *',
            [project_id, resource_name, role, allocation_percentage || 100]
        );
        res.status(201).json({ 
            message: 'Resource allocated successfully', 
            allocation: result.rows[0] 
        });
    } catch (error) {
        console.error('Error creating allocation:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete an allocation
const deleteAllocation = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM allocations WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Allocation not found' });
        res.status(200).json({ message: 'Resource allocation removed successfully' });
    } catch (error) {
        console.error('Error deleting allocation:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { getAllocations, createAllocation, deleteAllocation };
