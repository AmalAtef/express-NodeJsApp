const express = require("express");
const Todo = require("../model/todo");
const User = require("../model/User");
const authenticationMiddleware = require("../middleware/authentication");
const asyncRouterWrapper = require("../middleware/asyncRouterWrapper");
const autherizationForCurrentUser = require("../middleware/autherizationForCurrentUser");
const router = express.Router();

router.post(
  "/",
  authenticationMiddleware,
  asyncRouterWrapper(async (req, res) => {
    // const UserFounded = await User.findOne({ userName: req.body.userName });
    const Newtodo = new Todo({
      userId: req.user._id,
      title: req.body.title,
      tags: req.body.tags
    });
    await Newtodo.save();
    res.status(200).send(Newtodo);
  })
);

router.get(
  "/:userId",
  authenticationMiddleware,
  autherizationForCurrentUser,
  asyncRouterWrapper(async (req, res) => {
    const userTodos = await Todo.find({
      userId: req.params.userId
    });
    res.status(200).send({
      message: `TODOs of User : ${userTodos}`
    });
  })
);

router.patch(
  "/:id",
  authenticationMiddleware,
  autherizationForCurrentUser,
  asyncRouterWrapper(async (req, res, next) => {
    await User.update(
      { _id: req.params.id },
      { $set: { title: req.body.title } }
    );
    res.status(200).send({
      message: `todo edited successfully `
    });
  })
);
router.delete(
  "/:id",
  authenticationMiddleware,
  autherizationForCurrentUser,
  asyncRouterWrapper(async (req, res, next) => {
    await Todo.deleteOne({ _id: req.params.id });
    res.status(200).send({
      message: `the todo with selected  deleted successfully`
    });
  })
);

module.exports = router;
