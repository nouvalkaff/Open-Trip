const express = require("express");

const { s3uploadGallery } = require("../middleware/s3upload");

const router = express.Router();

const {
  createTrip,
  getAllTrips,
  getTripByBudget,
  getTripByDate,
  getTripByDuration,
  getTripById,
  getTripByName,
  updateTrip,
  deleteTrip,
	getTotalParticipantsAllTripsPerHost,
} = require("../controllers/trip-cont");

const { roleAdmin, roleHost, roleAdminAndHost } = require("../middleware/auth");

router.get("/trip/all", getAllTrips);

router.get("/trip", getTripById); //FILTER BY DESTINATION ID HERE

router.get("/trip/name/search", getTripByName); //FILTER BY DESTINATION NAME HERE

router.get("/trip/budget/search", getTripByBudget); //FILTER BY DESTINATION BUDGET HERE

router.get("/trip/date/search", getTripByDate); //FILTER BY DESTINATION DATE/TIME HERE

router.get("/trip/duration/search", getTripByDuration); // FILTER BY DESTINATION DURATION HERE

router.post("/trip/crt", s3uploadGallery, roleHost, createTrip);

router.put("/trip/upd", s3uploadGallery, roleHost, updateTrip);

router.delete("/trip/del", roleAdminAndHost, deleteTrip);

router.get("/status/trip", roleHost, getTotalParticipantsAllTripsPerHost)

module.exports = router;
