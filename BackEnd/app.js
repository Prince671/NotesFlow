const express = require("express");
const cors = require("cors");
const connection = require("./config/db");
const notesRoute = require("./routes/notes.route");
const authRoute = require("./routes/user.routes"); // 👈 import auth routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoute);   // 👈 login & register endpoints
app.use("/notes", notesRoute); // 👈 notes endpoints

// Start server after DB connection
app.listen(3000, async () => {
  try {
    await connection; // ensure DB is connected
    console.log("✅ Connected to DB");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
  console.log("🚀 Server is running on http://localhost:3000");
});
