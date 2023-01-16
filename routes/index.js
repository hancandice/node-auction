const { Router } = require("express");
const { Good } = require("../models");
const { checkSignedUp } = require("./middlewares");

const router = Router();

router.use((req, res, next) => {
  console.log({ req, res })
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

router.get("/join", async (req, res, next) => {
  res.render("join", {
    title: "Sign up for Auction 😉"
  });
});

module.exports = router;
