import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./AddBook.module.css";

const LocalStorageKeys = {
  TOKEN: "sellerToken",
  SELLER_ID: "sellerId",
  SELLER_NAME: "sellerName",
  STORE_NAME: "storeName",
};

const AddBook = () => {
  const navigate = useNavigate();
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    genre: "",
    publicationYear: "",
    stock: "",
    coverImage: null,
    isbn: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [sellerInfo, setSellerInfo] = useState({
    token: "",
    name: "",
    storeName: "",
    id: "",
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem(LocalStorageKeys.TOKEN);
    const sellerName = localStorage.getItem(LocalStorageKeys.SELLER_NAME);
    const storeName = localStorage.getItem(LocalStorageKeys.STORE_NAME);
    const sellerId = localStorage.getItem(LocalStorageKeys.SELLER_ID);

    if (!token) {
      // Redirect to login if no token
      navigate("/login");
      return;
    }

    setSellerInfo({
      token,
      name: sellerName || "",
      storeName: storeName || "",
      id: sellerId || "",
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setBookData((prev) => ({
      ...prev,
      [name]: name === "coverImage" ? files[0] : value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bookData.title.trim()) newErrors.title = "Title is required";
    if (!bookData.author.trim()) newErrors.author = "Author is required";
    if (!bookData.price) newErrors.price = "Price is required";
    if (parseFloat(bookData.price) <= 0)
      newErrors.price = "Price must be positive";
    if (!bookData.genre) newErrors.genre = "Genre is required";
    if (!bookData.stock) newErrors.stock = "Stock quantity is required";
    if (parseInt(bookData.stock) < 0)
      newErrors.stock = "Stock quantity cannot be negative";

    // Optional but recommended validations
    if (
      bookData.publicationYear &&
      (isNaN(bookData.publicationYear) ||
        parseInt(bookData.publicationYear) > new Date().getFullYear())
    ) {
      newErrors.publicationYear = "Invalid publication year";
    }

    if (bookData.isbn && !/^(97(8|9))?\d{9}(\d|X)$/.test(bookData.isbn)) {
      newErrors.isbn = "Invalid ISBN format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Validate token exists
        if (!sellerInfo.token) {
          alert("Authentication failed. Please login again.");
          navigate("/login");
          return;
        }

        const response = await axios.post(
          "http://localhost:5000/api/books/add",
          {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            price: parseFloat(bookData.price),
            genre: bookData.genre,
            stock: parseInt(bookData.stock),
            isbn: bookData.isbn,
            publicationYear: bookData.publicationYear
              ? parseInt(bookData.publicationYear)
              : null,
          },
          {
            headers: {
              Authorization: `Bearer ${sellerInfo.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccessMessage("Book added successfully!");

        // Reset form after successful submission
        setBookData({
          title: "",
          author: "",
          description: "",
          price: "",
          genre: "",
          publicationYear: "",
          stock: "",
          coverImage: null,
          isbn: "",
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Book Addition Error:", error.response?.data);
        alert(error.response?.data?.message || "Book addition failed");
      }
    }
  };

  // Logout function
  const handleLogout = () => {
    // Remove all seller-related items from localStorage
    Object.values(LocalStorageKeys).forEach((key) =>
      localStorage.removeItem(key)
    );
    navigate("/login");
  };

  return (
    <div className={styles.addBookContainer}>
      <div className={styles.headerInfo}>
        <div className={styles.sellerDetails}>
          <h3>Welcome, {sellerInfo.name}</h3>
          <p>Store: {sellerInfo.storeName}</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.formWrapper}>
        <h2>Add New Book</h2>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.bookForm}>
          <div className={styles.formGroup}>
            <label>Book Title</label>
            <input
              type="text"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              placeholder="Enter book title"
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
              placeholder="Enter author name"
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
              placeholder="Enter book description"
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
              placeholder="Enter book price"
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
            <label>Publication Year</label>
            <input
              type="number"
              name="publicationYear"
              value={bookData.publicationYear}
              onChange={handleChange}
              placeholder="Enter publication year"
              className={errors.publicationYear ? styles.inputError : ""}
            />
            {errors.publicationYear && (
              <span className={styles.errorText}>{errors.publicationYear}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={bookData.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
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
              placeholder="Enter ISBN"
              className={errors.isbn ? styles.inputError : ""}
            />
            {errors.isbn && (
              <span className={styles.errorText}>{errors.isbn}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            {/* <label>Cover Image</label>
            <input
              type="file"
              name="coverImage"
              onChange={handleChange}
              accept="image/*"
            /> */}
          </div>

          <button type="submit" className={styles.submitButton}>
            Add Book
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
