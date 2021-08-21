const express = require('express');

const router = express.Router();

const {
    getAllCategory,
    getCategory,
    filterByCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categories-cont");

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

} = require("../middleware/loginHostAndTraveller");


router.get("/category/all", getAllCategory);

router.get("/category", getCategory);

router.get("/category/search", filterByCategory);

router.post("/category/crt", roleAdmin ,createCategory);

router.put("/category/upd", roleAdmin, updateCategory);

router.delete("/category/del", roleAdmin, deleteCategory);

module.exports = router