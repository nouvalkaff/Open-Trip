const express = require("express");

const router = express.Router();

const {
  getAllActivities,
  getActivities,
  createActivities,
  updateActivities,
  deleteActivities,
} = require("../controllers/activities-cont");

const { roleAdmin, roleHost, roleAdminAndHost } = require("../middleware/auth");

router.get("/act/all", getAllActivities);

router.get("/act", getActivities);

router.post("/act/crt", createActivities);

router.put("/act/upd", updateActivities);

router.delete("/act/del", deleteActivities);

module.exports = router;
