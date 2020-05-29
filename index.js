const express = require("express");
const userRouter = require("./router/user");
const todoRouter = require("./router/Blog");
const { port, CLOUD_NAME, API_KEY, API_SECRET } = require("./config");
const cors = require("cors");
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});
require("./db");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/Blogs", todoRouter);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  const handleError = err.statusCode < 500;
  res.status(err.statusCode).send({
    message: handleError ? err.message : "somthing wrong",
    errors: err.errors || {}
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
