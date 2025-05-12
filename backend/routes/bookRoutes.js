const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateBookAddition } = require("../middleware/viladationMiddleware");

// All routes are protected and require seller authentication
router.post(
  "/add",
  authMiddleware,
  validateBookAddition,
  bookController.addBook
);
router.put(
  "/update/:id",
  authMiddleware,
  validateBookAddition,
  bookController.updateBook
);
router.delete("/delete/:id", authMiddleware, bookController.deleteBook);
router.get("/inventory", authMiddleware, bookController.getSellerBooks);

module.exports = router;
