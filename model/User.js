const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const util = require("util");
const { saltRounds, jwtSecret } = require("../config");

const signJWT = util.promisify(jwt.sign);
const verifyJWT = util.promisify(jwt.verify);

const schema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 15
    },
    age: {
      type: Number,
      min: 13
    }
  },
  {
    toJSON: {
      transform: (doc, res) => _.omit(res, ["__v", "password"])
    }
  }
);
schema.pre("save", async function() {
  const currentDocument = this;
  if (currentDocument.isModified("password")) {
    currentDocument.password = await bcrypt.hash(
      currentDocument.password,
      Number(saltRounds)
    );
    console.log(currentDocument);
  }
});

schema.methods.checkPassword = function(plainPassword) {
  const currentDocument = this;
  return bcrypt.compare(plainPassword, currentDocument.password);
};

schema.methods.generateToken = function() {
  const currentDocument = this;
  return signJWT({ id: currentDocument.id }, jwtSecret, {
    expiresIn: "2h"
  });
};

schema.statics.getUserFromToken = async function(token) {
  const User = this;
  const { id } = await verifyJWT(token, jwtSecret);
  const user = await User.findById(id);
  return user;
};

const User = mongoose.model("User", schema);
module.exports = User;
