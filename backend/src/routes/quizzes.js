const router = require('express').Router();
const quizCtrl = require('../controllers/quizCtrl');
const ensureAuth = require('../middlewares/ensureAuth');
const ensureHost = require('../middlewares/ensureHost');
const importCtrl = require("../controllers/importCtrl");

// All routes below require login
router.use(ensureAuth);

// Host routes
router.post('/', ensureHost, quizCtrl.createQuiz);
router.get('/host', ensureHost, quizCtrl.listHostQuizzes);
router.get('/:id', ensureHost, quizCtrl.getQuiz);
router.post('/:id/start', ensureHost, quizCtrl.startQuiz);
router.post('/:id/finish', ensureHost, quizCtrl.finishQuiz);
router.delete('/:id', ensureHost, quizCtrl.deleteQuiz);
router.get('/:id/attempts', ensureHost, quizCtrl.getAttemptsForQuiz);
router.post("/:id/import", ensureHost, importCtrl.importQuestions);
router.post('/:id/schedule', ensureHost, quizCtrl.scheduleQuiz);
router.put('/:id/questions/:qIndex', ensureHost, quizCtrl.updateQuestion);
router.delete('/:id/questions/:qIndex', ensureHost, quizCtrl.deleteQuestion);

module.exports = router;
