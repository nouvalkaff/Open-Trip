const express = require("express");

const { s3upload } = require("../middleware/s3upload");

const router = express.Router();
const {
  getAllHost,
  getHost,
  hostRegister,
  updateHost,
  deleteHost,
} = require("../controllers/users-cont");

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

const {
  loginHostAndTraveller,
} = require("../middleware/loginHostAndTraveller");

router.get("/host/all", roleAdmin, getAllHost);

router.get("/host", roleAdminAndHost, getHost);

router.put("/host/upd", roleHost, s3upload, updateHost);

router.delete("/host/del", roleAdminAndHost, deleteHost);

router.post("/host/regis", s3upload, hostRegister);

router.post("/user/login", loginHostAndTraveller);

// router.post("/host/login", loginHost, tokenLoginHost);

module.exports = router;
