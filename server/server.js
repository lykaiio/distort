require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { init } = require("./db/database");
const accountsRouter = require("./routes/accounts");

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
init();

// Route for accounts
app.use("/api/accounts", accountsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
