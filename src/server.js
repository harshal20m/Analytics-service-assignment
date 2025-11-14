const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const ingestionRoutes = require("./routes/ingestion");
const reportingRoutes = require("./routes/reporting");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", ingestionRoutes);
app.use("/api", reportingRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Ingestion API: POST http://localhost:${PORT}/api/event`);
    console.log(`Reporting API: GET http://localhost:${PORT}/api/stats`);
});

module.exports = app;
