const { getAccount, createAccount } = require("../controllers/AccountReport");

const express = require("express");
const router = express.Router();

router.get("/accounts", getAccount);
router.post("/account", createAccount);
// router.get("/users/:id", verifyUser, adminOnly, getUserById);

module.exports = router;
