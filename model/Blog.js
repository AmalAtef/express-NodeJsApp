const mongoose = require("mongoose");
const _ = require("lodash");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true
    },
    body: {
      type: String,
      required: true
    },
    imgPath: {
      type: String
    },
    auther: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tags: {
      type: [String]
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => _.omit(ret, ["__v"])
    }
  }
);

const Blog = mongoose.model("Blog", schema);
module.exports = Blog;
