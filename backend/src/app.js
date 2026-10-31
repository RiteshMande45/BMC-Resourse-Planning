const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// ── Security & logging ─────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// ── Body parsers ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────
app.use('/', routes);

// ── Error handlers (must be last) ─────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
