const express = require("express");

const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAllAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
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

router.get("/admin/all", roleAdmin, getAllAdmin);

router.get("/admin", roleAdmin, getAdmin);

router.put("/admin/upd", roleAdmin, updateAdmin);

router.delete("/admin/del", roleAdmin, deleteAdmin);

router.post("/admin/regis", registerAdmin);

router.post("/admin/login", loginAdmin, tokenLoginAdmin);

module.exports = router;
