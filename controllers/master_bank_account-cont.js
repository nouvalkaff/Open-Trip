const { Bank_Account, Master_Bank_Account } = require("../models");
var { Op } = require("sequelize");

exports.getAllMasterBankAccount = async (req, res) => {
  try {
    const AllMasterBankAccount = await Master_Bank_Account.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      // include: {
      //   model: Bank_Account,
      //   attributes: {
      //     exclude: ["createdAt", "updatedAt", "id", "master_bank_account_id"],
      //   },
      // },
      order: [["id", "ASC"]],
    });
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Master bank data have been retrieved succesfully",
      result: AllMasterBankAccount,
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

exports.getMasterBankAccount = async (req, res) => {
  const bank_name = req.query.bank_name;
  try {
    const oneMasterBankAccount = await Master_Bank_Account.findOne({
      include: {
        model: Bank_Account,
        attributes: {
          exclude: ["createdAt", "updatedAt", "id", "master_bank_account_id"],
        },
      },
      where: {
        bank_name: { [Op.iLike]: "%" + bank_name + "%" },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    if (!oneMasterBankAccount) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "This master bank data is not found",
      });
    }
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Successfully retrieve master bank data",
      result: oneMasterBankAccount,
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

exports.createMasterBankAccount = async (req, res) => {
  try {
    const bank_name = req.body;
    await Master_Bank_Account.create(bank_name);
    res.status(201).json({
      code: 201,
      statustext: "Created",
      success: true,
      message: "New master bank data has been created",
      result: bank_name,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Sorry, we failed to create a new master bank data",
    });
  }
};

exports.updateMasterBankAccount = async (req, res) => {
  try {
    const id = req.query.id;
    const bank_name = req.body.bank_name;

    const findOne = await Master_Bank_Account.findOne({
      where: { id: id },
      attributes: { exclude: ["updatedAt", "createdAt"] },
    });

    const matchName = await Master_Bank_Account.findOne({
      where: { bank_name: bank_name },
    });

    if (!findOne) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "This master bank data is not found",
      });
      return;
    }

    if (matchName) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "This master bank data already exist",
      });
      return;
    }

    if (bank_name == "") {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Bank name column cannot be Empty",
      });
      return;
    }

    await Master_Bank_Account.update(
      { bank_name: bank_name },
      { where: { id: id } }
    );

    const updatedData = await Master_Bank_Account.findOne({
      where: {
        id: id,
      },
      attributes: { exclude: ["updatedAt", "createdAt"] },
    });

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "A master bank data has been updated",
      result: { updated: updatedData, previous: findOne },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Sorry, we failed to update a new master bank data",
    });
  }
};

exports.deleteMasterBankAccount = async (req, res) => {
  const id = req.query.id;
  const findOneMasterBankAccount = await Master_Bank_Account.findOne({
    where: {
      id: id,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  if (!findOneMasterBankAccount) {
    res.status(404).json({
      code: 404,
      statustext: "Not Found",
      success: false,
      message: `The master bank data with ID ${id} is not found`,
    });
    return;
  }

  try {
    await Master_Bank_Account.destroy({
      where: {
        id: id,
      },
    });

    const bank_name = findOneMasterBankAccount.dataValues.bank_name;

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The master bank data ID ${id} with bank name '${bank_name}' is deleted`,
      result: findOneMasterBankAccount,
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
