const Settings = require("../models/Settings");

// GET SETTINGS
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({}); // default settings auto create
    }

    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load settings" });
  }
};

// UPDATE SETTINGS
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json({ message: "Settings updated", settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};
