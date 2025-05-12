import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./DeleteBook.module.css";
import { Trash2 } from "lucide-react";

const DeleteBook = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
        setErrorMessage("Failed to fetch books. Please try again.");
      }
    };

    fetchBooks();
  }, [navigate]);

  const handleBookSelect = (book) => {
    // If the same book is clicked again, deselect it
    setSelectedBook((prevSelected) =>
      prevSelected?._id === book._id ? null : book
    );
    // Reset messages when selecting a new book
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedBook.title}"?`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("sellerToken");
      await axios.delete(
        `http://localhost:5000/api/books/delete/${selectedBook._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the deleted book from the list
      setBooks((prevBooks) =>
        prevBooks.filter((book) => book._id !== selectedBook._id)
      );

      setSuccessMessage(`Book "${selectedBook.title}" deleted successfully!`);
      setSelectedBook(null);
    } catch (error) {
      console.error("Delete Book Error:", error.response?.data);
      setErrorMessage(error.response?.data?.message || "Failed to delete book");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.deleteBookContainer}>
      <h2>Delete Book</h2>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

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

              {selectedBook?._id === book._id && (
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent book selection when clicking delete
                    handleDelete();
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 className={styles.deleteIcon} />
                      Delete Book
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeleteBook;
