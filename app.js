const express = require("express");
const { sequelize } = require("./models");

const app = express();

app.set("port", process.env.PORT || 8010);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database connection success.");
  })
  .catch((error) => {
    console.log({ error });
  });

app.listen(app.get("port"), () => {
  console.log("waiting on port ", app.get("port"));
});
