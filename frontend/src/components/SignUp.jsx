import React, { useState } from "react";
import axios from "axios";
import styles from "./Signup.module.css";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    contactNumber: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.storeName) newErrors.storeName = "Store Name is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            storeName: formData.storeName,
            contactNumber: formData.contactNumber,
          }
        );

        alert("Registration Successful! Please check your email to verify.");
        navigate("/login");
      } catch (error) {
        console.error("Registration Error:", error.response?.data);
        alert(error.response?.data?.message || "Registration Failed");
      }
    }
  };

  return (
    <div className={styles.signupContainer}>
      <header className={styles.header}>
        <h1>Seller Registration</h1>
      </header>

      <main className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Store Name</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Enter your store name"
            />
            {errors.storeName && (
              <span className={styles.errorText}>{errors.storeName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter your contact number"
            />
            {errors.contactNumber && (
              <span className={styles.errorText}>{errors.contactNumber}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Register
          </button>

          <div className={styles.loginLink}>
            Already have an account? <a href="/login">Login</a>
          </div>
        </form>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 E-Book Store. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default SignUp;
