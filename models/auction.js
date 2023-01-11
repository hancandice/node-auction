const { Model, STRING, INTEGER } = require("sequelize");

module.exports = class Auction extends Model {
  static init(sequelize) {
    return super.init(
      {
        bid: {
          type: INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        msg: {
          type: STRING(100),
          allowNull: true,
        },
      },
      {
        sequelize,
        paranoid: true,
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );
  }

  static associate(db) {
    db.Auction.belongsTo(db.User);
    db.Auction.belongsTo(db.Good);
  }
};
