const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pin: { type: String, required: true }, // Hashed
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  nid: { type: String, required: true, unique: true },
  accountType: { type: String, enum: ["user", "agent","admin"], required: true },
  balance: { type: Number, default: 40 }, // Users get 40 Taka, Agents get 100,000
  isApproved: { type: Boolean, default: false }, // Agents need admin approval
}, { timestamps: true });


const User = mongoose.model("User", userSchema);
module.exports = User;
