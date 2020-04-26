const mongoose = require("mongoose");
const tag = new mongoose.Schema({
  item: {
    type: String,
    maxlength: 10
  }
});
const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 15,
    index: true
  },
  status: { type: String, default: "to-do" },
  tags: {
    array: [tag]
  },
  createdAt: {
    timestamps: Date
  },
  updatedAt: {
    timestamps: Date
  }
});

const Todo = mongoose.model("todo", schema);
module.exports = Todo;
