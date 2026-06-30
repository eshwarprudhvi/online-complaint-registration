# Online Complaint Registration & Management System

An enterprise-grade, role-based platform designed for efficient public grievance registration, tracking, allocation, and analysis. Built with a modern, responsive React (Vite) frontend and a secure Node.js (Express & MongoDB) backend featuring live WebSocket updates.

---

## 📖 About the Project

This system streamlines the grievance resolution workflow for municipal and organizational administrations:
- **Citizens** can easily lodge complaints with specific categories (such as Infrastructure, Sanitation, Water, and Electricity) and monitor their live resolution timeline.
- **Officers** receive automatically or manually assigned complaints, manage their active workloads, submit timeline updates, and interact with citizens.
- **Administrators** control the entire platform, manage user roles/approvals, distribute workloads, inspect performance analytics, and export comprehensive system reports.

A live Socket.IO connection guarantees that any updates, assignments, or state transitions are instantly broadcasted across all active dashboards.

---

## 💻 How to Run This on Your Laptop

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or using an Atlas URI)

---

### Step 1: Set Up the Backend Server
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/complaint-system
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```

---

### Step 2: Set Up the Frontend Client
1. Open a new terminal window/tab and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

### Step 3: Access the Application
- Open your browser and navigate to: `http://localhost:5173`
