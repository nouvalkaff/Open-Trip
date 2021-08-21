const express = require("express");

const { s3upload } = require("../middleware/s3upload");

const router = express.Router();
const {
  getAllOrder,
  createOrder,
  getOrderById,
  deleteOrder,
  ChangeStatusPayment,
} = require("../controllers/order-cont");

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

router.get("/order/all", getAllOrder);

router.get("/order", getOrderById);

router.post("/order/crt", roleTraveller, createOrder);

router.put("/order/upd", roleHost, ChangeStatusPayment);

router.delete("/order/del", roleAdminAndHost, deleteOrder);

module.exports = router;
