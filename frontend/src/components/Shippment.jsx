import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Shipment = () => {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const [sellerInfo, setSellerInfo] = useState({
    name: "",
    storeName: "",
    token: "",
  });

  const [shippingCost, setShippingCost] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/shippment/validate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sellerToken")}`,
          },
          body: JSON.stringify(address),
        }
      );

      const data = await response.json();

      if (response.ok && data.data?.status === "verified") {
        setError("");
        return true;
      } else {
        setError(data.errors?.join(", ") || "Invalid address");
        return false;
      }
    } catch (err) {
      setError("Error validating address");
      return false;
    }
  };

  const calculateShippingCost = async () => {
    if (!(await validateAddress())) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/shippment/calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sellerToken")}`,
          },
          body: JSON.stringify({
            ship_to: address,
            packages: [
              {
                weight: { value: 5, unit: "pound" },
                dimensions: { length: 10, width: 5, height: 4, unit: "inch" },
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShippingCost(data.shipping_amount);
        setError("");
      } else {
        setError(data.errors?.join(", ") || "Error calculating shipping cost");
      }
    } catch (err) {
      setError("Error calculating shipping cost");
    }
  };

  return (
    <div>
      <h2>Shipping Details</h2>
      <div>
        <p>
          <strong>Seller Name:</strong> {sellerInfo.name}
        </p>
        <p>
          <strong>Store Name:</strong> {sellerInfo.storeName}
        </p>
      </div>
      <div>
        {["street", "city", "state", "postalCode", "country"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={address[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          />
        ))}
        <button onClick={calculateShippingCost}>Calculate Shipping</button>
      </div>
      {error && <p>{error}</p>}
      {shippingCost !== null && (
        <p>Shipping Cost: ${shippingCost.toFixed(2)}</p>
      )}
    </div>
  );
};

export default Shipment;
