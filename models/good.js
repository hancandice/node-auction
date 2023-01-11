const { Model, STRING, INTEGER } = require("sequelize");

module.exports = class Good extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: STRING(40),
          allowNull: false,
        },
        img: {
          type: STRING(200),
          allowNull: true,
        },
        price: {
          type: INTEGER,
          allowNull: false,
          defaultValue: 0,
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
    db.Good.belongsTo(db.User, { as: "Owner" });
    db.Good.belongsTo(db.User, { as: "Sold" });
    db.Good.hasMany(db.Auction);
  }
};
