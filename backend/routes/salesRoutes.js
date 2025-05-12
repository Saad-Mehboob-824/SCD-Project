const express = require("express");
const router = express.Router();
const salesReportController = require("../controllers/salesController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/generate",
  authMiddleware,
  salesReportController.generateSalesReport
);

router.get(
  "/top-books",
  authMiddleware,
  salesReportController.getTopSellingBooks
);

module.exports = router;
