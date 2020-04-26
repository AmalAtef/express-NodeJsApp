const mongoose = require("mongoose");
const { mongoURI } = require("./config");
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Success Connection");
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

module.exports = mongoose;
