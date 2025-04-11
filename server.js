const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = 5000;
const server = express();
const taskRoutes = require('./routes/task.auth');

server.use(express.static(path.join(__dirname, 'public')));
server.use(cors());
server.use(express.json());
server.use('/api', taskRoutes);

server.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});