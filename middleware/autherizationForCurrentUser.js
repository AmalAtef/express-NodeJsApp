const User = require("../model/User");
module.exports = todoId => async (req, res, next) => {
  console.log(todoId);
  const todo = User.findOne({ _id: todoId });
  req.user = await User.getUserFromToken(autherization);
  if (req.user._id != todo.userId) {
    const error = new CustomError("Validation Error", 422, errors.mapped());
    return next(error);
  }
  next();
};
