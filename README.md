# 🛍️ Vendor Connect

Vendor Connect is a robust MERN (MongoDB, Express, React, Node.js) stack web application designed to seamlessly connect vendors and customers through a dynamic and interactive interface.

## 🚀 Features

## 🔸 Vendor Interface
- Product Management: Add, delete products with name, price, and image.
- Sales & Expense Tracker:
  - Record sales and expense items.
  - Visualize data with bar charts.
  - Filter income data daily, monthly, or yearly.
- Gemini Chatbot:
  - AI-powered support using your own database.
  - Provides vendor tips and answers questions.
- Customer Chat: Real-time messaging with customers.

## 🔸 Customer Interface
- Nearby Vendor Map:
  - View vendors on a map using Leaflet API.
  - Nearby vendors listed first.
- Vendor Discovery:
  - Browse vendor profiles.
  - View real-time vendor locations.
- Vendor Chat: Message vendors directly.
- Ratings & Reviews:
  - Leave feedback for vendors.
  - View reviews from other customers.

## 📦 Database Collections

- vendors – Vendor profiles and data
- customers – Customer profiles and info
- products – Product listings (linked to vendors)
- ratings – Customer reviews and ratings for vendors
- transactions – Sales and expenses (for vendors)
- chats – Real-time messages between vendors and customers

## 🧱 Tech Stack

Frontend: React JS, CSS Modules  
Backend: Node.js, Express  
Database: MongoDB with Mongoose  
Others: Leaflet API for maps, Gemini Chatbot AI integration

## 🔐 Authentication

Secure registration and login for both vendors and customers.

## 📂 Project Structure (Brief)

vendor-connect/
├── public/
├── src/
│   ├── pages/                # All page components (VendorForm, CustomerForm, Chat, etc.)
│   ├── App.js
│   ├── index.js
│   └── ...
├── server.js                 # Backend entry point
├── .env
├── .gitignore
├── package.json
└── README.md

## 📌 How to Run the Project Locally

1. Clone the Repository

git clone https://github.com/SYEDSuleman4444/VendorConnect.git  
cd VendorConnect

2. Install Dependencies

npm install         # for frontend and server (if in one project)

If client and server are in different folders:

cd client  
npm install  

cd ../server  
npm install

3. Start the Application

npm start           # or run client and server separately

## 📫 Contact

Created by Syed Suleman – feel free to connect or raise an issue.
