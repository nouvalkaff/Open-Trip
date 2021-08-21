"use strict";
const { Model } = require("sequelize");
const moment = require("moment");
moment.locale("id");
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //   this.hasMany(models.Destination,{
      //     foreignKey: 'categories_id'
      //   })
    }
  }
  Orders.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      order_no: {
        type: DataTypes.STRING,
        unique: true,
      },
      trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      user_payment_method_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      order_status: {
        type: DataTypes.STRING,
      },
      date_order: {
        type: DataTypes.STRING,
      },
      total_price: {
        type: DataTypes.INTEGER,
      },
      qty: {
        type: DataTypes.INTEGER,
      },
      payment_status: {
        type: DataTypes.STRING,
      },
      voucher_code: {
        type: DataTypes.STRING,
      },
      due_date: {
        type: DataTypes.STRING,
      },
      payment_ways: {
        type: DataTypes.STRING
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
      modelName: "Orders",
      tableName: "Orders",
    }
  );
  return Orders;
};
