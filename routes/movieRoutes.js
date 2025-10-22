const express = require('express');
const MovieController = require('../controllers/movie');

const router = express.Router();

router.get('/movies', MovieController.getMovies);
router.get('/movies/:title', MovieController.getMovieByTitle);
router.get('/showtimes', MovieController.getShowtimes);

module.exports = router;