const { Users, Bank_Account, Master_Bank_Account } = require("../models");
const bcrypt = require("bcrypt");
var { Op } = require("sequelize");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

// TRAVELLER API CONTROLLERS HERE (CREATE, READ, UPDATE, DELETE)
exports.getAllTraveller = async (req, res) => {
  try {
    const allTraveller = await Users.findAll({
      where: { users_role_id: 2 },
      attributes: {
        exclude: [
          "address",
          "phone",
          "password",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Get all data success",
      result: allTraveller,
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Cannot get data",
    });
    console.log(err);
  }
};

exports.getTraveller = async (req, res) => {
  try {
    const username = req.query.username;
    const oneTraveller = await Users.findOne({
      where: {
        username: { [Op.iLike]: "%" + username + "%" },
        users_role_id: 2,
      },
      attributes: {
        exclude: [
          "address",
          "phone",
          "password",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    if (!oneTraveller) {
      res.status(404).json({
        code: 404,
        statusText: "404 Not Found",
        success: false,
        message: `Traveller data is not found`,
      });
    }
    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: `Successfully retrieve traveller data`,
      result: oneTraveller,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      statusText: "Internal Server Error",
      success: false,
      message: "Cannot get data",
    });
    console.log(err);
  }
};

// register = create
exports.registerTraveller = async (req, res) => {
  try {
    const { password, username, email } = req.body;

    const matchEmail = await Users.findOne({
      where: { email: email },
    });

    const matchUsername = await Users.findOne({
      where: { username: username },
    });

    if (username == "" || email == "" || password == "") {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Username, Email, or Password cannot be Empty",
      });
      return;
    }

    if (matchUsername) {
      res.status(409).json({
        code: 409,
        statusText: "Conflict",
        success: false,
        message:
          "Username already exist in database, please use Open-Trip unregistered username",
      });
      return;
    }

    if (matchEmail) {
      res.status(409).json({
        code: 409,
        statusText: "Conflict",
        success: false,
        message:
          "Email already exist in database, please use Open-Trip unregistered email",
      });

      // Else untuk input dan encrypt data yg di masukkan
    } else {
      await Users.create({
        users_role_id: 2,
        ...req.body,
        password: bcrypt.hashSync(password, 10),
      });

      const dataCreated = await Users.findOne({
        where: { email: email },
        attributes: {
          exclude: [
            "address",
            "phone",
            "password",
            "identity_no",
            "identity_pic",
            "selfie_identity_pic",
            "createdAt",
            "updatedAt",
          ],
        },
      });

      return res.status(201).json({
        code: 201,
        statusText: "Created",
        success: true,
        message: "Successfully created new Traveller",
        result: dataCreated,
      });
    }
  } catch (err) {
    res.status(500).send({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Cannot post data",
    });
    console.log(err);
  }
};

exports.updateTraveller = async (req, res) => {
  const { email, password, username, fullname } = req.body;
  const idInput = req.query.id;

  const findOneTraveller = await Users.findOne({
    where: {
      id: idInput,
    },
  });

  const previousData = await Users.findOne({
    where: { email: email, id: idInput },
    attributes: {
      exclude: [
        "address",
        "phone",
        "password",
        "identity_no",
        "identity_pic",
        "selfie_identity_pic",
        "createdAt",
        "updatedAt",
      ],
    },
  });

  if (username == "" || fullname == "" || email == "") {
    res.status(400).json({
      code: 400,
      statustext: "Bad Request",
      success: false,
      message: "Full Name, Username, Email cannot be Empty",
    });
    return;
  }

  if (!findOneTraveller) {
    res.status(404).json({
      code: 404,
      statusText: "Not found",
      success: false,
      message: `The traveller with ID ${idInput} is not found`,
    });
    return;
  }

  if (!previousData) {
    res.status(409).json({
      code: 409,
      statusText: "Conflict",
      success: false,
      message: `Email data is not match with user ID`,
    });
    return;
  }

  if (password == "") {
    res.status(400).json({
      code: 400,
      statustext: "Bad Request",
      success: false,
      message: "Password cannot be Empty",
    });
    return;
  }

  try {
    if (!password) {
      await Users.update(
        {
          ...req.body,
          password: previousData.dataValues.password,
        },
        {
          where: {
            id: idInput,
            email: email,
          },
        }
      );
    }

    if (password) {
      await Users.update(
        {
          ...req.body,
          password: bcrypt.hashSync(password, 10),
        },
        {
          where: {
            id: idInput,
            email: email,
          },
        }
      );
    }

    const updatedData = await Users.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: [
          "address",
          "phone",
          "identity_no",
          "password",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    return res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Successfully updated data",
      result_updated: updatedData,
      result_previous: previousData,
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Cannot put data",
    });
    console.log(err);
  }
};

exports.deleteTraveller = async (req, res) => {
  try {
    const idInput = req.query.id;
    const password = req.body.password;
    const findOneTraveller = await Users.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: [
          "address",
          "phone",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    if (!findOneTraveller) {
      res.status(404).json({
        code: 404,
        statusText: "Not found",
        success: false,
        message: `Cannot found traveller with ID: ${idInput}`,
      });
      return;
    }

    const verifyPassword = await bcrypt.compare(
      password,
      findOneTraveller.dataValues.password
    );

    // if password doesn't match
    if (!verifyPassword) {
      return res.status(401).json({
        Code: 401,
        statustext: "Unauthorized",
        success: false,
        message: "Wrong Password, please try again",
      });
    }

    await Users.destroy({
      where: {
        id: idInput,
        password: findOneTraveller.dataValues.password,
      },
    });

    const travellerUsername = findOneTraveller.dataValues.username;

    return res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: `The traveller ID ${idInput} with username '${travellerUsername}' is deleted`,
      result: findOneTraveller,
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Cannot delete data",
    });
    console.log(err);
  }
};

