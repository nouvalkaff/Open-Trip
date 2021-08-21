const express = require("express");

const router = express.Router();
const {
  registerTraveller,
  getAllTraveller,
  getTraveller,
  updateTraveller,
  deleteTraveller,
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

router.get("/travel/all", roleAdmin, getAllTraveller);

router.get("/travel", roleAdminAndTraveller, getTraveller);

router.put("/travel/upd", roleTraveller, updateTraveller);

router.delete("/travel/del", roleAdminAndTraveller, deleteTraveller);

router.post("/travel/regis", registerTraveller);

router.post("/user/login", loginHostAndTraveller);

// router.post("/travel/login", loginTraveller, tokenLoginTraveller);

module.exports = router;
