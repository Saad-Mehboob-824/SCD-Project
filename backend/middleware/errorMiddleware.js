// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle different types of errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      message: "Unauthorized access",
      error: err.message,
    });
  }

  if (err.name === "MongoError" && err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate key error",
      error: "An item with this unique identifier already exists",
    });
  }

  // Generic server error
  res.status(500).json({
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
};

module.exports = errorHandler;
