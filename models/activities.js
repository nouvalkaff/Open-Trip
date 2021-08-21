"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Activities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Trips, {
        foreignKey: "trip_id",
      });
    }
  }
  Activities.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      day_time_act: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
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
      modelName: "Activities",
      tableName: "Activities",
    }
  );
  return Activities;
};
