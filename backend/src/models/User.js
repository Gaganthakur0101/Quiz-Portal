const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["host", "participant"], required: true },

    verified: { type: Boolean, default: false },

    verificationToken: { type: String, default: null },

    // Profile fields (optional)
    rollNo: { type: String, default: "" },
    organization: { type: String, default: "" },
    program: { type: String, default: "" },
    semester: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
