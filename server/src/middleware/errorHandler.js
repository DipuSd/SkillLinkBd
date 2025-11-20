// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error("Error Handler:", {
      status,
      message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });
  }

  res.status(status).json({
    message,
    status,
    ...(err.errors ? { errors: err.errors } : {}),
  });
};
