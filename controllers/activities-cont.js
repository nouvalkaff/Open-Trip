// REQUIRE MODEL
const { Activities, Trips } = require("../models");
const jwt = require("jsonwebtoken");

exports.getAllActivities = async (req, res) => {
  try {
    const allActivities = await Activities.findAll();

    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Get All Activites Success",
      result: allActivities,
    });
  } catch (err) {
    res.status(
      500({
        code: 500,
        statusText: "Internal server error",
        success: false,
        message: "Cant retrieve Activities data",
      })
    );
  }
};

exports.getActivities = async (req, res) => {
  const idInput = req.query.id;
  try {
    const oneActivities = await Activities.findOne({
      where: {
        id: idInput,
      },
    });

    if (!oneActivities) {
      res.status(404).json({
        code: 404,
        statusText: "Not found",
        success: false,
        message: `Activities data with ID: ${idInput} not found`,
      });
    }

    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Successfully retrieve Activities data",
      result: oneActivities,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Cannot get Activities data",
    });
  }
};

exports.createActivities = async (req, res) => {
  try {
    const {
      day1,
      time1,
      do1,
      time2,
      do2,
      time3,
      do3,
      time4,
      do4,
      day2,
      time5,
      do5,
      time6,
      do6,
      time7,
      do7,
      time8,
      do8,
      day3,
      time9,
      do9,
      time10,
      do10,
      time11,
      do11,
      time12,
      do12,
      trip_id,
    } = req.body;

    const day_time_act = [];

    const tact1 = {},
      tact2 = {},
      tact3 = {},
      tact4 = {},
      activity1 = [],
      object1 = {};

    const tact5 = {},
      tact6 = {},
      tact7 = {},
      tact8 = {},
      activity2 = [],
      object2 = {};

    const tact9 = {},
      tact10 = {},
      tact11 = {},
      tact12 = {},
      activity3 = [],
      object3 = {};

    tact1.time = time1;
    tact1.do = do1;
    tact2.time = time2;
    tact2.do = do2;
    tact3.time = time3;
    tact3.do = do3;
    tact4.time = time4;
    tact4.do = do4;

    tact5.time = time5;
    tact5.do = do5;
    tact6.time = time6;
    tact6.do = do6;
    tact7.time = time7;
    tact7.do = do7;
    tact8.time = time8;
    tact8.do = do8;

    tact9.time = time9;
    tact9.do = do9;
    tact10.time = time10;
    tact10.do = do10;
    tact11.time = time11;
    tact11.do = do11;
    tact12.time = time12;
    tact12.do = do12;

    activity1.push(tact1, tact2, tact3, tact4);
    activity2.push(tact5, tact6, tact7, tact8);
    activity3.push(tact9, tact10, tact11, tact12);

    object1.day = day1;
    object1.activity = activity1;
    object2.day = day2;
    object2.activity = activity2;
    object3.day = day3;
    object3.activity = activity3;

    day_time_act.push(object1, object2, object3);

    await Activities.create({
      ...req.body,
      day_time_act: day_time_act,
    });

    const findAct = await Activities.findOne({
      where: {
        trip_id: trip_id,
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    return res.status(201).json({
      code: 201,
      statusText: "Created",
      success: true,
      message: "Successfully added new Activities",
      result: findAct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Failed to created new Activities. Please try again",
    });
  }
};

exports.updateActivities = async (req, res) => {
  try {
    const activitiesId = req.query.id;

    const findOneActivities = await Activities.findOne({
      where: {
        id: activitiesId,
      },
    });
    const updateActivities = await Activities.update(req.body, {
      where: {
        id: activitiesId,
      },
    });

    if (!findOneActivities) {
      res.status(404).json({
        code: 404,
        statusText: "Not found",
        success: false,
        message: `Activities with ID ${activitiesId} is not found`,
      });
    } else {
      res.status(200).json({
        code: 200,
        statusText: "OK",
        success: true,
        message: `Successfully updated activities with ID: ${activitiesId}`,
        result: updateActivities,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Failed to pdate Activities. Please try again",
    });
  }
};

exports.deleteActivities = async (req, res) => {
  try {
    const activitesId = req.query.id;

    const findOneActivities = await Activities.findOne({
      where: {
        id: activitesId,
      },
    });

    const deleteActivities = await Activities.destroy({
      where: {
        id: activitesId,
      },
    });

    if (!findOneActivities) {
      res.status(404).json({
        code: 404,
        statusText: "Not found",
        success: false,
        message: `Activities with ID: ${activitesId} is not found`,
      });
    }

    if (deleteActivities) {
      res.status(200).json({
        code: 200,
        statusText: "OK",
        success: true,
        message: `Activities with ID: ${activitesId} has successfully deleted`,
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
    });
  }
};
