"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Master_Bank_Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.Bank_Account, {
        foreignKey: "master_bank_account_id",
      });
    }
  }
  Master_Bank_Account.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      bank_name: {
        type: DataTypes.STRING,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
    },
    {
      sequelize,
      modelName: "Master_Bank_Account",
      tableName: "Master_Bank_Account",
    }
  );
  return Master_Bank_Account;
};
