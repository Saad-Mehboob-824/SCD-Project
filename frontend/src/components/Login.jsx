import React, { useState } from "react";
import axios from "axios";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          { email: formData.email, password: formData.password }
        );

        localStorage.setItem("sellerToken", response.data.token);
        localStorage.setItem("sellerId", response.data.sellerId);
        localStorage.setItem("sellerName", response.data.name);
        localStorage.setItem("storeName", response.data.storeName);

        alert("Login Successful!");
        navigate("/dashboard");
      } catch (error) {
        alert(error.response?.data?.message || "Login Failed");
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <header className={styles.header}>
        <h1>Login</h1>
      </header>

      <main className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
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
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Login
          </button>

          <div className={styles.signupLink}>
            Don't have an account? <a href="/signup">Sign Up</a>
          </div>
        </form>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 E-Book Store. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
