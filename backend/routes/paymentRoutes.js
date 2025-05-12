const express = require("express");
const {
  createPayment,
  getPayments,
  getPaymentById,
} = require("../controllers/paymentController");
const authenticate = require("../middleware/authMiddleware"); // Assuming you have this middleware

const router = express.Router();

// Create a payment
router.post("/", authenticate, createPayment);

// Get all payments of the logged-in user
router.get("/", authenticate, getPayments);

// Get a specific payment by ID
router.get("/:id", authenticate, getPaymentById);

module.exports = router;
