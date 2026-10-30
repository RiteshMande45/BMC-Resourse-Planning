/**
 * Global Express error handler.
 * Called when a route does next(err) or throws inside async code.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;

  // Always log in development; in prod log 5xx only
  if (process.env.NODE_ENV !== 'production' || status >= 500) {
    console.error(
      `[${new Date().toISOString()}] ${status} ${req.method} ${req.path} —`,
      err.message
    );
  }

  res.status(status).json({
    error: {
      message:
        process.env.NODE_ENV === 'production' && status >= 500
          ? 'Internal server error'
          : err.message,
      status,
    },
  });
}

module.exports = { errorHandler };
