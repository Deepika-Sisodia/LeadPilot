
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to LeadPilot API"
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LeadPilot backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`LeadPilot server running at http://localhost:${PORT}`);
});
