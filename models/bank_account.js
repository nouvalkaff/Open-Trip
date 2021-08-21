"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bank_Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Users, {
        foreignKey: "user_id",
      }),
        this.belongsTo(models.Master_Bank_Account, {
          foreignKey: "master_bank_account_id",
        });
    }
  }
  Bank_Account.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      users_payment_method_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      master_bank_account_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      account_number: {
        type: DataTypes.STRING,
      },
      book_account_pic: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
    },
    {
      sequelize,
      modelName: "Bank_Account",
      tableName: "Bank_Account",
    }
  );
  return Bank_Account;
};
