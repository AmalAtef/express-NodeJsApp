const User = require("../model/User");
const Blog = require("../model/Blog");
module.exports = blogId => async (req, res, next) => {
  const blog = Blog.findOne({ _id: blogId });
  req.user = await User.getUserFromToken(autherization);
  if (req.user._id != blog.auther) {
    const error = new CustomError("Unauthorized user", 422, errors.mapped());
    return next(error);
  }
  next();
};
