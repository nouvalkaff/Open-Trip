const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const bcrypt = require("bcrypt");

exports.loginHostAndTraveller = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const matchEmailTraveller = await Users.findOne({
      where: { email: email, users_role_id: 2 },
    });

    const matchEmailHost = await Users.findOne({
      where: { email: email, users_role_id: 1 },
    });

    if (!matchEmailTraveller && !matchEmailHost) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "Email does not exist, please try again.",
      });
    }

    if (matchEmailTraveller) {
      const verifyPasswordTravel = await bcrypt.compare(
        password,
        matchEmailTraveller.dataValues.password
      );

      if (!verifyPasswordTravel) {
        return res.status(401).json({
          StatusText: "Unauthorized",
          Message: "Wrong password, please try again.",
          Success: false,
          Code: 401,
        });
      }

      const traveller = await Users.findOne({
        where: { email: email },
      });

      const token = jwt.sign(
        {
          users_role_id: traveller.dataValues.users_role_id,
          user_id: traveller.dataValues.id,
          role: "Traveller",
          email: traveller.dataValues.email,
          username: traveller.dataValues.username,
        },
        process.env.SECRET_KEY,
        { expiresIn: "12h" }
      );
      const travellerResult = {
        statusCode: 200,
        statusText: "Success",
        message: "Login Success!",
        data: {
          token_traveller: token,
        },
      };

      return res.json(travellerResult);
    }

    if (matchEmailHost) {
      const verifyPasswordHost = await bcrypt.compare(
        password,
        matchEmailHost.dataValues.password
      );

      if (!verifyPasswordHost) {
        return res.status(401).json({
          StatusText: "Unauthorized",
          Message: "Wrong password, please try again.",
          Success: false,
          Code: 401,
        });
      }

      const host = await Users.findOne({
        where: { email: email },
      });

      const token = jwt.sign(
        {
          users_role_id: host.dataValues.users_role_id,
          user_id: host.dataValues.id,
          role: "Host",
          email: host.dataValues.email,
          username: host.dataValues.username,
        },
        process.env.SECRET_KEY,
        { expiresIn: "12h" }
      );
      const hostResult = {
        statusCode: 200,
        statusText: "Success",
        message: "Login Success!",
        data: {
          token_host: token,
        },
      };

      return res.json(hostResult);
    }
  } catch (err) {
    res.status(500).json({
      StatusText: "Invalid",
      Succes: false,
      Code: 500,
      Message: err,
    });
    console.log(err);
  }
};
