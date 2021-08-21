"use strict";
const moment = require("moment");
moment.locale("id");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      trip_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      user_payment_method_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      order_no: {
        type: Sequelize.STRING,
      },
      order_status: {
        type: Sequelize.STRING,
      },
      date_order: {
        type: Sequelize.STRING,
      },
      total_price: {
        type: Sequelize.INTEGER,
      },
      qty: {
        type: Sequelize.INTEGER,
      },
      payment_status: {
        type: Sequelize.STRING,
      },
      voucher_code: {
        type: Sequelize.STRING,
      },
      due_date: {
        type: Sequelize.STRING,
      },
      payment_ways: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Orders");
  },
};
