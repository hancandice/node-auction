
const { Op } = require("sequelize")
const { Good, Auction, User, sequelize } = require("./models")

module.exports = async () => {
    try {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const targets = await Good.findAll({
            where: {
                SoldId: null,
                createdAt: { [Op.lte]: yesterday },
            }
        })
        targets.forEach(async (target) => {
            const success = await Auction.findOne({
                where: { GoodId: target.id },
                order: [["bid", "DESC"]],
            })
            if (success) {
                await Good.update({ SoldId: success.UserId }, { where: { id: target.id } })
                await User.update({
                    money: sequelize.literal(`money - ${success.bid}`),
                    where: { id: success.UserId }
                })
            } else {
                await Good.destroy({ where: { id: target.id } })
            }
        })
    } catch (err) {
        console.error({ err })
    }
}
