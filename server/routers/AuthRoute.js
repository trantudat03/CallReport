const { Login, Profile, logOut } = require("../controllers/Auth");

const express = require("express");
const router = express.Router();

router.get("/profile", Profile);
router.post("/login", Login);
router.delete("/logout", logOut);

// router.get("/users/:id", verifyUser, adminOnly, getUserById);

module.exports = router;
