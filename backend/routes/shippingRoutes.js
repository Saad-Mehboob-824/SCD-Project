const express = require("express");
const {
  validateAddress,
  calculateShippingCost,
} = require("../controllers/shippingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Validate Address
router.post("/validate", authMiddleware, validateAddress);

// Calculate Shipping Cost
router.post("/calculate", authMiddleware, calculateShippingCost);

module.exports = router;
