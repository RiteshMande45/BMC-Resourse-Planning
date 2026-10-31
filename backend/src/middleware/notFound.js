/**
 * 404 handler — catches any request that didn't match a route.
 * Must be mounted AFTER all other routes in app.js.
 */
function notFound(req, res) {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      status: 404,
    },
  });
}

module.exports = { notFound };