// HOST API CONTROLLERS HERE (CREATE, READ, UPDATE, DELETE)

exports.getAllHost = async (req, res) => {
  try {
    const bank = await Master_Bank_Account.findAll({
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "password",
          "identity_pic",
          "selfie_identity_pic",
        ],
      },
    });

    const allHost = await Users.findAll({
      where: { users_role_id: 1 },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "password",
          "identity_pic",
          "selfie_identity_pic",
        ],
      },
      include: {
        model: Bank_Account,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "id",
            "book_account_pic",
            "user_id",
            "users_payment_method_id",
          ],
        },
        order: [["user_id", "ASC"]],
      },
    });

    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Get all data success",
      result: { master_bank_account_list: bank, data_host: allHost },
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Cannot get data",
    });
    console.log(err);
  }
};

exports.getHost = async (req, res) => {
  try {
    const username = req.query.username;
    const bank = await Master_Bank_Account.findAll({
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "password",
          "identity_pic",
          "selfie_identity_pic",
        ],
      },
    });
    const oneHost = await Users.findOne({
      where: {
        username: { [Op.iLike]: "%" + username + "%" },
        users_role_id: 1,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
      include: {
        model: Bank_Account,
        attributes: {
          exclude: ["createdAt", "updatedAt", "id", "users_payment_method_id"],
        },
      },
    });

    if (!oneHost) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "Host data is not found",
      });
    }

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Successfully retrieve host data",
      result: {
        data: oneHost,
        master_bank_account_list: bank,
        // bank: bank_account_id,
        // account_number: accNum,
        // book_account_pic: bookAcc,
      },
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

