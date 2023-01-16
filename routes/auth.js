const { hash } = require("bcrypt");
const { Router } = require("express");
const passport = require("passport");
const { User } = require("../models")

const router = Router()

router.post("/join", async (req, res, next) => {
    const { email, nickname, password, money } = req.body
    console.log({ email, nickname, password, money })
    try {
        const exUser = await User.findOne({ where: { email } })
        if (exUser) {
            console.log({ exUser })
            return res.redirect("/join?joinError=This email is already registered email. 🤭 Please use a different email address.")
        }
        const hashed = await hash(password, 12)
        await User.create({
            email,
            password: hashed,
            nickname,
            money
        })
        return res.redirect("/")
    } catch (error) {
        console.error({ error })
        return next(error)
    }
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (authError, user, info) => {
        if (authError) {
            console.error({ authError })
            return next(authError)
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`)
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error({ loginError })
                return next(loginError)
            }
            return res.redirect("/")
        })
    })(req, res, next) // middleware in middleware
})

module.exports = router