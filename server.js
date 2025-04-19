const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const { ObjectId } = require("mongoose").Types;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);
app.use("/uploads", express.static("uploads"));

/* ============================
   MongoDB Connection
============================*/
mongoose
  .connect("mongodb://127.0.0.1:27017/vendorCustomerDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/* ============================
   Define Schemas & Models
============================*/

// Vendor Schema (extended with profilePhotoUrl and upiScannerUrl)
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  businessName: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  profilePhotoUrl: { type: String },
  upiScannerUrl: { type: String },
});
const Vendor = mongoose.model("Vendor", vendorSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
});
const Product = mongoose.model("Product", productSchema);

// Customer Schema (extended with profilePhotoUrl)
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  profilePhotoUrl: { type: String },
});
const Customer = mongoose.model("Customer", customerSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  productName: { type: String, required: true },
  type: { type: String, enum: ["sale", "expense"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);

// Chat Schema with TTL Index (messages expire after 1 hour)
const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
chatSchema.index({ timestamp: 1 }, { expireAfterSeconds: 3600 });
const Chat = mongoose.model("Chat", chatSchema);

// Rating Schema
const ratingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  rating: { type: Number, min: 1, max: 5 },
  review: String,
});
const Rating = mongoose.model("Rating", ratingSchema);

/* ============================
   Multer Configuration
============================*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/* ============================
   API Endpoints
============================*/

/* --- Vendor Endpoints --- */

// Vendor Registration
app.post("/api/vendors", async (req, res) => {
  try {
    const { name, email, phone, businessName, location } = req.body;
    if (!name || !email || !phone || !businessName || !location) {
      return res.status(400).json({ error: "❌ All fields are required." });
    }
    const formattedLocation = {
      type: "Point",
      coordinates: [location.longitude, location.latitude],
    };
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ error: "❌ Email already registered." });
    }
    const newVendor = new Vendor({
      name,
      email,
      phone,
      businessName,
      location: formattedLocation,
    });
    await newVendor.save();
    res.status(201).json({
      vendorId: newVendor._id,
      message: "✅ Vendor registered successfully!",
    });
  } catch (error) {
    console.error("Vendor Registration Error:", error);
    res.status(500).json({ error: "❌ Failed to register vendor. Try again." });
  }
});

// Vendor Login
app.post("/api/vendor-login", async (req, res) => {
  try {
    const { email, name } = req.body;
    const vendor = await Vendor.findOne({
      email: email.trim(),
      name: name.trim(),
    });
    if (!vendor) {
      return res.status(404).json({ error: "❌ Vendor not found, please register." });
    }
    res.status(200).json({ message: "✅ Login successful!", vendor });
  } catch (error) {
    console.error("Vendor Login Error:", error);
    res.status(500).json({ error: "❌ Failed to login. Try again." });
  }
});
app.get("/api/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors." });
  }
});


// Get Vendor by ID
app.get("/api/vendor/:vendorId", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    console.error("Get Vendor Error:", error);
    res.status(500).json({ error: "Server error, try again" });
  }
});

// Update Vendor Location
app.put("/api/vendor-location/:vendorId", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "❌ Latitude and longitude are required." });
    }
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.vendorId,
      { location: { type: "Point", coordinates: [longitude, latitude] } },
      { new: true }
    );
    if (!updatedVendor) {
      return res.status(404).json({ error: "❌ Vendor not found." });
    }
    res.status(200).json({
      message: "✅ Location updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor location:", error);
    res.status(500).json({ error: "❌ Server error." });
  }
});

// Upload Vendor Profile Photo
app.post("/api/vendor/profile-photo", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { vendorId } = req.body;
    if (!vendorId) return res.status(400).json({ error: "Vendor ID is required." });
    if (!req.file) return res.status(400).json({ error: "No profile photo uploaded." });
    const profilePhotoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { profilePhotoUrl },
      { new: true }
    );
    if (!updatedVendor)
      return res.status(404).json({ error: "Vendor not found." });
    res.status(200).json({ message: "Profile photo updated successfully.", profilePhotoUrl });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).json({ error: "❌ Failed to update profile photo." });
  }
});

// Remove Vendor Profile Photo
app.delete("/api/vendor/profile-photo/:vendorId", async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $unset: { profilePhotoUrl: "" } },
      { new: true }
    );
    if (!updatedVendor)
      return res.status(404).json({ error: "Vendor not found." });
    res.status(200).json({ message: "Profile photo removed successfully." });
  } catch (error) {
    console.error("Error removing profile photo:", error);
    res.status(500).json({ error: "Failed to remove profile photo." });
  }
});

