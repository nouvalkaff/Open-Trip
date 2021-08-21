"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Trips", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      category_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
      },
      trip_name: {
        type: Sequelize.STRING,
        unique: true,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      trip_date_1: {
        type: Sequelize.STRING,
      },
      datestamp_1: {
        type: Sequelize.INTEGER,
      },
      trip_date_2: {
        type: Sequelize.STRING,
      },
      datestamp_2: {
        type: Sequelize.INTEGER,
      },
      trip_date_3: {
        type: Sequelize.STRING,
      },
      datestamp_3: {
        type: Sequelize.INTEGER,
      },
      trip_date_array: {
        type: Sequelize.ARRAY(Sequelize.JSONB),
      },
      duration_trip: {
        type: Sequelize.INTEGER,
      },
      pick_spot: {
        type: Sequelize.STRING,
        defaultValue: "Indonesia",
      },
      coordinate: {
        type: Sequelize.STRING,
      },
      quota: {
        type: Sequelize.INTEGER,
      },
      term_and_condition: {
        type: Sequelize.TEXT,
      },
      thumbnail_pict: {
        type: Sequelize.STRING,
      },
      pict_1: {
        type: Sequelize.STRING,
      },
      pict_2: {
        type: Sequelize.STRING,
      },
      pict_3: {
        type: Sequelize.STRING,
      },
      pict_4: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Trips");
  },
};
