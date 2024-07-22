const {
  getGroup,
  getExtension,
  getCallList,
} = require("../controllers/CallReport");

const express = require("express");
const router = express.Router();

router.get("/groups", getGroup);
router.get("/extensions", getExtension);
router.get("/callList", getCallList);

// router.get("/users/:id", verifyUser, adminOnly, getUserById);

module.exports = router;
