const passport = require("passport")
const { User } = require("../models")
const localStrategy = require("./localStrategy")

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        User.findOne({ where: { id } }).then(user => done(null, user)).catch(err => done(err))
    })
    localStrategy()
}