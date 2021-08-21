const express = require("express");

const router = express.Router();
const {
  getAllBankAccount,
  getBankAccount,
  deleteBankAccount,
} = require("../controllers/bank_account-cont");
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

router.get("/bankacc/all", roleAdmin, getAllBankAccount);

router.get("/bankacc", roleAdmin, getBankAccount);

router.delete("/bankacc/del", roleAdmin, deleteBankAccount);

module.exports = router;
