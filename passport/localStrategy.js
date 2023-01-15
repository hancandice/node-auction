const { compare } = require("bcrypt");
const { use } = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { User } = require("../models");

module.exports = () => {
  use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const isLoggedIn = await compare(password, exUser.password);
            if (isLoggedIn) {
              done(null, exUser);
            } else {
              done(null, false, { message: "Password not correct." });
            }
          } else {
            done(null, false, {
              message: "No matching credentials. Please sign up.",
            });
          }
        } catch (error) {
          console.log({ error });
          done(error);
        }
      }
    )
  );
};
