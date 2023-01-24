const { Router } = require("express");
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const { Good, User, Auction, sequelize } = require("../models");
const { checkNotLoggedIn, checkLoggedIn } = require("./middlewares");
const schedule = require("node-schedule")


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
    const good = await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price
    })
    const end = new Date()
    end.setDate(end.getDate() + 1)
    schedule.scheduleJob(end, async () => {
      const success = await Auction.findOne({
        where: { GoodId: good.id },
        order: [["bid", "DESC"]]
      })
      await Good.update({ SoldId: success.UserId }, { where: { id: good.id } })
      await User.update({
        money: sequelize.literal(`money - ${success.bid}`),
        where: { id: success.UserId }
      })
    })
    res.redirect("/")
  } catch (err) {
    console.error({ err })
    next(err)
  }
})

router.get("/good/:id", checkLoggedIn, async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: {
          model: User,
          as: "Owner"
        }
      }),
      Auction.findAll({
        where: { GoodId: req.params.id },
        include: { model: User },
        order: [["bid", "ASC"]]
      })
    ])
    res.render("auction", {
      title: `${good.name} - Auction`,
      good,
      auction
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
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]]
    })
    if (good.price >= bid) {
      return res.status(403).send("You must bid above the starting price.")
    }
    if (new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {
      return res.status(403).send("Auction has already ended.")
    }
    if (good.Auctions[0] && good.Auctions[0].bid >= bid) {
      return res.status(403).send("Your bid must be higher than the current bid.")
    }
    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id
    })
    req.app.get("io").to(req.params.id).emit("bid", {
      bid: result.bid,
      msg: result.msg,
      nickname: req.user.nickname
    })
    return res.send("ok")
  } catch (error) {
    console.error({ error })
    return next(error)
  }
})

router.get("/list", checkLoggedIn, async (req, res, next) => {
  try {
    const goods = await Good.findAll({
      where: { SoldId: req.user.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]]
    })
    res.render("list", { title: "Winning bid list 🏆", goods })
  } catch (err) {
    console.error({ err })
    next(err)
  }
})

module.exports = router;
