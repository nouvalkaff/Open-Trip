"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Trips extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Activities, {
        foreignKey: "trip_id",
      }),
        this.belongsTo(models.Categories, {
          foreignKey: "category_id",
        });
    }
  }
  Trips.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      category_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      trip_name: {
        type: DataTypes.STRING,
        unique: true,
      },
      price: {
        type: DataTypes.INTEGER,
      },
      trip_date_1: {
        type: DataTypes.STRING,
      },
      datestamp_1: {
        type: DataTypes.INTEGER,
      },
      trip_date_2: {
        type: DataTypes.STRING,
      },
      datestamp_2: {
        type: DataTypes.INTEGER,
      },
      trip_date_3: {
        type: DataTypes.STRING,
      },
      datestamp_3: {
        type: DataTypes.INTEGER,
      },
      trip_date_array: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
      },
      duration_trip: {
        type: DataTypes.INTEGER,
      },
      pick_spot: {
        type: DataTypes.STRING,
        defaultValue: "Indonesia",
      },
      coordinate: {
        type: DataTypes.STRING,
      },
      quota: {
        type: DataTypes.INTEGER,
      },
      term_and_condition: {
        type: DataTypes.TEXT,
      },
      thumbnail_pict: {
        type: DataTypes.STRING,
      },
      pict_1: {
        type: DataTypes.STRING,
      },
      pict_2: {
        type: DataTypes.STRING,
      },
      pict_3: {
        type: DataTypes.STRING,
      },
      pict_4: {
        type: DataTypes.STRING,
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
      modelName: "Trips",
      tableName: "Trips",
    }
  );
  return Trips;
};