exports.hostRegister = async (req, res) => {
  try {
    const {
      password,
      username,
      email,
      phone,
      address,
      identity_no,
      bank,
      account_number,
    } = req.body;

    const files = req.files;

    const identity_pic = files.identity_pic,
      selfie_identity_pic = files.selfie_identity_pic,
      book_account_pic = files.book_account_pic;

    if (
      identity_pic[0].size >= 260000 ||
      selfie_identity_pic[0].size >= 260000 ||
      book_account_pic[0].size >= 260000
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message:
          "Big file(s) detected. Uploaded file(s) must equal or less than 250KB",
      });
      return;
    }

    const matchEmail = await Users.findOne({
      where: { email: email },
    });

    const matchUsername = await Users.findOne({
      where: { username: username },
    });

    if (
      username == "" ||
      email == "" ||
      password == "" ||
      phone == "" ||
      address == "" ||
      identity_no == "" ||
      bank == "" ||
      account_number == ""
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Empty column spotted! Please, fill all columns",
      });
      return;
    }

    if (matchEmail) {
      res.status(409).json({
        code: 409,
        statusText: "Conflict",
        success: false,
        message:
          "Email already exist in database, please use Open-Trip unregistered email",
      });
      return;
    }

    if (matchUsername) {
      res.status(409).json({
        code: 409,
        statusText: "Conflict",
        success: false,
        message:
          "Username already exist in database, please use Open-Trip unregistered username",
      });
      return;
    }

    //Checking the fields of images
    //If identity_pic is missing
    if (!req.files.identity_pic) {
      res.status(500).json({
        code: 500,
        statustext: "Internal Server Error",
        success: false,
        message: "Your KTP photo is missing, please upload",
      });
      return;
    }

    //If selfie_identity_pic picture is missing
    if (!req.files.selfie_identity_pic) {
      res.status(500).json({
        code: 500,
        statustext: "Internal Server Error",
        success: false,
        message:
          "Your selfie while holding KTP photo is missing, please upload",
      });
      return;
    }

    //If book_account_pic is missing
    if (!req.files.book_account_pic) {
      res.status(500).json({
        code: 500,
        statustext: "Internal Server Error",
        success: false,
        message: "Your book account photo is missing, please upload",
      });
      return;
    }

    // AWS S3 Upload Coding
    //Set Up the Keys Name of file which will upload
    const keyName1 = `identity_pic/${new Date().getTime()}-${
      files.identity_pic[0]
    }`;
    const keyName2 = `selfie_identity_pic/${new Date().getTime()}-${
      files.selfie_identity_pic[0]
    }`;
    const keyName3 = `book_account_pic/${new Date().getTime()}-${
      files.book_account_pic[0]
    }`;

    //Preparing the params for uploading to AWS S3
    const params1 = {
      ACL: "public-read",
      Body: files.identity_pic[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName1,
    };

    const params2 = {
      ACL: "public-read",
      Body: files.selfie_identity_pic[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName2,
    };

    const params3 = {
      ACL: "public-read",
      Body: files.book_account_pic[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName3,
    };

    const params = [params1, params2, params3];

    //Algorithm for uploading multiple files to AWS
    const responseData = [];
    for (i = 0; i < 3; i++) {
      if (params.length < 3) {
        res.status(500).json({
          code: 500,
          statustext: "Internal Server Error",
          success: false,
          message: "Failed in uploading your files, please try again",
        });
      } else {
        responseData.push(await s3.upload(params[i]).promise());
        if (responseData.length == params.length) {
          const identity_pic_url = responseData[0].Location,
            selfie_identity_pic_url = responseData[1].Location,
            book_account_pic_url = responseData[2].Location;

          await Users.create({
            users_role_id: 1,
            ...req.body,
            password: bcrypt.hashSync(password, 10),
            identity_pic: identity_pic_url,
            selfie_identity_pic: selfie_identity_pic_url,
          });

          const check = await Users.findOne({
              where: { email: email },
            }),
            user_id_bank_account = check.dataValues.id;

          await Bank_Account.create({
            user_id: user_id_bank_account,
            master_bank_account_id: req.body.bank,
            account_number: req.body.account_number,
            book_account_pic: book_account_pic_url,
          });

          const checkBookAcc = await Bank_Account.findOne({
              where: { user_id: user_id_bank_account },
            }),
            bank_account_id = checkBookAcc.dataValues.master_bank_account_id,
            accNum = checkBookAcc.dataValues.account_number,
            bookAcc = checkBookAcc.dataValues.book_account_pic;

          const resultRegis = await Users.findOne({
            where: { email: email },
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "password",
                "address",
                "identity_no",
                "phone",
              ],
            },
          });

          return res.status(201).json({
            code: 201,
            statustext: "Created",
            success: true,
            message: "You has been successfully registered",
            result: {
              data: resultRegis,
              bank: bank_account_id,
              account_number: accNum,
              book_account_pic: bookAcc,
            },
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to register as a Host, please try again",
    });
  }
};

exports.updateHost = async (req, res) => {
  try {
    const {
      password,
      username,
      email,
      phone,
      address,
      identity_no,
      bank,
      account_number,
    } = req.body;

    const idInput = req.query.id;

    const previousData = await Users.findOne({
      where: { email: email, id: idInput },
    });

    const files = req.files;

    const identity_pic = files.identity_pic,
      selfie_identity_pic = files.selfie_identity_pic,
      book_account_pic = files.book_account_pic;

    if (
      identity_pic[0].size >= 260000 ||
      selfie_identity_pic[0].size >= 260000 ||
      book_account_pic[0].size >= 260000
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message:
          "Big file(s) detected. Uploaded file(s) must equal or less than 250KB",
      });
      return;
    }

    if (
      username == "" ||
      email == "" ||
      password == "" ||
      phone == "" ||
      address == "" ||
      identity_no == "" ||
      bank == "" ||
      account_number == ""
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Empty column spotted! Please, fill all columns",
      });
      return;
    }

    //Checking the fields of images
    //If identity_pic is missing
    if (!req.files.identity_pic) {
      res.status(500).json({
        code: 500,
        statustext: "Internal Server Error",
        success: false,
        message: "Your KTP photo is missing, please upload",
      });
      return;
    }

    //If selfie_identity_pic picture is missing
    if (!req.files.selfie_identity_pic) {
      res.status(500).json({
        code: 500,
        statustext: "Internal Server Error",
        success: false,
        message:
          "Your selfie while holding KTP photo is missing, please upload",
      });
      return;
    }

    //If book_account_pic is missing
    if (!req.files.book_account_pic) {
      res.status(500).json({
        code: 500,
        statustext: "Internal Server Error",
        success: false,
        message: "Your book account photo is missing, please upload",
      });
      return;
    }

    // AWS S3 Upload Coding
    //Set Up the Keys Name of file which will upload
    const keyName1 = `identity_pic/${new Date().getTime()}-${
      files.identity_pic[0]
    }`;
    const keyName2 = `selfie_identity_pic/${new Date().getTime()}-${
      files.selfie_identity_pic[0]
    }`;
    const keyName3 = `book_account_pic/${new Date().getTime()}-${
      files.book_account_pic[0]
    }`;

    //Preparing the params for uploading to AWS S3
    const params1 = {
      ACL: "public-read",
      Body: files.identity_pic[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName1,
    };

    const params2 = {
      ACL: "public-read",
      Body: files.selfie_identity_pic[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName2,
    };

    const params3 = {
      ACL: "public-read",
      Body: files.book_account_pic[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName3,
    };

    const params = [params1, params2, params3];

    //Algorithm for uploading multiple files to AWS
    const responseData = [];
    for (i = 0; i < 3; i++) {
      if (params.length < 3) {
        res.status(500).json({
          code: 500,
          statustext: "Internal Server Error",
          success: false,
          message: "Failed in uploading your files, please try again",
        });
      } else {
        responseData.push(await s3.upload(params[i]).promise());
        if (responseData.length == params.length) {
          const identity_pic_url = responseData[0].Location,
            selfie_identity_pic_url = responseData[1].Location,
            book_account_pic_url = responseData[2].Location;

          if (!password) {
            await Users.update(
              {
                ...req.body,
                password: previousData.dataValues.password,
                identity_pic: identity_pic_url,
                selfie_identity_pic: selfie_identity_pic_url,
              },
              {
                where: {
                  id: idInput,
                  email: email,
                },
              }
            );

            const check = await Users.findOne({
              where: { email: email },
            });

            const user_id_bank_account = check.dataValues.id;

            await Bank_Account.update(
              {
                user_id: user_id_bank_account,
                master_bank_account_id: req.body.bank,
                account_number: req.body.account_number,
                book_account_pic: book_account_pic_url,
              },
              {
                where: {
                  user_id: idInput,
                },
              }
            );
          }

          if (password) {
            await Users.update(
              {
                ...req.body,
                password: bcrypt.hashSync(password, 10),
                identity_pic: identity_pic_url,
                selfie_identity_pic: selfie_identity_pic_url,
              },
              {
                where: {
                  id: idInput,
                  email: email,
                },
              }
            );

            const matchEmail = await Users.findOne({
              where: { id: idInput, email: email },
            });

            if (!matchEmail) {
              res.status(409).json({
                code: 409,
                statustext: "Conflict",
                success: false,
                message: "Email data is not match with user ID",
              });
              return;
            }

            const check = await Users.findOne({
              where: { email: email },
            });

            const user_id_bank_account = check.dataValues.id;

            await Bank_Account.update(
              {
                user_id: user_id_bank_account,
                master_bank_account_id: req.body.bank,
                account_number: req.body.account_number,
                book_account_pic: book_account_pic_url,
              },
              {
                where: {
                  user_id: idInput,
                },
              }
            );
          }
          const check = await Users.findOne({
            where: { email: email },
          });

          const user_id_bank_account = check.dataValues.id;

          const checkBookAcc = await Bank_Account.findOne({
              where: { user_id: user_id_bank_account },
            }),
            bank_account_id = checkBookAcc.dataValues.master_bank_account_id,
            accNum = checkBookAcc.dataValues.account_number,
            bookAcc = checkBookAcc.dataValues.book_account_pic;

          const updatedData = await Users.findOne({
            where: { email: email },
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "id",
                "users_role_id",
                "password",
              ],
            },
          });

          return res.status(201).json({
            code: 201,
            statustext: "Created",
            success: true,
            message: "You has been successfully updated",
            result: {
              data: updatedData,
              bank: bank_account_id,
              account_number: accNum,
              book_account_pic: bookAcc,
            },
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to register as a Host, please try again",
    });
  }
};

exports.deleteHost = async (req, res) => {
  try {
    const idInput = req.query.id;
    const password = req.body.password;
    const findOneHost = await Users.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: [
          "address",
          "phone",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    if (!findOneHost) {
      res.status(404).json({
        code: 404,
        statusText: "Not found",
        success: false,
        message: `Cannot find host with ID: ${idInput}`,
      });
      return;
    }

    const verifyPassword = await bcrypt.compare(
      password,
      findOneHost.dataValues.password
    );

    // if password doesn't match
    if (!verifyPassword) {
      return res.status(401).json({
        Code: 401,
        statustext: "Unauthorized",
        success: false,
        message: "Wrong Password, please try again",
      });
    }

    await Users.destroy({
      where: {
        id: idInput,
        password: findOneHost.dataValues.password,
      },
    });

    await Bank_Account.destroy({
      where: {
        user_id: idInput,
      },
    });

    const hostUsername = findOneHost.dataValues.username;

    return res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: `The host ID ${idInput} with username '${hostUsername}' is deleted`,
      result: findOneHost,
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      statusText: "Internal server error",
      success: false,
      message: "Cannot delete data",
    });
    console.log(err);
  }
};

// ADMIN API CONTROLLERS HERE (CREATE, READ, UPDATE, DELETE)

exports.getAllAdmin = async (req, res) => {
  try {
    const allAdmin = await Users.findAll({
      where: { users_role_id: 3 },
      attributes: {
        exclude: [
          "address",
          "phone",
          "username",
          "password",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Admin data have been retrieved succesfully",
      result: allAdmin,
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

exports.getAdmin = async (req, res) => {
  const fullname = req.query.fullname;
  try {
    const oneAdmin = await Users.findOne({
      where: {
        fullname: { [Op.iLike]: "%" + fullname + "%" },
        users_role_id: 3,
      },
      attributes: {
        exclude: [
          "address",
          "phone",
          "username",
          "password",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    if (!oneAdmin) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "Admin data is not found",
      });
    }
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Successfully retrieve admin data",
      result: oneAdmin,
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

exports.registerAdmin = async (req, res) => {
  try {
    const { password, email, fullname } = req.body;
    const matchEmail = await Users.findOne({
      where: { email: email },
    });

    if (fullname == "" || email == "" || password == "") {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Full Name, Email, or Password cannot be Empty",
      });
      return;
    }

    if (matchEmail) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message:
          "Email already exist in database, please use Open-Trip unregistered email",
      });

      return;

      // Else untuk input dan encrypt data yg di masukkan
    } else {
      await Users.create({
        users_role_id: 3,
        ...req.body,
        password: bcrypt.hashSync(password, 10),
      });

      const dataCreated = await Users.findOne({
        where: { email: email },
        attributes: {
          exclude: [
            "address",
            "phone",
            "username",
            "password",
            "identity_no",
            "identity_pic",
            "selfie_identity_pic",
            "createdAt",
            "updatedAt",
          ],
        },
      });

      return res.status(201).json({
        code: 201,
        statustext: "Created",
        success: true,
        message: "Admin data is created successfully",
        result: dataCreated,
      });
    }
  } catch (err) {
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
    console.log(err);
  }
};

exports.loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const matchEmail = await Users.findOne({
      where: { email: email, users_role_id: 3 },
    });

    if (email == "" || password == "") {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Email, or Password cannot be Empty",
      });
      return;
    }

    const users_role_id = 3;

    //check email whether exist or not
    if (!matchEmail || users_role_id !== 3) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "Email does not exist or use the registered admin email",
      });
    }

    //compare encrypted password
    const verifyPassword = await bcrypt.compare(
      password,
      matchEmail.dataValues.password
    );

    // if password doesn't match
    if (!verifyPassword) {
      return res.status(401).json({
        Code: 401,
        statustext: "Unauthorized",
        success: false,
        message: "Wrong Password, please try again",
      });
    }

    next();
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

