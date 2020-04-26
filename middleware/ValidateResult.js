const { validationResult } = require("express-validator");
const CustomError = require("../helpers/customError");
module.exports = validattorArray => async (req, res, next) => {
  const promises = validattorArray.map(validator => validator.run(req));
  await Promise.all(promises);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new CustomError("Validation Error", 422, errors.mapped());
    return next(error);
  }
  next();
};
