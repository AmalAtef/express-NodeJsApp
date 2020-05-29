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
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "minimum length of Password 8"]
    },
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 15
    },
    lastName: {
      type: String,
      minlength: 3,
      maxlength: 15
    },
    imgPath: {
      type: String
    },
    aboutU: {
      type: String
    },
    followedUsers: { type: [mongoose.Schema.Types.ObjectId], ref: "User" }
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
  }
});

schema.methods.checkPassword = function(plainPassword) {
  const currentDocument = this;
  return bcrypt.compare(plainPassword, currentDocument.password);
};

schema.methods.generateToken = function() {
  const currentDocument = this;
  return signJWT(
    { id: currentDocument.id },
    jwtSecret
    //  , { expiresIn: "20m"}
  );
};

schema.statics.getUserFromToken = async function(token) {
  const User = this;
  const { id } = await verifyJWT(token, jwtSecret);
  const user = await User.findById(id);
  return user;
};

const User = mongoose.model("User", schema);
module.exports = User;