exports.updateAdmin = async (req, res) => {
  const idInput = req.query.id;

  const { password, email, fullname } = req.body;

  const findOneAdmin = await Users.findOne({
    where: {
      id: idInput,
    },
  });

  const previousData = await Users.findOne({
    where: { email: email, id: idInput },
    attributes: {
      exclude: [
        "address",
        "phone",
        "password",
        "username",
        "identity_no",
        "identity_pic",
        "selfie_identity_pic",
        "createdAt",
        "updatedAt",
      ],
    },
  });

  if (fullname == "" || email == "") {
    res.status(400).json({
      code: 400,
      statustext: "Bad Request",
      success: false,
      message: "Full Name or Email cannot be Empty",
    });
    return;
  }

  if (!findOneAdmin) {
    res.status(404).json({
      code: 404,
      statustext: "Not Found",
      success: false,
      message: `The admin with ID ${idInput} is not found`,
    });
    return;
  }

  if (!previousData) {
    res.status(409).json({
      code: 409,
      statustext: "Conflict",
      success: false,
      message: "Email data is not match with user ID",
    });
    return;
  }

  if (password == "") {
    res.status(400).json({
      code: 400,
      statustext: "Bad Request",
      success: false,
      message: "Password cannot be Empty",
    });
    return;
  }

  try {
    if (!password) {
      await Users.update(
        {
          ...req.body,
          password: previousData.dataValues.password,
        },
        {
          where: {
            id: idInput,
            email: email,
          },
        }
      );
    }

    if (password) {
      await Users.update(
        {
          ...req.body,
          password: bcrypt.hashSync(password, 10),
        },
        {
          where: {
            id: idInput,
            email: email,
          },
        }
      );
    }

    const updatedData = await Users.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: [
          "address",
          "phone",
          "username",
          "password",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The admin with ID ${idInput} is updated`,
      result_update: updatedData,
      result_previous: previousData,
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

exports.deleteAdmin = async (req, res) => {
  try {
    const idInput = req.query.id;
    const password = req.body.password;
    const findOneAdmin = await Users.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: [
          "address",
          "phone",
          "username",
          "identity_no",
          "identity_pic",
          "selfie_identity_pic",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    if (!findOneAdmin) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: `The admin with ID ${idInput} is not found`,
      });
      return;
    }

    const verifyPassword = await bcrypt.compare(
      password,
      findOneAdmin.dataValues.password
    );

    // if password doesn't match
    if (!verifyPassword) {
      return res.status(401).json({
        Code: 401,
        statustext: "Unauthorized",
        success: false,
        message: "Wrong Password, please try again",
      });
    }

    await Users.destroy({
      where: {
        id: idInput,
        password: findOneAdmin.dataValues.password,
      },
    });

    const adminName = findOneAdmin.dataValues.fullname;

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The admin ID ${idInput} with name '${adminName}' is deleted`,
      result: findOneAdmin,
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