// Upload UPI Scanner Image
app.post("/api/vendor/upi-scanner", upload.single("upiScanner"), async (req, res) => {
  try {
    const { vendorId } = req.body;
    if (!vendorId) return res.status(400).json({ error: "Vendor ID is required." });
    if (!req.file) return res.status(400).json({ error: "No UPI scanner image uploaded." });
    const upiScannerUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { upiScannerUrl },
      { new: true }
    );
    if (!updatedVendor) return res.status(404).json({ error: "Vendor not found." });
    res.status(200).json({ message: "UPI scanner image updated successfully.", upiScannerUrl });
  } catch (error) {
    console.error("Error updating UPI scanner image:", error);
    res.status(500).json({ error: "❌ Failed to update UPI scanner image." });
  }
});

// Remove UPI Scanner Image
app.delete("/api/vendor/upi-scanner/:vendorId", async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $unset: { upiScannerUrl: "" } },
      { new: true }
    );
    if (!updatedVendor)
      return res.status(404).json({ error: "Vendor not found." });
    res.status(200).json({ message: "UPI scanner image removed successfully." });
  } catch (error) {
    console.error("Error removing UPI scanner image:", error);
    res.status(500).json({ error: "Failed to remove UPI scanner image." });
  }
});

// --- Customer Endpoints ---

// Customer Login
app.post("/api/customer-login", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name)
      return res.status(400).json({ error: "❌ Email and name are required." });
    const customer = await Customer.findOne({ email: email.trim(), name: name.trim() });
    if (!customer)
      return res.status(404).json({ error: "❌ Customer not found, please register." });
    res.status(200).json({ message: "✅ Login successful!", customer });
  } catch (error) {
    console.error("❌ Customer Login Error:", error);
    res.status(500).json({ error: "❌ Failed to login. Try again." });
  }
});

// Customer Registration
app.post("/api/customers", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ error: "❌ All fields are required." });
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer)
      return res.status(400).json({ error: "❌ Email already registered." });
    const newCustomer = new Customer({ name, email, phone });
    await newCustomer.save();
    res.status(201).json({ message: "✅ Customer registered successfully!", customerId: newCustomer._id });
  } catch (error) {
    console.error("Customer Registration Error:", error);
    res.status(500).json({ error: "❌ Failed to register customer. Try again." });
  }
});

// Get All Customers (for admin dashboard)
app.get("/api/customers", async (req, res) => {
  try {
    const allCustomers = await Customer.find({});
    res.status(200).json(allCustomers);
  } catch (error) {
    console.error("Error fetching all customers:", error);
    res.status(500).json({ error: "Failed to fetch all customers." });
  }
});

// Get a Customer by ID (supports guest customer)
app.get("/api/customers/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    if (customerId === "guestCustomerId") {
      return res.status(200).json({ _id: "guestCustomerId", name: "Guest", email: "guest@example.com", phone: "N/A" });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId))
      return res.status(400).json({ error: "Invalid customer ID format." });
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: "Customer not found." });
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer." });
  }
});

// --- New Customer Profile Photo Endpoints ---

// Upload Customer Profile Photo
app.post("/api/customer/profile-photo", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: "Customer ID is required." });
    if (!req.file) return res.status(400).json({ error: "No profile photo uploaded." });
    const profilePhotoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { profilePhotoUrl },
      { new: true }
    );
    if (!updatedCustomer) return res.status(404).json({ error: "Customer not found." });
    res.status(200).json({ message: "Profile photo updated successfully.", profilePhotoUrl });
  } catch (error) {
    console.error("Error updating customer profile photo:", error);
    res.status(500).json({ error: "Failed to update profile photo." });
  }
});

// Remove Customer Profile Photo
app.delete("/api/customer/profile-photo/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $unset: { profilePhotoUrl: "" } },
      { new: true }
    );
    if (!updatedCustomer) return res.status(404).json({ error: "Customer not found." });
    res.status(200).json({ message: "Profile photo removed successfully." });
  } catch (error) {
    console.error("Error removing customer profile photo:", error);
    res.status(500).json({ error: "Failed to remove profile photo." });
  }
});

// --- Product Endpoints ---

// Get All Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "❌ Failed to fetch products." });
  }
});

