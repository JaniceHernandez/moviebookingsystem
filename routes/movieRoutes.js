const express = require('express');
const MovieController = require('../controllers/MovieController');

const router = express.Router();

router.get('/', MovieController.listAll);
router.get('/status/:status', MovieController.getByStatus);
router.get('/title/:title', MovieController.getByTitle);
router.get('/showtimes', MovieController.getShowtimes);
router.post('/invalidate-cache', MovieController.invalidateCache);

module.exports = router;
