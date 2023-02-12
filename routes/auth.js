const { hash } = require("bcrypt");
const { Router } = require("express");
const passport = require("passport");
const { User } = require("../models");
const { checkLoggedIn, checkNotLoggedIn } = require("./middlewares");

const router = Router()

router.post("/join", checkNotLoggedIn, async (req, res, next) => {
    const { email, nickname, password, money } = req.body
    try {
        const exUser = await User.findOne({ where: { email } })
        if (exUser) {
            return res.redirect("/join?joinError=This email is already registered email. 🤭 Please use a different email address.")
        }
        const hashed = await hash(password, 12)
        await User.create({
            email,
            password: hashed,
            nickname,
            money
        })
        login(req, res, next)
    } catch (error) {
        console.error({ error })
        return next(error)
    }
})

const login = (req, res, next) => {
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
}

router.post("/login", (req, res, next) => {
    login(req, res, next)
})

router.get("/logout", checkLoggedIn, (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy()
        res.redirect('/');
    });
})

module.exports = router