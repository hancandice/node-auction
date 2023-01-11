const { Model, STRING, INTEGER } = require("sequelize");

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: STRING(40),
          allowNull: false,
          unique: true,
        },
        password: {
          type: STRING(100),
          allowNull: true,
        },
        nickname: {
          type: STRING(15),
          allowNull: false,
        },
        money: {
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
    db.User.hasMany(db.Auction);
  }
};
