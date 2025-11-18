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

  // Get additional media for a movie
  static async getMedia(req, res) {
    try {
      const { movieId } = req.query;
      if (!movieId) {
        return res.status(400).json({ error: 'Movie ID is required' });
      }
      const media = await MovieModel.getMediaByMovie(movieId);
      res.status(200).json(media);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get seating arrangement for a specific showtime
  static async getSeating(req, res) {
    try {
      const { showtimeId } = req.query;

      if (!showtimeId) {
        return res.status(400).json({ error: 'showtimeId is required' });
      }

      const seating = await MovieModel.getSeatingArrangement(showtimeId);
      res.status(200).json(seating);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message || 'Failed to get seating' });
    }
  }
}

module.exports = MovieController;