const express = require('express');
const MovieController = require('../controllers/MovieController');

const router = express.Router();

router.get('/movies', MovieController.getMovies);
router.get('/movies/:title', MovieController.getMovieByTitle);
router.get('/showtimes', MovieController.getShowtimes);
router.get('/media', MovieController.getMedia);
router.get('/seating', MovieController.getSeating);

module.exports = router;