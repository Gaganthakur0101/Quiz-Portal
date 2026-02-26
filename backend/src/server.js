require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 4000;

// --------- MONGO CONNECTION ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🟢 MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🟢 Server running on port ${PORT}`);
      console.log(`🟢 Frontend allowed: ${process.env.CLIENT_URL}`);
      console.log("✔ System Ready: DB + CORS + Sessions + Routes");
    });
  })
  .catch((err) => {
    console.error("🔴 MongoDB Connection Failed");
    console.error(err);
  });
