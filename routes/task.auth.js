const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'PasinduDev678',
    database: 'todo_app'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create tasks table if it doesn't exist
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating tasks table:', err);
        } else {
            console.log('Tasks table created or already exists');
        }
    });
});

// GET all tasks
router.get('/tasks', (req, res) => {
    const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ error: 'Failed to fetch tasks' });
        }
        
        // Transform data to include status color for frontend
        const transformedResults = results.map(task => {
            const statusColor = task.status === 'Completed' ? 'bg-success' : 'bg-warning';
            const textColor = task.status === 'Completed' ? '' : 'text-dark';
            
            return {
                ...task,
                statusColor,
                textColor
            };
        });
        
        res.json(transformedResults);
    });
});

// POST new task
router.post('/tasks', (req, res) => {
    const { title } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    const query = 'INSERT INTO tasks (title) VALUES (?)';
    
    db.query(query, [title], (err, result) => {
        if (err) {
            console.error('Error creating task:', err);
            return res.status(500).json({ error: 'Failed to create task' });
        }
        
        res.status(201).json({
            id: result.insertId,
            title,
            status: 'Pending'
        });
    });
});

// PUT mark task as complete
router.put('/tasks/:id/complete', (req, res) => {
    const query = 'UPDATE tasks SET status = "Completed" WHERE id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error completing task:', err);
            return res.status(500).json({ error: 'Failed to complete task' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ id: req.params.id, status: 'Completed' });
    });
});

// DELETE task
router.delete('/tasks/:id', (req, res) => {
    const query = 'DELETE FROM tasks WHERE id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).json({ error: 'Failed to delete task' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    });
});

module.exports = router;
