const express = require("express");
const User = require("../model/User");
const Blog = require("../model/Blog");
const CustomError = require("../helpers/customError");
const { check } = require("express-validator");
const validateResults = require("../middleware/ValidateResult");
const authenticationMiddleware = require("../middleware/authentication");
const asyncRouterWrapper = require("../middleware/asyncRouterWrapper");
const router = express.Router();
const uploadMiddleware = require("../middleware/upload");
const cloudinary = require("cloudinary");

//Register
router.post(
  "/register",
  validateResults([
    check("email").isEmail(),
    check("password").isLength({ min: 8 })
  ]),
  asyncRouterWrapper(async (req, res, next) => {
    const createdUser = new User({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      aboutU: req.body.aboutU,
      followedUsers: []
    });
    const user = await createdUser.save();

    res.status(200).send({
      user,
      message: `User ${req.body.firstName} was registered successfully`
    });
  })
);

//Login
router.post(
  "/login",
  validateResults([
    check("email").isEmail(),
    check("password").isLength({ min: 8 })
  ]),
  asyncRouterWrapper(async (req, res, next) => {
    //login with email and password
    //find user in DB
    const userFound = await User.findOne({
      email: req.body.email
    });
    // CheckPassword
    const isMatch = await userFound.checkPassword(req.body.password);
    if (userFound != null && isMatch) {
      //generate jwt
      const token = await userFound.generateToken();
      //send to user
      return res.json({
        token,
        userFound,
        message: `logged in successfully ${req.body.email}`
      });
    } else {
      return res.json({ message: `invalid credentials ` });
    }
  })
);

// Get specific User
router.get(
  "/:id?",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res, next) => {
    let user = req.user;
    if (req.params.id) {
      user = await User.findOne({
        _id: req.params.id
      });
    }
    if (!user) res.status(404).send({ message: "User not found" });
    res.status(200).send({ user });
  })
);

// Follow specific User
router.post(
  "/follow/:id",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res, next) => {
    if (req.user.followedUsers.indexOf(req.params.id) !== -1) {
      return res.status(400).send({ message: "User already followed" });
    }
    await User.updateOne(
      { email: req.user.email },
      { $push: { followedUsers: req.params.id } }
    );
    res.status(200).send({
      message: "success follow User"
    });
  })
);

// unFollow specific User
router.post(
  "/unfollow/:id",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res, next) => {
    if (req.user.followedUsers.indexOf(req.params.id) === -1) {
      return res.status(400).send({ message: "User already Unfollowed" });
    }

    await User.updateOne(
      { email: req.user.email },
      { $pull: { followedUsers: req.params.id } }
    );
    res.status(200).send({
      message: "success unfollow User"
    });
  })
);

//Edit current User
router.patch(
  "/",
  authenticationMiddleware,
  uploadMiddleware.single("imgPath"),
  asyncRouterWrapper(async (req, res, next) => {
    const activeUser = await User.findById(req.user._id);
    Object.keys(req.body).map(key => (activeUser[key] = req.body[key]));

    if (req.file) {
      const res = await cloudinary.v2.uploader.upload(req.file.path);
      blog.imgPath = res.secure_url;
    }

    await activeUser.save();
    res.status(200).send({
      message: `message:user was edited successfully ${activeUser} `
    });
  })
);

//Delete current User
router.delete(
  "/",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res, next) => {
    //delete user's Blogs
    await Blog.deleteMany({ auther: req.user._id });
    //delete user
    await User.deleteOne({ _id: req.user._id });
    res.status(200).send({
      message: `the user with selected id deleted successfully`
    });
  })
);

module.exports = router;
