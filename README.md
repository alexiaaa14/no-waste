# No Waste - Food Sharing App

A web application designed to reduce food waste by allowing users to track their fridge inventory, share available items with friends and groups, and claim products from others.

## ✨ Functionalities

### 🍽️ My Fridge
- **Track Inventory**: Add food items with expiration dates.
- **Smart Notifications**: Visual warnings for items expiring soon (yellow) or expired (red).
- **Share**: Easily mark items as "Available" for others to see.

### 🤝 Product Claims
- **Browse**: View products shared by other users.
- **Claim**: Request items you want.
- **Manage**: Accept or reject claims on your own products.
- **Status Tracking**: See if your claims are Pending, Accepted, or Rejected.

### 👥 Friend Groups
- **Create Groups**: Organize friends based on diet (e.g., "Vegan Friends") or location.
- **Invite Friends**: Add users to your groups.
- **Privacy**: Share items specifically with certain groups.

### 🤗 Friends
- **Connect**: Search for users and send friend requests.
- **Network**: Build your food-sharing network.
- **Profile**: See who you are connected with.

### 👤 User Features
- **Profile Management**: Food preferences (Vegan, Vegetarian, etc.).
- **Account Control**: Secure Login/Register and Account Deletion.

## 🚀 How to Run the App

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A terminal (Command Prompt, Terminal, or VS Code terminal).

### 1. Backend Setup (Server)
The backend manages the database and API.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *The server runs on `http://localhost:3001`.*

### 2. Frontend Setup (Client)
The frontend is the user interface you interact with.

1. Open a **new** terminal window (keep the backend running!) and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open your browser and go to the link shown (usually `http://localhost:5173`).

---
*Built with React, Node.js, Express, and SQLite.*
