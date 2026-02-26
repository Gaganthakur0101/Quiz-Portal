const router = require("express").Router();
const ctrl = require("../controllers/authCtrl");

// Auth routes
router.post("/signup", ctrl.signup);
router.get("/verify-email", ctrl.verifyEmail);
router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", ctrl.getMe);   // FIXED

module.exports = router;
