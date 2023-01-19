const { Router } = require("express");
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const { Good, User, Auction } = require("../models");
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

router.get("/good/:id", checkLoggedIn, async (req, res, next) => {
  try {
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: {
        model: User,
        as: "Owner"
      }
    })
    res.render("auction", {
      title: `${good.name} - Auction`,
      good
    })
  } catch (error) {
    console.log({ error })
    next(error)
  }
})

router.post("/good/:id/bid", checkLoggedIn, async (req, res, next) => {
  try {
    const { bid, msg } = req.body
    const good = await Good.findOne({
      where: { id: req.params.id },
    })
    if (good.price >= bid) {
      return res.status(403).send("You must bid above the starting price.")
    }
    if (new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {
      return res.status(403).send("Auction has already ended.")
    }
    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id
    })
    return res.send("ok")
  } catch (error) {
    console.error({ error })
    return next(error)
  }
})

module.exports = router;
