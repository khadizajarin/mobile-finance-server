const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import UUID for unique transactionId

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, default: uuidv4 }, // Auto-generate transactionId
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 1 }, // Ensure minimum amount
  fee: { type: Number, required: true, min: 0 }, // Ensure fee is non-negative
  transactionType: { 
    type: String, 
    enum: ["send", "receive", "cash-out","cash-in"], // Add "cash-out" to the enum
    required: true 
  }, // "send", "receive", or "cash-out"
  date: { type: Date, default: Date.now, index: true } // Indexing for faster queries
});

// Create model
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
