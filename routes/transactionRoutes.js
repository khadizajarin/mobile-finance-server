const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose"); // ✅ Added this line


// POST /api/transactions/send-money
router.post("/send-money", async (req, res) => {
  try {
    const { senderEmail, recipientMobile, amount } = req.body;
    const amt = Number(amount);

    // Check minimum amount
    if (amt < 50) {
      return res.status(400).json({ message: "Minimum send amount is 50 taka." });
    }

    // Determine fee: 5 taka fee if amount > 100 taka, else fee = 0
    const fee = amt > 100 ? 5 : 0;
    const totalDebit = amt + fee;

    // Find sender by email
    const sender = await User.findOne({ email: senderEmail });
    if (!sender) return res.status(404).json({ message: "Sender not found." });

    // Check sender's balance
    if (sender.balance < totalDebit) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Find recipient by mobile
    const recipient = await User.findOne({ mobile: recipientMobile });
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    // Deduct total (amount + fee) from sender's balance
    sender.balance -= totalDebit;
    await sender.save();

    // Credit recipient with the sent amount (without fee)
    recipient.balance += amt;
    await recipient.save();

    // Add fee to admin account if fee applies
    if (fee > 0) {
      const admin = await User.findOne({ accountType: "admin" });
      if (admin) {
        admin.balance += fee;
        await admin.save();
      }
    }

    // Create a transaction record
    const transaction = new Transaction({
      transactionId: uuidv4(),
      sender: sender._id,
      recipient: recipient._id,
      amount: amt,
      fee,
    });
    await transaction.save();

    res.json({ message: "Transaction successful.", transaction });
  } catch (error) {
    console.error("Send money error:", error);
    res.status(500).json({ message: "Server error.", error });
  }
});

//GET all transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('sender recipient');
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Define route to get user-specific transactions
router.get("/transactions/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: mongoose.Types.ObjectId(userId) },
        { recipient: mongoose.Types.ObjectId(userId) }
      ]
    }).populate('sender recipient');
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
module.exports = router;
