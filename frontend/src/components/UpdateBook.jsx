import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./UpdateBook.module.css";

const UpdateBook = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    genre: "",
    stock: "",
    isbn: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Fetch seller's books on component mount
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("sellerToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/books/inventory",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        alert("Failed to fetch books. Please try again.");
      }
    };

    fetchBooks();
  }, [navigate]);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setBookData({
      title: book.title,
      author: book.author,
      description: book.description || "",
      price: book.price.toString(),
      genre: book.genre,
      stock: book.stock.toString(),
      isbn: book.isbn,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bookData.title.trim()) newErrors.title = "Title is required";
    if (bookData.title.trim().length < 2)
      newErrors.title = "Title must be at least 2 characters";
    if (bookData.title.trim().length > 200)
      newErrors.title = "Title cannot exceed 200 characters";

    if (!bookData.author.trim()) newErrors.author = "Author is required";
    if (bookData.author.trim().length < 2)
      newErrors.author = "Author name must be at least 2 characters";
    if (bookData.author.trim().length > 100)
      newErrors.author = "Author name cannot exceed 100 characters";

    if (!bookData.price) newErrors.price = "Price is required";
    if (parseFloat(bookData.price) < 0)
      newErrors.price = "Price must be positive";

    if (!bookData.stock) newErrors.stock = "Stock quantity is required";
    if (parseInt(bookData.stock) < 0)
      newErrors.stock = "Stock quantity cannot be negative";

    if (!bookData.genre) newErrors.genre = "Genre is required";

    if (!bookData.isbn) newErrors.isbn = "ISBN is required";
    const isbnRegex =
      /^(?:ISBN(?:-13)?:? )?(?:\d{9}[\dX]|\d{13})$|^(?:\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-[\dX])$/;
    if (!isbnRegex.test(bookData.isbn)) newErrors.isbn = "Invalid ISBN format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBook) {
      alert("Please select a book to update");
      return;
    }

    if (validateForm()) {
      try {
        const token = localStorage.getItem("sellerToken");

        const response = await axios.put(
          `http://localhost:5000/api/books/update/${selectedBook._id}`,
          {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            price: parseFloat(bookData.price),
            genre: bookData.genre,
            stock: parseInt(bookData.stock),
            isbn: bookData.isbn,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Update the books list with the updated book
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book._id === selectedBook._id ? response.data : book
          )
        );

        setSuccessMessage("Book updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Book Update Error:", error.response?.data);
        alert(error.response?.data?.message || "Book update failed");
      }
    }
  };

  return (
    <div className={styles.updateBookContainer}>
      <h2>Update Book</h2>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <div className={styles.bookListContainer}>
        <h3>Your Books</h3>
        <div className={styles.bookList}>
          {books.map((book) => (
            <div
              key={book._id}
              className={`${styles.bookItem} ${
                selectedBook?._id === book._id ? styles.selected : ""
              }`}
              onClick={() => handleBookSelect(book)}
            >
              <h4>{book.title}</h4>
              <p>{book.author}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedBook && (
        <form onSubmit={handleSubmit} className={styles.updateBookForm}>
          <div className={styles.formGroup}>
            <label>Book Title</label>
            <input
              type="text"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              className={errors.title ? styles.inputError : ""}
            />
            {errors.title && (
              <span className={styles.errorText}>{errors.title}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Author</label>
            <input
              type="text"
              name="author"
              value={bookData.author}
              onChange={handleChange}
              className={errors.author ? styles.inputError : ""}
            />
            {errors.author && (
              <span className={styles.errorText}>{errors.author}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={bookData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={bookData.price}
              onChange={handleChange}
              step="0.01"
              className={errors.price ? styles.inputError : ""}
            />
            {errors.price && (
              <span className={styles.errorText}>{errors.price}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Genre</label>
            <select
              name="genre"
              value={bookData.genre}
              onChange={handleChange}
              className={errors.genre ? styles.inputError : ""}
            >
              <option value="">Select Genre</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Biography">Biography</option>
              <option value="Technology">Technology</option>
            </select>
            {errors.genre && (
              <span className={styles.errorText}>{errors.genre}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={bookData.stock}
              onChange={handleChange}
              className={errors.stock ? styles.inputError : ""}
            />
            {errors.stock && (
              <span className={styles.errorText}>{errors.stock}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>ISBN</label>
            <input
              type="text"
              name="isbn"
              value={bookData.isbn}
              onChange={handleChange}
              className={errors.isbn ? styles.inputError : ""}
            />
            {errors.isbn && (
              <span className={styles.errorText}>{errors.isbn}</span>
            )}
          </div>

          <button type="submit" className={styles.updateButton}>
            Update Book
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdateBook;
