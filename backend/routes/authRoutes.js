const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateSellerRegistration,
  validateBookAddition,
} = require("../middleware/viladationMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/register",
  validateSellerRegistration,
  authController.registerSeller
);
router.post("/login", authController.loginSeller);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
