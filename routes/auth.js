const { hash } = require("bcrypt");
const { Router } = require("express");
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

module.exports = router