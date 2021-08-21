const express = require("express");

const router = express.Router();
const {
  getAllMasterBankAccount,
  getMasterBankAccount,
  createMasterBankAccount,
  deleteMasterBankAccount,
  updateMasterBankAccount,
} = require("../controllers/master_bank_account-cont");
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

router.get("/bank/all", getAllMasterBankAccount);

router.get("/bank", getMasterBankAccount);

router.post("/bank/crt", roleAdmin, createMasterBankAccount);

router.put("/bank/upd", roleAdmin, updateMasterBankAccount);

router.delete("/bank/del", roleAdmin, deleteMasterBankAccount);

module.exports = router;
