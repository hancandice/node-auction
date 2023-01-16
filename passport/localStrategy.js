const { compare } = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const isCorrectPassword = await compare(password, exUser.password);
            if (isCorrectPassword) {
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
