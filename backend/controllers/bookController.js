const Book = require("../models/book");
const mongoose = require("mongoose");

exports.addBook = async (req, res, next) => {
  try {
    const { title, author, price, stock, description, genre, isbn } = req.body;

    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    const newBook = new Book({
      title,
      author,
      price,
      stock,
      description,
      genre,
      isbn,
      seller: req.seller._id,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const updateData = req.body;

    const book = await Book.findOneAndUpdate(
      { _id: id, seller: req.seller._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findOneAndDelete({
      _id: id,
      seller: req.seller._id,
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getSellerBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ seller: req.seller._id });
    res.json(books);
  } catch (error) {
    next(error);
  }
};
