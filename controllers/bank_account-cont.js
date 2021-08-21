const { Bank_Account } = require("../models");
var { Op } = require("sequelize");

exports.getAllBankAccount = async (req, res) => {
  try {
    const AllBankAccount = await Bank_Account.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "users_payment_method_id"],
      },
      order: [["id", "ASC"]],
    });
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "User's bank account data have been retrieved succesfully",
      result: AllBankAccount,
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

exports.getBankAccount = async (req, res) => {
  const id = req.query.id;
  try {
    const oneBankAccount = await Bank_Account.findOne({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      where: {
        id: id,
      },
    });
    if (!oneBankAccount) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "User's bank account data is not found",
      });
    }
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Successfully retrieve user's bank account data",
      result: oneBankAccount,
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

exports.deleteBankAccount = async (req, res) => {
  const id = req.query.id;
  const findOneBankAccount = await Bank_Account.findOne({
    where: {
      id: id,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  if (!findOneBankAccount) {
    res.status(404).json({
      code: 404,
      statustext: "Not Found",
      success: false,
      message: `The user's bank account with ID ${idInput} is not found`,
    });
    return;
  }

  try {
    await Bank_Account.destroy({
      where: {
        id: id,
      },
    });

    const user_id_bank_account = findOneBankAccount.dataValues.user_id;

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The user's bank account ID ${id} with user ID '${user_id_bank_account}' is deleted`,
      result: findOneBankAccount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};
