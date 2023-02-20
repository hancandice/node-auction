const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const passport = require("passport");
const { sequelize } = require("./models");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth")
const passportConfig = require("./passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path")
const sse = require("./sse")
const webSocket = require("./socket")
const checkAuction = require("./checkAuction")

const sanitizeHtml = require("sanitize-html")

const html = "<script>location.href = 'http://localhost:8010'</script>"
console.log(sanitizeHtml(html)) // 사용자가 업로드한 html을 sanitize-html 함수로 감싸면 허용하지 않는 태그나 스크립트는 제거됨


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

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined")) // combined 모드는 dev 모드에 비해 사용자 로그를 더 남김
} else {
  app.use(morgan("dev"))
}
app.use(express.static(path.join(__dirname, "public")))
app.use("/img", express.static(path.join(__dirname, "uploads")))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}
if (process.env.NODE_ENV === "production") {
  sessionOption.proxy = true
  sessionOption.cookie.secure = true
}
app.use(session(sessionOption));
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
  res.locals.error = process.env.NODE_ENV === "production" ? {} : err;
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(app.get("port"), () => {
  console.log("waiting on port ⛴ ", app.get("port"));
});

webSocket(server, app)
sse(server)