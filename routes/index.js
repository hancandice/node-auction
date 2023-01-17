const { Router } = require("express");
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const { Good } = require("../models");
const { checkNotLoggedIn, checkLoggedIn } = require("./middlewares");

const router = Router();

router.use((req, res, next) => {
  res.locals.user = req.user
  next();
});

router.get("/", async (req, res, next) => {
  try {
    const goods = await Good.findAll({ where: { SoldId: null } });
    console.log({ goods });
    res.render("main", {
      title: "Auction 🛍",
      goods,
    });
  } catch (error) {
    console.log({ error });
    next(error);
  }
});

router.get("/join", checkNotLoggedIn, async (req, res, next) => {
  res.render("join", {
    title: "Sign up for Auction 😉"
  });
});

router.get("/good", checkLoggedIn, (req, res) => {
  res.render("good", { title: 'Register goods 🛍 - Auction' })
})

try {
  fs.readdirSync("uploads")
} catch (err) {
  console.error("Creating uploads folder...")
  fs.mkdirSync("uploads")
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, "uploads/")
    },
    filename(req, file, callback) {
      const ext = path.extname(file.originalname)
      callback(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext)
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.post("/good", checkLoggedIn, upload.single("img"), async (req, res, next) => {
  try {
    const { name, price } = req.body
    await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price
    })
    res.redirect("/")
  } catch (err) {
    console.error({ err })
    next(err)
  }

})

module.exports = router;
