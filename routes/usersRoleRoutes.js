const express = require("express");

const router = express.Router();
const {
  getAllUsersRole,
  getUsersRole,
  createRole,
} = require("../controllers/users_role-cont");
const {
  tokenLoginHost,
  tokenLoginAdmin,
  tokenLoginTraveller,
  roleAdmin,
  roleTraveller,
  roleHost,
  roleAdminAndTraveller,
  roleAdminAndHost,
} = require("../middleware/auth");

router.get("/role/all", roleAdmin, getAllUsersRole);

router.get("/role", roleAdmin, getUsersRole);

router.post("/role/crt", roleAdmin, createRole);

module.exports = router;
