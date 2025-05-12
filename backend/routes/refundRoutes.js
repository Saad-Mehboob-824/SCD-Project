const express = require("express");
const router = express.Router();
const refundController = require("../controllers/refundController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, refundController.createRefund);

router.get("/list", authMiddleware, refundController.getSellerRefunds);

router.put("/update/:id", authMiddleware, refundController.updateRefundStatus);

module.exports = router;