// Add Product with Image Upload
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { vendorId, name, price } = req.body;
    if (!vendorId || !name || !price)
      return res.status(400).json({ error: "All fields are required" });
    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists)
      return res.status(404).json({ error: "Vendor not found" });
    let imageUrl = "";
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    const product = new Product({ vendorId, name, price, imageUrl });
    await product.save();
    res.status(201).json({ message: "✅ Product added successfully!", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "❌ Server error, try again." });
  }
});

// Get Products for a Vendor
app.get("/api/products/:vendorId", async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products for vendor:", error);
    res.status(500).json({ error: "Server error, try again" });
  }
});

// Delete a Product
app.delete("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product)
      return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "✅ Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "❌ Server error, try again" });
  }
});

// Alternate Route: Get Products by Vendor ID
app.get("/api/products/vendor/:vendorId", async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId });
    if (!products || products.length === 0)
      return res
        .status(404)
        .json({ error: "No products found for this vendor." });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products for vendor:", error);
    res.status(500).json({ error: "❌ Server error, try again." });
  }
});

// --- Transaction Endpoints ---

// Unified Transaction Endpoint
app.post("/api/transaction", async (req, res) => {
  try {
    const { vendorId, productName, type, amount } = req.body;
    if (!vendorId || !productName || !type || amount == null)
      return res.status(400).json({ error: "Vendor ID, product name, transaction type, and amount are required." });
    if (amount <= 0)
      return res.status(400).json({ error: "Transaction amount must be greater than 0." });
    const transaction = new Transaction({ vendorId, productName, type, amount });
    await transaction.save();
    res.status(201).json({ message: "Transaction recorded successfully!", transaction });
  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ error: "Server error while recording transaction." });
  }
});

// Get All Transactions for a Vendor
app.get("/api/transactions/vendor/:vendorId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ vendorId: req.params.vendorId });
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Server error, try again." });
  }
});

// Delete a Single Transaction by ID
app.delete("/api/transactions/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      console.warn("❌ Invalid transaction ID format:", transactionId);
      return res.status(400).json({ error: "Invalid transaction ID format." });
    }
    const deleted = await Transaction.findByIdAndDelete(transactionId);
    if (!deleted) return res.status(404).json({ error: "Transaction not found." });
    res.status(200).json({ message: "Transaction deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting transaction:", error);
    res.status(500).json({ error: "Server error while deleting transaction." });
  }
});

// Delete All Transactions for a Vendor
app.delete("/api/transactions/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(vendorId))
      return res.status(400).json({ error: "Invalid vendor ID." });
    const result = await Transaction.deleteMany({ vendorId });
    res.status(200).json({ message: `${result.deletedCount} transaction(s) deleted.` });
  } catch (error) {
    console.error("❌ Error deleting all transactions:", error);
    res.status(500).json({ error: "Failed to delete all transactions." });
  }
});

// Get Transaction Summary for a Vendor
app.get("/api/transactions/summary/:vendorId", async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { vendorId: mongoose.Types.ObjectId(req.params.vendorId) } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    const result = { sale: 0, expense: 0 };
    summary.forEach((item) => { result[item._id] = item.total; });
    const finalSummary = Object.keys(result).map((key) => ({
      _id: key,
      total: result[key],
    }));
    res.status(200).json(finalSummary);
  } catch (error) {
    console.error("Error aggregating transactions:", error);
    res.status(500).json({ error: "Server error, try again." });
  }
});

// --- Rating Endpoints ---

// Get All Detailed Ratings
app.get("/api/ratings/all-details", async (req, res) => {
  try {
    const ratings = await Rating.find({})
      .populate("vendorId", "name businessName email")
      .populate("customerId", "name email phone");
    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching detailed ratings:", error);
    res.status(500).json({ error: "Failed to fetch detailed ratings." });
  }
});

// Delete a Rating by ID
app.delete("/api/ratings/:id", async (req, res) => {
  try {
    const ratingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(ratingId))
      return res.status(400).json({ error: "Invalid rating ID format." });
    const deletedRating = await Rating.findByIdAndDelete(ratingId);
    if (!deletedRating) return res.status(404).json({ error: "Rating not found." });
    res.status(200).json({ message: "Rating deleted successfully." });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ error: "Server error deleting rating." });
  }
});

// Get Average Rating by Vendor ID
app.get("/api/ratings/average/:vendorId", async (req, res) => {
  try {
    const ratings = await Rating.find({ vendorId: req.params.vendorId });
    if (ratings.length === 0) return res.json({ averageRating: 0 });
    const averageRating =
      ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
    res.json({ averageRating });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    res.status(500).json({ error: "Failed to fetch average rating." });
  }
});

