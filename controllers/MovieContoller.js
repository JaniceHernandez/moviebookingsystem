const MovieModel = require('../models/MovieModel');

class MovieController {
  // Get all movies or filter by status
  static async getMovies(req, res) {
    try {
      const { status } = req.query;
      let movies;
      if (status) {
        movies = await MovieModel.getMoviesByStatus(status);
      } else {
        movies = await MovieModel.getAllMovies();
      }
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get movie by title
  static async getMovieByTitle(req, res) {
    try {
      const { title } = req.params;
      const movie = await MovieModel.getMovieByTitle(title);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.status(200).json(movie);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get showtimes for a movie on a specific date
  static async getShowtimes(req, res) {
    try {
      const { movieId, date } = req.query;
      if (!movieId || !date) {
        return res.status(400).json({ error: 'Movie ID and date are required' });
      }
      const showtimes = await MovieModel.getShowtimesByMovie(movieId, date);
      res.status(200).json(showtimes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MovieController;