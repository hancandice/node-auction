const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const passport = require("passport");
const { sequelize } = require("./models");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth")
const passportConfig = require("./passport");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const session = require("express-session");
const path = require("path")
const sse = require("./sse")
const webSocket = require("./socket")
const checkAuction = require("./checkAuction")


dotenv.config()

const app = express();
passportConfig()
checkAuction()

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
app.use(express.static(path.join(__dirname, "public")))
app.use("/img", express.static(path.join(__dirname, "uploads")))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }),
);

app.use(passport.initialize()); // add passport config at req obj
app.use(passport.session()); // save passport info at req.session obj

app.use("/", indexRouter);
app.use("/auth", authRouter)

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

const server = app.listen(app.get("port"), () => {
  console.log("waiting on port ⛴ ", app.get("port"));
});

webSocket(server, app)
sse(server)
