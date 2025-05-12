const Refund = require("../models/refund");
const Book = require("../models/book");
const mongoose = require("mongoose");

exports.createRefund = async (req, res, next) => {
  try {
    const { bookId, purchaseId, reason } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    // Check if book exists and belongs to the seller
    const book = await Book.findOne({
      _id: bookId,
      seller: req.seller._id,
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const newRefund = new Refund({
      book: bookId,
      seller: req.seller._id,
      purchaseId,
      reason,
      status: "Pending",
    });

    const savedRefund = await newRefund.save();
    res.status(201).json(savedRefund);
  } catch (error) {
    next(error);
  }
};

exports.getSellerRefunds = async (req, res, next) => {
  try {
    const refunds = await Refund.find({
      seller: req.seller._id,
    }).populate("book", "title author");

    res.json(refunds);
  } catch (error) {
    next(error);
  }
};

exports.updateRefundStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid refund ID" });
    }

    const refund = await Refund.findOneAndUpdate(
      { _id: id, seller: req.seller._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!refund) {
      return res.status(404).json({ message: "Refund not found" });
    }

    res.json(refund);
  } catch (error) {
    next(error);
  }
};
