import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./SalesReport.module.css";

const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("month");

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        const token = localStorage.getItem("sellerToken");
        if (!token) {
          alert("You need to log in first.");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/sales/generate?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReportData(response.data.report);
        setMetadata(response.data.metadata);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sales report:", error);
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, [startDate, endDate, groupBy]);

  const handleGroupByChange = (event) => setGroupBy(event.target.value);

  const handleStartDateChange = (event) => setStartDate(event.target.value);

  const handleEndDateChange = (event) => setEndDate(event.target.value);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.reportContainer}>
      <h2 className={styles.title}>Sales Report</h2>

      <div className={styles.filters}>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className={styles.filterInput}
        />
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className={styles.filterInput}
        />
        <select
          value={groupBy}
          onChange={handleGroupByChange}
          className={styles.filterSelect}
        >
          <option value="month">Month</option>
          <option value="book">Book</option>
        </select>
      </div>

      <div className={styles.metadata}>
        <p>Total Sales: {metadata?.totalSales}</p>
        <p>Total Books Sold: {metadata?.totalBooksSold}</p>
        {metadata?.reportPeriod.start && metadata?.reportPeriod.end && (
          <p>
            Report Period:{" "}
            {new Date(metadata.reportPeriod.start).toLocaleDateString()} -{" "}
            {new Date(metadata.reportPeriod.end).toLocaleDateString()}
          </p>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Book</th>
            <th>Total Revenue</th>
            <th>Total Quantity</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.map((item, index) => (
            <tr key={index}>
              <td>{item._id}</td>
              <td>{item.totalRevenue}</td>
              <td>{item.totalQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;
