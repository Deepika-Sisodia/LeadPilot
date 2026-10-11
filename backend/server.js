
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Read sample leads from the JSON file
const dataPath = path.join(__dirname, "data", "leads.json");

function getLeads() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

// Validate basic email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Calculate a transparent lead-priority score out of 100

function calculateScore(lead) {
  let score = 0;
  const reasons = [];
  const scoreBreakdown = [];

  // Industry fit: maximum 30 points
  let industryPoints = 15;
  let industryReason = "Industry fit needs further evaluation";

  if (lead.industry === "Technology") {
    industryPoints = 30;
    industryReason = "Technology industry matches the target profile";
  } else if (lead.industry === "Consulting") {
    industryPoints = 25;
    industryReason = "Consulting industry has a good fit";
  }

  score += industryPoints;
  reasons.push(industryReason);
  scoreBreakdown.push({
    category: "Industry fit",
    points: industryPoints,
    maxPoints: 30,
    reason: industryReason
  });

  // Revenue: maximum 30 points
  let revenuePoints;
  let revenueReason;

  if (lead.revenue >= 5000000) {
    revenuePoints = 30;
    revenueReason = "Strong estimated revenue";
  } else if (lead.revenue >= 2000000) {
    revenuePoints = 22;
    revenueReason = "Good estimated revenue";
  } else if (lead.revenue >= 1000000) {
    revenuePoints = 15;
    revenueReason = "Moderate estimated revenue";
  } else {
    revenuePoints = 8;
    revenueReason = "Lower estimated revenue";
  }

  score += revenuePoints;
  reasons.push(revenueReason);
  scoreBreakdown.push({
    category: "Estimated revenue",
    points: revenuePoints,
    maxPoints: 30,
    reason: revenueReason
  });

  // Company size: maximum 20 points
  let employeePoints;
  let employeeReason;

  if (lead.employees >= 200) {
    employeePoints = 20;
    employeeReason = "Large company size";
  } else if (lead.employees >= 100) {
    employeePoints = 15;
    employeeReason = "Medium-to-large company size";
  } else if (lead.employees >= 50) {
    employeePoints = 10;
    employeeReason = "Medium company size";
  } else {
    employeePoints = 5;
    employeeReason = "Small company size";
  }

  score += employeePoints;
  reasons.push(employeeReason);
  scoreBreakdown.push({
    category: "Company size",
    points: employeePoints,
    maxPoints: 20,
    reason: employeeReason
  });

  // Data completeness: maximum 20 points
  const validEmail = isValidEmail(lead.email || "");
  const hasWebsite =
    typeof lead.website === "string" && lead.website.trim() !== "";

  const emailPoints = validEmail ? 10 : 0;
  const websitePoints = hasWebsite ? 10 : 0;

  score += emailPoints + websitePoints;

  if (!validEmail) {
    reasons.push("Valid email is missing or invalid");
  }

  if (!hasWebsite) {
    reasons.push("Website is missing");
  }

  scoreBreakdown.push({
    category: "Email",
    points: emailPoints,
    maxPoints: 10,
    reason: validEmail ? "Email has a valid format" : "Email is missing or invalid"
  });

  scoreBreakdown.push({
    category: "Website",
    points: websitePoints,
    maxPoints: 10,
    reason: hasWebsite ? "Website is provided" : "Website is missing"
  });

  return {
    ...lead,
    score,
    reasons,
    scoreBreakdown
  };
}


// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to LeadPilot API" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LeadPilot backend is running"
  });
});

// Get all leads
app.get("/api/leads", (req, res) => {
  try {
    res.json({
      success: true,
      count: getLeads().length,
      leads: getLeads()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load lead data"
    });
  }
});

// Get leads ranked by score, highest first
app.get("/api/leads/score", (req, res) => {
  try {
    const leads = getLeads()
      .map(calculateScore)
      .sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not calculate lead scores"
    });
  }
});

// Check lead data quality
app.get("/api/leads/quality", (req, res) => {
  try {
    const leads = getLeads();

    const companyCounts = {};
    leads.forEach((lead) => {
      const name = lead.companyName.trim().toLowerCase();
      companyCounts[name] = (companyCounts[name] || 0) + 1;
    });

    const checkedLeads = leads.map((lead) => {
      const issues = [];
      const normalizedName = lead.companyName.trim().toLowerCase();

      if (companyCounts[normalizedName] > 1) {
        issues.push("Duplicate company");
      }

      if (!lead.email || !lead.email.trim()) {
        issues.push("Missing email");
      } else if (!isValidEmail(lead.email)) {
        issues.push("Invalid email format");
      }

      if (!lead.website || !lead.website.trim()) {
        issues.push("Missing website");
      }

      return {
        ...lead,
        issues,
        isDuplicate: companyCounts[normalizedName] > 1,
        qualityStatus: issues.length === 0 ? "Clean" : "Needs Review"
      };
    });

    res.json({
      success: true,
      totalLeads: checkedLeads.length,
      duplicateRecords: checkedLeads.filter(
        (lead) => lead.isDuplicate
      ).length,
      leadsNeedingReview: checkedLeads.filter(
        (lead) => lead.issues.length > 0
      ).length,
      leads: checkedLeads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not check lead quality"
    });
  }
});

app.listen(PORT, () => {
  console.log(`LeadPilot server running at http://localhost:${PORT}`);
});
