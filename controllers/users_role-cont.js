const { Users_Role, Users } = require("../models");
var { Op } = require("sequelize");

exports.getAllUsersRole = async (req, res) => {
  try {
    const AllUsersRole = await Users_Role.findAll({
      include: {
        model: Users,
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
        order: [["id", "ASC"]],
      },
    });
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "User role data have been retrieved succesfully",
      result: AllUsersRole,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.getUsersRole = async (req, res) => {
  const role_type = req.query.role_type;
  try {
    const oneUsersRole = await Users_Role.findOne({
      include: {
        model: Users,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "identity_pic",
            "selfie_identity_pic",
            "password",
            "identity_no",
            "phone",
            "address",
          ],
        },
        order: [["id", "ASC"]],
      },
      where: {
        role_type: { [Op.iLike]: "%" + role_type + "%" },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    if (!oneUsersRole) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "User role data is not found",
      });
    }
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Successfully retrieve user role data",
      result: oneUsersRole,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.createRole = async (req, res) => {
  try {
    const role_type = req.body;
    await Users_Role.create(role_type);
    res.status(201).json({
      code: 201,
      statustext: "Created",
      success: true,
      message: "New role has been created",
      result: role_type,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Sorry, we failed to create a new role",
    });
  }
};
