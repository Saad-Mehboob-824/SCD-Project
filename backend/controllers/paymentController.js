const Square = require("square");
const crypto = require('crypto');
const Payment = require("../models/payment");

// Initialize Square API client
const client = new Square.Client({
  accessToken:
    "EAAAl4HKwypvzQXQGdhTxvcloUBoPKJbWEJmFX5GKrK0GSnBaMOB6xazTVSAv1RD",
  environment: process.env.NODE_ENV === "sandbox",
});

// Controller to handle payment creation
exports.createPayment = async (req, res) => {
  try {
    const { amount, currency, sourceId, description, sellerName, storeName } =
      req.body;

    // Validate input with more detailed logging
    if (!amount) {
      return res.status(400).json({ message: "Amount is required." });
    }
    if (!currency) {
      return res.status(400).json({ message: "Currency is required." });
    }
    if (!sourceId) {
      return res.status(400).json({ message: "Source ID is required." });
    }

    // Create payment using Square API
    const paymentsApi = client.paymentsApi;
    const body = {
      sourceId: sourceId,
      amountMoney: {
        amount: amount, // Amount in cents
        currency: currency,
      },
      autocomplete: true,
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: crypto.randomBytes(16).toString("hex"), // Prevent duplicate payments
    };

    const response = await paymentsApi.createPayment(body);

    // Save payment to database
    const newPayment = new Payment({
      paymentId: response.result.payment.id,
      status: response.result.payment.status,
      amount: amount,
      currency: currency,
      description: description || "Store Payment",
      userId: req.seller._id, // Use seller ID instead of user ID
      sellerName: sellerName,
      storeName: storeName,
    });

    await newPayment.save();

    res.status(200).json({
      message: "Payment successful",
      paymentDetails: newPayment,
    });
  } catch (error) {
    console.error("Payment Creation Error:", error);
    res.status(500).json({
      message: "Payment failed.",
      error: error.response ? error.response.text : error.message,
    });
  }
};
// Controller to fetch all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id });
    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch payments.", error: error.message });
  }
};

// Controller to fetch payment details by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      paymentId: req.params.id,
      userId: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    res.status(200).json(payment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch payment.", error: error.message });
  }
};
