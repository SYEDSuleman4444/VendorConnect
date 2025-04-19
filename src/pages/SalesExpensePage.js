import React, { useState, useEffect } from "react";
import axios from "axios";
import SalesExpenseForm from "./SalesExpenseForm";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesExpensePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [profit, setProfit] = useState(0);
  const [heroProduct, setHeroProduct] = useState(null);
  const [lossProduct, setLossProduct] = useState(null);
  const vendorId = localStorage.getItem("vendorId");

  const fetchTransactions = async () => {
    if (!vendorId) {
      console.error("Vendor ID not found in localStorage.");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions/vendor/${vendorId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (vendorId) fetchTransactions();
  }, [vendorId]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = transactions.filter((txn) => {
        const txnDate = new Date(txn.date).toISOString().split("T")[0];
        return txnDate === selectedDate;
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, selectedDate]);

  const refreshData = async () => {
    await fetchTransactions();
    setSelectedDate("");
  };

  const productSummary = {};
  filteredTransactions.forEach((txn) => {
    const product = txn.productName;
    if (!product) return;
    if (!productSummary[product]) {
      productSummary[product] = { sale: 0, expense: 0 };
    }
    if (txn.type === "sale") {
      productSummary[product].sale += txn.amount;
    } else if (txn.type === "expense") {
      productSummary[product].expense += txn.amount;
    }
  });

  const productLabels = Object.keys(productSummary);
  const salesData = productLabels.map((product) => productSummary[product].sale);
  const expenseData = productLabels.map((product) => productSummary[product].expense);

  let totalSale = 0, totalExpense = 0;
  productLabels.forEach((product) => {
    totalSale += productSummary[product].sale;
    totalExpense += productSummary[product].expense;
  });
  const overallProfit = totalSale - totalExpense;

  useEffect(() => {
    let hero = null;
    let maxSale = 0;
    let loss = null;
    let maxLoss = 0;
    productLabels.forEach((product) => {
      const saleVal = productSummary[product]?.sale || 0;
      const expenseVal = productSummary[product]?.expense || 0;
      if (saleVal > maxSale) {
        maxSale = saleVal;
        hero = product;
      }
      if (expenseVal > saleVal) {
        const currentLoss = expenseVal - saleVal;
        if (currentLoss > maxLoss) {
          maxLoss = currentLoss;
          loss = product;
        }
      }
    });
    if (productLabels.length === 0) {
      setHeroProduct(null);
      setLossProduct(null);
      setProfit(0);
    } else {
      setProfit(overallProfit);
      setHeroProduct(hero);
      setLossProduct(loss);
    }
  }, [filteredTransactions]);

  const salesChartData = {
    labels: productLabels,
    datasets: [
      {
        label: "Sales",
        data: salesData,
        backgroundColor: "#4caf50",
        borderColor: "#388e3c",
        borderWidth: 1,
      },
    ],
  };

  const expenseChartData = {
    labels: productLabels,
    datasets: [
      {
        label: "Expenses",
        data: expenseData,
        backgroundColor: "#f44336",
        borderColor: "#d32f2f",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true },
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sales & Expense Dashboard</h2>
      <SalesExpenseForm vendorId={vendorId} onTransactionRecorded={fetchTransactions} />
      <label style={styles.dateLabel}>Filter by Date: </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={styles.dateInput}
      />
      <button style={styles.refreshButton} onClick={refreshData}>
        Refresh Data
      </button>
      <div style={styles.chartsContainer}>
        <div style={styles.chartItem}>
          <h3>Sales by Product</h3>
          <Bar data={salesChartData} options={{ ...chartOptions, title: { display: true, text: "Sales by Product" } }} />
        </div>
        <div style={styles.chartItem}>
          <h3>Expenses by Product</h3>
          <Bar data={expenseChartData} options={{ ...chartOptions, title: { display: true, text: "Expenses by Product" } }} />
        </div>
      </div>
      <div style={styles.info}>
        <p><strong>Total Sales:</strong> ₹{totalSale.toFixed(2)}</p>
        <p><strong>Total Expenses:</strong> ₹{totalExpense.toFixed(2)}</p>
        <p><strong>Profit:</strong> ₹{overallProfit.toFixed(2)}</p>
        {heroProduct && productSummary[heroProduct] && (
          <p><strong>Hero Product:</strong> {heroProduct} (Sales: ₹{productSummary[heroProduct].sale.toFixed(2)})</p>
        )}
        {lossProduct && productSummary[lossProduct] && (
          <p><strong>Product in Loss:</strong> {lossProduct} (Loss: ₹{(productSummary[lossProduct].expense - productSummary[lossProduct].sale).toFixed(2)})</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#f0f4f8",
    minHeight: "100vh",
    fontFamily: "'Arial', sans-serif",
  },
  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  dateLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "16px",
    textAlign: "center",
  },
  dateInput: {
    display: "block",
    margin: "0 auto 20px auto",
    padding: "8px 10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  refreshButton: {
    display: "block",
    margin: "0 auto 20px auto",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  chartsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  chartItem: {
    flex: "1",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  info: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "18px",
    color: "#333",
  },
};

export default SalesExpensePage;