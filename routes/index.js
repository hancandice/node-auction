const { Router } = require("express");
const { Good } = require("../models");
const { checkSignedUp } = require("./middlewares");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const goods = await Good.findAll({ where: { SoldId: null } });
    res.render("main", {
      title: "Auction 🛍",
      goods,
    });
  } catch (error) {
    console.log({ error });
    next(error);
  }
});

router.get("/join", checkSignedUp, () => ({}));

module.exports = router;
