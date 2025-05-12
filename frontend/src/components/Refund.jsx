import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Refund.module.css";

const Refund = () => {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const token = localStorage.getItem("sellerToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const refundsResponse = await axios.get(
          "http://localhost:5000/api/refund/list",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRefunds(refundsResponse.data);
      } catch (error) {
        console.error("Error fetching refunds:", error);
        alert("Failed to fetch refunds. Please try again.");
      }
    };

    fetchRefunds();
  }, [navigate]);

  const handleRefundAction = async (status) => {
    if (!selectedRefund) return;

    try {
      const token = localStorage.getItem("sellerToken");

      const response = await axios.put(
        `http://localhost:5000/api/refund/update/${selectedRefund._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update refunds list
      setRefunds((prev) =>
        prev.map((refund) =>
          refund._id === selectedRefund._id ? response.data : refund
        )
      );

      setSuccessMessage(`Refund ${status.toLowerCase()} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setSelectedRefund(null);
    } catch (error) {
      console.error("Refund update error:", error.response?.data);
      alert(error.response?.data?.message || "Refund update failed");
    }
  };

  return (
    <div className={styles.refundContainer}>
      <h2>Refund Management</h2>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <div className={styles.refundListContainer}>
        <h3>Customer Refund Requests</h3>
        <div className={styles.refundList}>
          {refunds.map((refund) => (
            <div
              key={refund._id}
              className={`${styles.refundItem} ${
                selectedRefund?._id === refund._id ? styles.selected : ""
              }`}
              onClick={() => setSelectedRefund(refund)}
            >
              <h4>
                {refund.book?.title || "Unknown Title"}
              </h4>
              <p>Status: {refund.status}</p>
              <p>Purchase ID: {refund.purchaseId}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedRefund && (
        <div className={styles.refundDetails}>
          <h3>Refund Details</h3>
          <div className={styles.detailGroup}>
            <strong>Book:</strong> {selectedRefund.book?.title || "Unknown Title"}
          </div>
          <div className={styles.detailGroup}>
            <strong>Purchase ID:</strong> {selectedRefund.purchaseId}
          </div>
          <div className={styles.detailGroup}>
            <strong>Reason:</strong> {selectedRefund.reason || "No reason provided"}
          </div>
          <div className={styles.actionButtons}>
            <button
              onClick={() => handleRefundAction("Approved")}
              className={styles.approveButton}
            >
              Approve Refund
            </button>
            <button
              onClick={() => handleRefundAction("Rejected")}
              className={styles.rejectButton}
            >
              Reject Refund
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refund;
