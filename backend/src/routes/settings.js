const router = require("express").Router();
const settingsCtrl = require("../controllers/settingsCtrl");
const ensureAuth = require("../middlewares/ensureAuth");
const ensureHost = require("../middlewares/ensureHost");

router.use(ensureAuth, ensureHost);

router.get("/", settingsCtrl.getSettings);
router.put("/", settingsCtrl.updateSettings);

module.exports = router;
