const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const allocationRoutes = require('./routes/allocationRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/allocations', allocationRoutes);

app.get('/', (req, res) => {
   res.json({ message: 'BMC Resource Planning API is running successfully!' });
});

app.use((req, res, next) => {
   res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