// Get Ratings for a Single Vendor
app.get("/api/ratings/:vendorId", async (req, res) => {
  try {
    const ratings = await Rating.find({ vendorId: req.params.vendorId });
    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ error: "Failed to fetch ratings." });
  }
});

// Add a Rating (limit two reviews per vendor per customer)
app.post("/api/ratings", async (req, res) => {
  try {
    const { vendorId, customerId, rating, review } = req.body;
    if (!vendorId || !customerId || rating === undefined)
      return res.status(400).json({ error: "Missing rating fields." });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    const reviewCount = await Rating.countDocuments({ vendorId, customerId });
    if (reviewCount >= 2)
      return res.status(400).json({ error: "You can only write review for this vendor twice." });
    const newRating = new Rating({ vendorId, customerId, rating, review });
    await newRating.save();
    res.status(201).json({ message: "Rating submitted successfully!", newRating });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ error: "Failed to submit rating." });
  }
});

// --- Gemini API Endpoint ---
app.post("/api/gemini", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = req.body.prompt;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

// --- Chat Endpoints ---

// Get Chats based on sender and receiver IDs
app.get("/api/chats", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    const chats = await Chat.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats." });
  }
});

// Get All Detailed Chats (for admin dashboard)
app.get("/api/chats/all-details", async (req, res) => {
  try {
    const allChats = await Chat.find({}).lean();
    const detailedChats = await Promise.all(
      allChats.map(async (chat) => {
        let senderName = "Unknown";
        let receiverName = "Unknown";

        const senderVendor = await Vendor.findById(chat.senderId);
        if (senderVendor) {
          senderName = senderVendor.businessName || senderVendor.name;
        } else {
          const senderCustomer = await Customer.findById(chat.senderId);
          if (senderCustomer) senderName = senderCustomer.name;
        }

        const receiverVendor = await Vendor.findById(chat.receiverId);
        if (receiverVendor) {
          receiverName = receiverVendor.businessName || receiverVendor.name;
        } else {
          const receiverCustomer = await Customer.findById(chat.receiverId);
          if (receiverCustomer) receiverName = receiverCustomer.name;
        }

        return { ...chat, senderName, receiverName };
      })
    );
    res.status(200).json(detailedChats);
  } catch (error) {
    console.error("Error fetching detailed chats:", error);
    res.status(500).json({ error: "Failed to fetch detailed chats." });
  }
});

// Delete a Chat by ID
app.delete("/api/chats/:id", async (req, res) => {
  try {
    const chatId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res.status(400).json({ error: "Invalid chat ID format." });
    const deletedChat = await Chat.findByIdAndDelete(chatId);
    if (!deletedChat)
      return res.status(404).json({ error: "Chat not found." });
    res.status(200).json({ message: "Chat message deleted successfully." });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Server error deleting chat." });
  }
});

// Get Customers by Messages for a Vendor
app.get("/api/customers-by-messages/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const chatSenderIds = await Chat.find({ receiverId: vendorId }).distinct("senderId");
    const chatReceiverIds = await Chat.find({ senderId: vendorId }).distinct("receiverId");
    const allCustomerIds = Array.from(new Set([...chatSenderIds, ...chatReceiverIds]));
    const customers = await Customer.find({ _id: { $in: allCustomerIds } });
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers by messages:", err);
    res.status(500).json({ error: "Failed to fetch customers by messages." });
  }
});

// --- Admin Endpoints ---

// Admin Login
app.post("/api/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
      return res.status(200).json({ message: "Admin login successful." });
    else return res.status(401).json({ error: "Invalid admin credentials." });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Admin login failed." });
  }
});

// Admin Dashboard (fetch vendors, customers, products, transactions)
app.get("/api/admin-dashboard", async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    const customers = await Customer.find({});
    const products = await Product.find({});
    const transactions = await Transaction.find({});
    res.status(200).json({ vendors, customers, products, transactions });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch admin dashboard data." });
  }
});

/* ============================
   WebSocket Setup with Socket.IO
============================*/
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("registerUser", (userId) => {
    Object.keys(userSocketMap).forEach((key) => {
      if (key === userId) delete userSocketMap[key];
    });
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, message } = data;
      const newChat = new Chat({ senderId, receiverId, message });
      await newChat.save();
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newChat);
      } else {
        console.log(`User ${receiverId} is not connected.`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    Object.keys(userSocketMap).forEach((userId) => {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });
});

/* ============================
   Start the Server
============================*/
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});