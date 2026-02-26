const router = require('express').Router();
const ensureAuth = require('../middlewares/ensureAuth');
const participantCtrl = require('../controllers/participantCtrl');

router.use(ensureAuth);

router.post('/join', participantCtrl.joinByCode); // body: { joinCode }
router.get('/attempt/:attemptId', participantCtrl.getAttempt); // get attempt with quiz details
router.post('/attempt/:attemptId/submit', participantCtrl.submitAttempt); // body: { answers: [] }
router.get('/me/attempts', participantCtrl.myAttempts);
router.get('/dashboard', participantCtrl.dashboardData);
router.put('/profile', participantCtrl.updateProfile); // update user profile

module.exports = router;
