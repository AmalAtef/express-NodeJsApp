module.exports = async (req, res, next) => {
  try {
    const autherization = req.headers.autherization;
    if (!autherization) throw new Error("Autherzation required");
    req.user = await User.getUserFromToken(autherization);
    if (!req.user) throw new Error("Autherzation required");
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};
