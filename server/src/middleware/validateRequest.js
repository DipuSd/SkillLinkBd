const { validationResult } = require("express-validator");
const createError = require("http-errors");

module.exports = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // eslint-disable-next-line no-console
    console.error("Validation errors:", result.array());
    const errors = result.array();
    const errorMessages = errors.map((err) => `${err.param}: ${err.msg}`).join(", ");
    const error = createError(422, `Validation failed: ${errorMessages}`);
    error.errors = errors;
    return next(error);
  }
  return next();
};
