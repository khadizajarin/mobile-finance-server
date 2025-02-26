const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
      console.log("Checking admin:", req.body.adminEmail); // ✅ Debugging Log
  
      const adminUser = await User.findOne({ email: req.body.adminEmail });
  
      if (!adminUser) {
        console.log("Admin not found in database!"); // ✅ Debugging Log
        return res.status(403).json({ message: "Unauthorized: Only admin can approve agents" });
      }
  
      if (adminUser.accountType !== "admin") {
        console.log("User is not an admin!"); // ✅ Debugging Log
        return res.status(403).json({ message: "Unauthorized: Only admin can approve agents" });
      }
  
      console.log("Admin verified successfully!"); // ✅ Debugging Log
      next();
    } catch (error) {
      console.error("Error in isAdmin middleware:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  

// Get all unapproved agents
router.get("/pending-agents", async (req, res) => {
    try {
      const pendingAgents = await User.find({ accountType: "agent", isApproved: false });
      res.json(pendingAgents);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  

// Approve an agent
router.put("/approve-agent", isAdmin, async (req, res) => {
  try {
    const { agentEmail } = req.body;

    // Find agent by email
    const agent = await User.findOne({ email: agentEmail, accountType: "agent" });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Approve the agent
    agent.isApproved = true;
    await agent.save();

    res.json({ message: "Agent approved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
