import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [chats, setChats] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      // Using detailed endpoints for ratings and chats
      const [
        vendorsRes,
        customersRes,
        productsRes,
        ratingsRes,
        chatsRes,
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/vendors"),
        axios.get("http://localhost:5000/api/customers"),
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/ratings/all-details"),
        axios.get("http://localhost:5000/api/chats/all-details"),
      ]);
      setVendors(vendorsRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
      setRatings(ratingsRes.data);
      setChats(chatsRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load admin dashboard data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteRating = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/ratings/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting rating:", err);
    }
  };

  const deleteChat = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/chats/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>🛡️ Admin Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Chart Section */}
      <div className="chart-section">
        <Bar
          data={{
            labels: ["Vendors", "Customers", "Products", "Ratings", "Chats"],
            datasets: [
              {
                label: "Total",
                data: [
                  vendors.length,
                  customers.length,
                  products.length,
                  ratings.length,
                  chats.length,
                ],
                backgroundColor: [
                  "#007bff",
                  "#28a745",
                  "#ffc107",
                  "#dc3545",
                  "#6f42c1",
                ],
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: "top" } } }}
        />
      </div>

      {/* Vendors Table */}
      <div className="admin-section">
        <h2>Vendors</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Owner</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id}>
                <td data-label="Business Name">{v.businessName}</td>
                <td data-label="Owner">{v.name}</td>
                <td data-label="Email">{v.email}</td>
                <td data-label="Phone">{v.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customers Table */}
      <div className="admin-section">
        <h2>Customers</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td data-label="Name">{c.name}</td>
                <td data-label="Email">{c.email}</td>
                <td data-label="Phone">{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Products Table */}
      <div className="admin-section">
        <h2>Products</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Vendor</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const vendor = vendors.find(
                (v) => v._id.toString() === p.vendorId.toString()
              );
              return (
                <tr key={p._id}>
                  <td data-label="Product Name">{p.name}</td>
                  <td data-label="Price">₹{p.price}</td>
                  <td data-label="Vendor">
                    {vendor ? vendor.businessName || vendor.name : "Unknown"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ratings Table */}
      <div className="admin-section">
        <h2>Ratings</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((r) => (
              <tr key={r._id}>
                <td data-label="Vendor">
                  {r.vendorId?.businessName || r.vendorId?.name || r.vendorId}
                </td>
                <td data-label="Customer">
                  {r.customerId?.name || r.customerId?.email || r.customerId}
                </td>
                <td data-label="Rating">{r.rating} ★</td>
                <td data-label="Review">{r.review}</td>
                <td data-label="Action">
                  <button onClick={() => deleteRating(r._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chats Table */}
      <div className="admin-section">
        <h2>Chat Messages</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((c) => (
              <tr key={c._id}>
                <td data-label="Sender">{c.senderName || c.senderId}</td>
                <td data-label="Receiver">{c.receiverName || c.receiverId}</td>
                <td data-label="Message">{c.message}</td>
                <td data-label="Action">
                  <button onClick={() => deleteChat(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;