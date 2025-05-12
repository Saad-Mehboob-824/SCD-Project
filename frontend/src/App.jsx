import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/SignUp.jsx";
import Login from "./components/Login";
import AddBook from "./components/AddBook.jsx";
import Dashboard from "./components/Dashboard.jsx";
import UpdateBook from "./components/UpdateBook.jsx";
import DeleteBook from "./components/DeleteBook.jsx";
import Shippment from "./components/Shippment.jsx";
import Payment from "./components/Payment.jsx";
import Refund from "./components/Refund.jsx";
import Sales from "./components/SalesReport.jsx"; // You'll need to create this
//import Dashboard from "./components/Dashboard"; // You'll need to create this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/addbook" element={<AddBook />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/updatebook" element={<UpdateBook />} />
        <Route path="/deletebook" element={<DeleteBook />} />
        <Route path="/shippment" element={<Shippment />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/salesreport" element={<Sales />} />
        {/* Add a default or home route if needed */}
        <Route path="/" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
