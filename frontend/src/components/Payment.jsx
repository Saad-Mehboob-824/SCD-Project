import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Payment.module.css";

const Payment = () => {
  const [paymentForm, setPaymentForm] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [sellerInfo, setSellerInfo] = useState({
    name: "",
    storeName: "",
    token: "",
  });
  const navigate = useNavigate();
  const cardContainerRef = useRef(null);
  const [formInitialized, setFormInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sellerToken");
    const sellerName = localStorage.getItem("sellerName");
    const storeName = localStorage.getItem("storeName");

    if (!token) {
      navigate("/login");
      return;
    }

    setSellerInfo({
      name: sellerName || "",
      storeName: storeName || "",
      token: token,
    });
  }, [navigate]);

  useEffect(() => {
    if (!sellerInfo.token || formInitialized) return;

    const initializePaymentForm = async () => {
      const locationId = "L6S2R7XV82629"; // Use static Location ID

      try {
        if (!window.Square) {
          console.error("Square Web Payments SDK not loaded.");
          return;
        }

        const payments = window.Square.payments(
          "sandbox-sq0idb-bO8aRhgVJv6Vmpayc8bhPw",
          locationId
        );

        const form = await payments.card();
        await form.attach(cardContainerRef.current);
        setPaymentForm(form);
        setFormInitialized(true);
      } catch (error) {
        console.error("Failed to initialize payment form", error);
        setPaymentStatus("Failed to initialize payment form");
      }
    };

    initializePaymentForm();
  }, [sellerInfo.token, formInitialized]);

  const handlePayment = async () => {
    // Log all environment variables to debug
    console.log("All environment variables:", import.meta.env);

    if (!paymentForm) {
      setPaymentStatus("Payment form not initialized");
      return;
    }

    setLoading(true);
    setPaymentStatus("");

    try {
      const result = await paymentForm.tokenize();
      if (result.status === "OK") {
        const paymentData = {
          sourceId: result.token,
          amount: 100, // $1.00 in cents
          currency: "USD",
          description: "Store Payment",
          sellerName: sellerInfo.name,
          storeName: sellerInfo.storeName,
        };

        // Hardcode the URL for debugging
        const response = await fetch(
          "http://localhost:5000//api/payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("sellerToken")}`,
            },
          body: JSON.stringify(paymentData),
        });

        // Log full response details
        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        const responseText = await response.text();
        console.log("Response text:", responseText);

        // Try to parse the response text
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          setPaymentStatus("Error parsing server response");
          return;
        }

        if (response.ok) {
          setPaymentStatus("Payment successful!");
        } else {
          setPaymentStatus(data?.message || "Payment failed.");
        }
      } else {
        setPaymentStatus(
          "Payment not completed. Please check your card details."
        );
      }
    } catch (error) {
      console.error("Full Payment Error:", error);
      setPaymentStatus("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <h2>Complete Your Payment</h2>
      <p>
        Welcome, <strong>{sellerInfo.name}</strong>! Processing payments for{" "}
        <strong>{sellerInfo.storeName}</strong>.
      </p>
      <div
        ref={cardContainerRef}
        id="card-container"
        className={styles.cardContainer}
      ></div>
      <button
        onClick={handlePayment}
        className={styles.payButton}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay $1.00"}
      </button>
      {paymentStatus && <p className={styles.paymentStatus}>{paymentStatus}</p>}
    </div>
  );
};

export default Payment;
