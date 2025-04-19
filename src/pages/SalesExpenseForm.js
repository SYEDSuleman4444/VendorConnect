import React, { useState, useEffect } from "react";
import axios from "axios";

const SalesExpenseForm = ({ vendorId, onTransactionRecorded }) => {
  const [transaction, setTransaction] = useState({
    type: "sale",
    productName: "",
    amount: "",
  });
  const [message, setMessage] = useState("");
  const [vendorProducts, setVendorProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (!vendorId) return;

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/vendor/${vendorId}`);
        setVendorProducts(res.data);
      } catch (err) {
        console.error("Error fetching vendor products:", err);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/transactions/vendor/${vendorId}`);
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentTransactions(sorted.slice(0, 5));
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };

    fetchProducts();
    fetchTransactions();
  }, [vendorId]);

  const handleChange = (e) => {
    setTransaction({ ...transaction, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transaction.amount);
    if (amt <= 0) {
      setMessage("Error: Amount must be greater than 0.");
      return;
    }
    if (!transaction.productName) {
      setMessage("Error: Please select a product.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/transaction", {
        vendorId,
        productName: transaction.productName,
        type: transaction.type,
        amount: amt,
      });
      setMessage(res.data.message);
      setTransaction({ type: "sale", productName: "", amount: "" });
      if (onTransactionRecorded) onTransactionRecorded();
      refreshTransactions();
    } catch (err) {
      console.error("Transaction error:", err);
      setMessage("Error recording transaction.");
    }
  };

  const refreshTransactions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/transactions/vendor/${vendorId}`);
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentTransactions(sorted.slice(0, 5));
    } catch (err) {
      console.error("Error refreshing transactions:", err);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${transactionId}`);
      setMessage("✅ Transaction deleted successfully.");
      refreshTransactions();
    } catch (err) {
      console.error("❌ Error deleting transaction:", err);
      setMessage("❌ Error deleting transaction.");
    }
  };

  const handleDeleteAllTransactions = async () => {
    if (!window.confirm("Are you sure you want to delete ALL transactions?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/transactions/vendor/${vendorId}`);
      setMessage(res.data.message || "All transactions deleted.");
      refreshTransactions();
    } catch (err) {
      console.error("Error deleting all transactions:", err);
      setMessage("Error deleting all transactions.");
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Add Sale / Expense</h3>
      {message && <p style={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Type:
          <select name="type" value={transaction.type} onChange={handleChange} style={styles.select}>
            <option value="sale">Sale</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label style={styles.label}>
          Product:
          <select name="productName" value={transaction.productName} onChange={handleChange} required style={styles.select}>
            <option value="">-- Select Product --</option>
            {vendorProducts.map((prod) => (
              <option key={prod._id} value={prod.name}>{prod.name}</option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Amount:
          <input type="number" name="amount" value={transaction.amount} onChange={handleChange} placeholder="Enter amount" required style={styles.input} />
        </label>
        <button type="submit" style={styles.button}>Record Transaction</button>
      </form>

      <h4 style={{ marginTop: "30px", marginBottom: "10px", color: "#333" }}>Latest Transactions</h4>
      <div style={styles.transactionScrollBox}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {recentTransactions.map((txn) => (
            <li key={txn._id} style={styles.transactionItem}>
              <span><strong>{txn.type.toUpperCase()}</strong> - {txn.productName} - ₹{txn.amount}</span>
              <span style={{ fontSize: "12px", color: "#555" }}>({new Date(txn.date).toLocaleString()})</span>
              <button onClick={() => handleDeleteTransaction(txn._id)} style={styles.deleteBtn}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleDeleteAllTransactions} style={{ ...styles.button, backgroundColor: "#555", marginTop: "10px" }}>
        Delete All Transactions
      </button>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "450px",
    margin: "0 auto",
    marginBottom: "30px",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "15px",
  },
  message: {
    textAlign: "center",
    color: "red",
    marginBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "10px",
    color: "#555",
    fontWeight: "bold",
  },
  select: {
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
  },
  input: {
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#e91e63",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginBottom: "10px",
  },
  transactionScrollBox: {
    maxHeight: "180px",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    marginBottom: "10px",
  },
  transactionItem: {
    backgroundColor: "#f1f1f1",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  deleteBtn: {
    alignSelf: "flex-end",
    marginTop: "5px",
    padding: "5px 10px",
    fontSize: "12px",
    backgroundColor: "#ff5252",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
};

export default SalesExpenseForm;