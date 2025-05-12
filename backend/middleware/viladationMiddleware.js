const { body, validationResult } = require("express-validator");

exports.validateBookAddition = [
  body("title")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Title must be at least 2 characters long")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("author")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Author name must be at least 2 characters long")
    .isLength({ max: 100 })
    .withMessage("Author name cannot exceed 100 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("isbn")
    .trim()
    .matches(
      /^(?:ISBN(?:-13)?:? )?(?:\d{9}[\dX]|\d{13})$|^(?:\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-[\dX])$/
    )
    .withMessage("Invalid ISBN format"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateSellerRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/)
    .withMessage(
      "Password must include one lowercase character, one uppercase character, a number, and a special character"
    ),

  body("storeName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Store name must be at least 2 characters long")
    .isLength({ max: 100 })
    .withMessage("Store name cannot exceed 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
