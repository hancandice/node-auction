const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const { sequelize } = require("./models");
const indexRouter = require("./routes/index");

const app = express();

app.set("port", process.env.PORT || 8010);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database connection success. 💾");
  })
  .catch((error) => {
    console.log({ error });
  });

app.use(morgan("dev"));

app.use("/", indexRouter);

//-*-*-* When there's no corresponding router -> Error handling *-*-*-//
app.use((req, _res, next) => {
  const routerErr = new Error(`No router for ${req.method} ${req.url} 🥲`);
  routerErr.status = 404;
  next(routerErr);
});

app.use((err, _req, res, _next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV != "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log("waiting on port ⛴ ", app.get("port"));
});
