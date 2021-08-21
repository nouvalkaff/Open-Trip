// REQUIRE MODEL
const { Categories, Trips } = require("../models");
const { Op } = require("sequelize");

exports.getAllCategory = async (req, res) => {
  try {
    const allCategory = await Categories.findAll({
      include: {
        model: Trips,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "datestamp_1",
            "datestamp_2",
            "datestamp_3",
          ],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      order: [["id", "ASC"]],
    }); // Include Destination/Trips (relation)

    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Successfully get All Category",
      result: allCategory,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.getCategory = async (req, res) => {
  const idInput = req.query.id;
  try {
    const oneCategory = await Categories.findOne({
      include: {
        model: Trips,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "datestamp_1",
            "datestamp_2",
            "datestamp_3",
          ],
        },
      },
      where: {
        id: idInput,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    }); // Include Destination/Trips (relation)

    if (!oneCategory) {
      res.status(404).json({
        code: 404,
        statusText: "OK",
        success: false,
        message: `Cannot found category with ID: ${idInput}`,
      });
    }

    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: `Successfully retrieve Category with ID: ${idInput}`,
      result: oneCategory,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.filterByCategory = async (req, res) => {
  try {
    const { cat1, cat2, cat3, cat4, cat5, limit, page } = req.query;

    const filterCategory = await Categories.findAll({
      include: {
        model: Trips,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "datestamp_1",
            "datestamp_2",
            "datestamp_3",
          ],
        },
      },
      where: {
        category_name: {
          [Op.in]: [cat1, cat2, cat3, cat4, cat5],
        },
      },
      limit: limit,
      offset: page * limit,
      attributes: {
        exclude: [
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
          "createdAt",
          "updatedAt",
        ],
      },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Categories data have been filtered succesfully.",
      results: filterCategory,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      Code: 500,
      statustext: "Internal server error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.createCategory = async (req, res) => {
  const category_name = req.body.category_name;
  try {
    if (!category_name) {
      res.status(409).json({
        code: 409,
        statusText: "Conflict",
        success: false,
        message: "Category name cannot be empty",
      });
    }
    const createCategory = await Categories.create({
      ...req.body,
    });

    res.status(201).json({
      code: 201,
      statustext: "Created",
      success: true,
      message: "Successfully create new Category",
      result: createCategory,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Failed to create data",
    });
  }
};

exports.updateCategory = async (req, res) => {
  const idInput = req.query.id;
  try {
    const findOneCategory = await Categories.findOne({
      where: {
        id: idInput,
      },
    });

    await Categories.update(req.body, {
      where: {
        id: idInput,
      },
    });

    const updatedData = await Categories.findOne({
      where: {
        id: idInput,
      },
    });

    if (!findOneCategory) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: `Category with ID: ${idInput} is not found`,
      });
    }

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `Successfully updated category data with ID: ${idInput}`,
      result: updatedData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to update data",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const idInput = req.query.id;

    const findOneCategory = await Categories.findOne({
      where: {
        id: idInput,
      },
    });

    const deleteCategory = await Categories.destroy({
      where: {
        id: idInput,
      },
    });

    if (!findOneCategory) {
      res.status(404).json({
        code: 404,
        statusText: "Not Found",
        success: false,
        message: `Cannot found category with ID: ${idInput}`,
      });
    }

    if (deleteCategory) {
      res.status(200).json({
        code: 200,
        statusText: "OK",
        success: true,
        message: `Successfully deleted category with ID: ${idInput}`,
      });
    }
  } catch (err) {
    res.status(500).json({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Failed to delete data",
    });
  }
};
