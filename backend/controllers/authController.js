const Seller = require("../models/seller");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.registerSeller = async (req, res) => {
  try {
    const { name, email, password, storeName, contactNumber } = req.body;

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const seller = new Seller({
      name,
      email,
      password,
      storeName,
      contactNumber,
      isVerified: false,
    });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    seller.tokens = seller.tokens.concat({ token });

    await seller.save();

    await sendVerificationEmail(seller.email, verificationToken);

    res.status(201).json({
      message: "Seller registered successfully. Please verify your email.",
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email }).select("+password");
    if (!seller) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!seller.isVerified) {
      return res.status(403).json({ message: "Please verify your email" });
    }

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    seller.tokens = seller.tokens.concat({ token });
    await seller.save();

    res.json({
      token,
      sellerId: seller._id,
      name: seller.name,
      storeName: seller.storeName,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res
        .status(404)
        .json({ message: "No account with this email found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    seller.resetPasswordToken = resetTokenHash;
    seller.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await seller.save();

    await sendPasswordResetEmail(seller.email, resetToken);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Password reset failed", error: error.message });
  }
};

// Helper function to send verification email
async function sendVerificationEmail(email, token) {
  // Configure email sending logic
  // This is a placeholder - replace with actual email service implementation
}

// Helper function to send password reset email
async function sendPasswordResetEmail(email, token) {
  // Configure email sending logic
  // This is a placeholder - replace with actual email service implementation
}
