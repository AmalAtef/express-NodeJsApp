const express = require("express");
const User = require("../model/User");
const todo = require("../model/todo");
const CustomError = require("../helpers/customError");
const { check } = require("express-validator");
const validateResults = require("../middleware/ValidateResult");
const authenticationMiddleware = require("../middleware/authentication");
const asyncRouterWrapper = require("../middleware/asyncRouterWrapper");
const router = express.Router();

router.post(
  "/register",
  validateResults([
    check("userName").isEmail(),
    check("password").isLength({ min: 4 })
  ]),
  asyncRouterWrapper(async (req, res, next) => {
    const createdUser = new User({
      userName: req.body.userName,
      password: req.body.password,
      firstName: req.body.firstName,
      age: req.body.age
    });
    const user = await createdUser.save();
    res.status(200).send({ user, message: "user was registered successfully" });
  })
);
router.post(
  "/login",
  validateResults([
    check("userName").isEmail(),
    check("password").isLength({ min: 4 })
  ]),
  asyncRouterWrapper(async (req, res, next) => {
    //login with userName and password
    const userFound = await User.findOne({
      userName: req.body.userName
    });

    const isMatch = await userFound.checkPassword(req.body.password);
    const userTodos = await todo.find({
      userId: userFound._id
    });
    if (userFound != null && isMatch) {
      //generate jwt
      const token = await userFound.generateToken();
      //send to user
      res
        .status(200)
        .send({
          token,
          message: `logged in successfully ${req.body.userName} ${userTodos}`
        });
    } else {
      throw new CustomError("invalid credentials", 422);
    }
  })
);
router.get(
  "/",
  authenticationMiddleware,
  asyncRouterWrapper((req, res, next) => {
    res.status(200).send({
      message: `the first name of registered users : ${req.body.firstName}`
    });
  })
);
router.patch(
  "/",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res, next) => {
    await User.update(
      { _id: req.user._id },
      { $set: { userName: req.body.userName } }
    );
    const editedUser = await User.findOne({ _id: req.params.id });
    res.status(200).send({
      message: `message:user was edited successfully ${editedUser} `
    });
  })
);
router.delete(
  "/",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res, next) => {
    //console.log(req.user);
    await User.deleteOne({ _id: req.user._id });
    res.status(200).send({
      message: `the user with selected id deleted successfully`
    });
  })
);

module.exports = router;
