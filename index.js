const express = require("express");
const userRouter = require("./router/user");
const todoRouter = require("./router/todo");
const { port } = require("./config");
require("./db");
const app = express();

app.use(express.json());

app.use("/users", userRouter);
app.use("/todos", todoRouter);

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
