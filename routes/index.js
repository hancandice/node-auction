const { Router } = require("express");
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


router.post("/good", checkLoggedIn, (req, res, next) => {

  try {

    const body = req.body
    console.log({ body })

  } catch (err) {

  }

})

module.exports = router;
