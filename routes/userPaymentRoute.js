const express = require("express");

const router = express.Router();

const userPaymentCon = require('../controllers/userPaymentMethod-cont')

router.get(
  '/userPayment/getAll',
  userPaymentCon.getAllUserPayment
)

router.get(
  '/userPayment', 
userPaymentCon.getUserPaymentById
)

router.post(
  '/userPayment/crt',
  userPaymentCon.createUserPayment
)

router.put(
  '/userPayment/upd', 
  userPaymentCon.updateUserPayment
)

router.delete(
  '/userPayment/del', 
  userPaymentCon.deleteUserPayment
)

module.exports = router;