const express = require("express");
const Blog = require("../model/Blog");
const User = require("../model/User");
const authenticationMiddleware = require("../middleware/authentication");
const asyncRouterWrapper = require("../middleware/asyncRouterWrapper");
const autherizationForCurrentUser = require("../middleware/autherizationForCurrentUser");
const router = express.Router();
const uploadMiddleware = require("../middleware/upload");
const cloudinary = require("cloudinary");

router.post(
  "/",
  authenticationMiddleware,
  uploadMiddleware.single("imgPath"),
  asyncRouterWrapper(async (req, res, next) => {
    const { title, body, tags } = req.body;
    const blog = new Blog({ title, body, tags });
    blog.auther = req.user._id;
    if (req.file) {
      const res = await cloudinary.v2.uploader.upload(req.file.path);
      blog.imgPath = res.secure_url;
    }
    await blog.save();
    res.status(201).send({ blog, message: "Blog added successfully" });
  })
);
//get Blogs By search or latest
router.get(
  "/",
  async (req, res, next) => {
    if (req.query.type) return authenticationMiddleware(req, res, next);
    next();
  },
  asyncRouterWrapper(async (req, res, next) => {
    const TypeOfSearch = req.query.type;
    const valueOfSearch = req.query.value;
    if (TypeOfSearch === "auther") {
      const user = await User.findOne({ $text: { $search: valueOfSearch } });
      const totalNumOfBlogs = await Blog.countDocuments({ auther: user._id });
      const Blogs = await Blog.find({ auther: user._id })
        .populate({
          path: "auther",
          select: "_id firstName lastName email followedUsers aboutU"
        })
        .sort({ _id: -1 })
        .skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
        .limit(parseInt(req.query.size));
      res.send({ Blogs, totalNumOfBlogs });
    } else if (TypeOfSearch === "title" || TypeOfSearch === "tag") {
      const Blogs = await Blog.find({ $text: { $search: valueOfSearch } })
        .sort({ _id: -1 })
        .skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
        .limit(parseInt(req.query.size))
        .populate({
          path: "auther",
          select: "_id firstName lastName email followedUsers aboutU"
        });
      const totalNumOfBlogs = await Blog.countDocuments({
        $text: { $search: valueOfSearch }
      });
      res.send({ Blogs, totalNumOfBlogs });
    } else {
      const totalNumOfBlogs = await Blog.countDocuments();
      const Blogs = await Blog.find({})
        .sort({ _id: -1 })
        .skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
        .limit(parseInt(req.query.size))
        .populate({
          path: "auther",
          select: "_id firstName lastName email followedUsers aboutU"
        });
      res.send({ Blogs, totalNumOfBlogs });
    }
  })
);

//get followed authors blogs
router.get(
  "/followedUsers",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res) => {
    const totalNumOfBlogs = await Blog.countDocuments({
      auther: req.user.followedUsers
    });
    const blogs = await Blog.find({ auther: req.user.followedUsers })
      .sort({ _id: -1 })
      .skip((parseInt(req.query.pageNum) - 1) * parseInt(req.query.size))
      .limit(parseInt(req.query.size))
      .populate({
        path: "auther",
        select: "_id firstName lastName email followedUsers aboutU"
      });
    res.json({ blogs, totalNumOfBlogs });
  })
);

//get Blog By Id
router.get(
  "/:id",
  asyncRouterWrapper(async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate({
      path: "auther",
      select: "_id firstName lastName email followedUsers aboutU"
    });
    res.json({ blog });
  })
);

//get Blogs of specific user
router.get(
  "/user/:userId",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res) => {
    const totalNumOfBlogs = await Blog.countDocuments({
      auther: req.params.userId
    });
    const userBlogs = await Blog.find({
      auther: req.params.userId
    })
      .sort({ updatedAt: -1 })
      .skip((req.query.pageNum - 1) * req.query.size)
      .limit(parseInt(req.query.size))
      .populate({
        path: "auther",
        select: "_id firstName lastName email followedUsers aboutU"
      });
    res.status(200).send({
      userBlogs: userBlogs,
      totalNumOfBlogs
    });
  })
);

//Edit Blog
router.patch(
  "/:id",
  authenticationMiddleware,
  uploadMiddleware.single("imgPath"),
  asyncRouterWrapper(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    Object.keys(req.body).map(key => (blog[key] = req.body[key]));
    if (req.file) {
      const res = await cloudinary.v2.uploader.upload(req.file.path);
      blog.imgPath = res.secure_url;
    }

    await blog.save();

    res.status(200).send({ message: "Blog edited successfully", blog });
  })
);

//Delete Blog
router.delete(
  "/:id",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res) => {
    await Blog.deleteOne({ _id: req.params.id });
    res.status(200).send({ message: "Blog deleted successfully" });
  })
);

module.exports = router;
