const express = require('express');
const auth = require('../middleware/auth');
const analytics = require('../controllers/analyticsController');

const router = express.Router();

router.use(auth);
router.get('/summary', analytics.summary);
router.get('/trends', analytics.trends);
router.get('/export', analytics.exportCsv);

module.exports = router;
