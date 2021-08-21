"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      this.hasMany(models.Bank_Account, {
        foreignKey: "user_id",
      }),
        this.belongsTo(models.Users_Role, {
          foreignKey: "users_role_id",
        });
    }
  }
  Users.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      users_role_id: {
        type: DataTypes.STRING,
        foreignKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      fullname: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: DataTypes.STRING,
      identity_no: DataTypes.STRING,
      identity_pic: {
        type: DataTypes.STRING,
      },
      selfie_identity_pic: {
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
      modelName: "Users",
      tableName: "Users",
    }
  );
  return Users;
};
