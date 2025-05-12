import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sellerInfo, setSellerInfo] = useState({
    name: "",
    storeName: "",
    token: "",
  });

  useEffect(() => {
    // Check authentication on component mount
    const token = localStorage.getItem("sellerToken");
    const sellerName = localStorage.getItem("sellerName");
    const storeName = localStorage.getItem("storeName");

    if (!token) {
      // Redirect to login if no token
      navigate("/login");
      return;
    }

    setSellerInfo({
      name: sellerName || "",
      storeName: storeName || "",
      token: token,
    });
  }, [navigate]);

  const handleLogout = () => {
    // Remove all seller-related items from localStorage
    const storageKeysToRemove = [
      "sellerToken",
      "sellerId",
      "sellerName",
      "storeName",
    ];

    storageKeysToRemove.forEach((key) => localStorage.removeItem(key));

    // Redirect to login page
    navigate("/login");
  };

  const DashboardCard = ({ title, icon, link }) => (
    <Link to={link} className={styles.dashboardCard}>
      <div className={styles.cardContent}>
        <div className={styles.cardIcon}>{icon}</div>
        <h3>{title}</h3>
      </div>
    </Link>
  );

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.sellerInfo}>
          <h2>Welcome, {sellerInfo.name}</h2>
          <p>Store: {sellerInfo.storeName}</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main className={styles.dashboardGrid}>
        <DashboardCard title="Add Book" icon="📖" link="/addbook" />
        <DashboardCard title="Update Book" icon="✏️" link="/updatebook" />
        <DashboardCard title="Delete Book" icon="🗑️" link="/deletebook" />
        {/* <DashboardCard 
          title="View Orders" 
          icon="📦" 
          link="/vieworders" 
        />
        <DashboardCard 
          title="Update Order Status" 
          icon="🔄" 
          link="/updateorderstatus" 
        /> */}
        <DashboardCard title="Process Refunds" icon="💰" link="/refund" />
        <DashboardCard title="Sales Report" icon="📊" link="/salesreport" />
      </main>

      {/* <section className={styles.quickStatsSection}>
        <h3>Quick Stats</h3>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <h4>Total Books</h4>
            <p>0</p>
          </div>
          <div className={styles.statCard}>
            <h4>Total Orders</h4>
            <p>0</p>
          </div>
          <div className={styles.statCard}>
            <h4>Total Revenue</h4>
            <p>$0</p>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Dashboard;
