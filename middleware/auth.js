//AUTHENTICATION
const jwt = require("jsonwebtoken"); //import jwt
const { Users } = require("../models"); // Import user model
routes = {};

//role Host = 1
//role Traveller = 2
//role Admin = 3
routes.roleAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.users_role_id !== 3) {
      return res.status(403).json({
        statusText: "Forbidden",
        message: "Sorry, you do not have access, ADMIN only!",
      });
    }

    next();
  } catch (err) {
    // If error it will make status code 500 (Internal Server Error) and send the error message
    res.status(500).json({
      statusText: "Internal Server Error",
      message: err,
    });
  }
};

routes.roleTraveller = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    //role Admin = 1
    //role Traveller = 2
    //role Host = 3
    if (decoded.users_role_id != 2) {
      return res.status(403).json({
        statusText: "Forbidden",
        message: "Sorry, you do not have access, TRAVELLER only!",
      });
    }

    //next to get all activity
    next();
  } catch (err) {
    // If error it will make status code 500 (Internal Server Error) and send the error message
    res.status(500).json({
      statusText: "Internal Server Error",
      message: err,
    });
  }
};

routes.roleHost = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    //role Host = 1
    //role Traveller = 2
    //role Admin = 3
    if (decoded.users_role_id != 1) {
      return res.status(403).json({
        statusText: "Forbidden",
        message: "Sorry, you do not have access, HOST only!",
      });
    }

    //next to get all activity
    next();
  } catch (err) {
    // If error it will make status code 500 (Internal Server Error) and send the error message
    res.status(500).json({
      statusText: "Internal Server Error",
      message: err,
    });
  }
};

routes.roleAdminAndTraveller = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    //role Host = 1
    //role Traveller = 2
    //role Admin = 3
    if (decoded.users_role_id == 1) {
      return res.status(403).json({
        statusText: "Forbidden",
        message: "Sorry, you do not have access, ADMIN and TRAVELLER only!",
      });
    }
    next();
  } catch (err) {
    // If error it will make status code 500 (Internal Server Error) and send the error message
    res.status(500).json({
      statusText: "Internal Server Error",
      message: err,
    });
  }
};

routes.roleAdminAndHost = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    //role Host = 1
    //role Traveller = 2
    //role Admin = 3
    if (decoded.users_role_id == 2) {
      return res.status(403).json({
        statusText: "Forbidden",
        message: "Sorry, you do not have access, ADMIN and HOST only!",
      });
    }
    next();
  } catch (err) {
    // If error it will make status code 500 (Internal Server Error) and send the error message
    res.status(500).json({
      statusText: "Internal Server Error",
      message: err,
    });
  }
};

routes.tokenLoginAdmin = async (req, res) => {
  try {
    //req email from body
    const { email } = req.body;
    const admin = await Users.findOne({ where: { email: email } });

    const token = jwt.sign(
      {
        users_role_id: admin.dataValues.users_role_id,
        user_id: admin.dataValues.id,
        role: "Admin",
        email: admin.dataValues.email,
        fullname: admin.dataValues.fullname,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    //if sign up success
    const adminResult = {
      statusCode: 200,
      statusText: "OK",
      message: "Login Success!",
      data: {
        token_admin: token,
        // data: admin.dataValues,
      },
    };

    res.json(adminResult);
    //if sign up error
  } catch (err) {
    res.status(500).json({
      statusText: "Internal Server Error",
      message: err,
    });
  }
};

module.exports = routes;
