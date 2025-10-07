const MovieModel = require('../models/MovieModel');

const MovieController = {
  async listAll(req, res, next) {
  try {
    const forceReload = req.query.reload === 'true';
    if (forceReload) MovieModel.invalidateCache();
    const movies = await MovieModel.getAllMovies();
    return res.json({ ok: true, count: movies.length, data: movies });
  } catch (err) {
    console.error('Error in listAll:', err);  // log full error details
    return res.status(500).json({ ok: false, message: 'Internal Server Error', error: err.message });
  }
},

  async getByTitle(req, res, next) {
    try {
      const { title } = req.params;
      const movie = await MovieModel.getMovieByTitle(title);
      if (!movie) return res.status(404).json({ ok: false, message: "Movie not found" });
      return res.json({ ok: true, data: movie });
    } catch (err) {
      next(err);
    }
  },

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const movies = await MovieModel.getMoviesByStatus(status);
      return res.json({ ok: true, count: movies.length, data: movies });
    } catch (err) {
      next(err);
    }
  },

  async getShowtimes(req, res, next) {
    try {
      const { movieId, date } = req.query;
      if (!movieId || !date) return res.status(400).json({ ok: false, message: "movieId and date are required" });
      const showtimes = await MovieModel.getShowtimesByMovieAndDate(movieId, date);
      return res.json({ ok: true, count: showtimes.length, data: showtimes });
    } catch (err) {
      next(err);
    }
  },

  async invalidateCache(req, res, next) {
    try {
      MovieModel.invalidateCache();
      return res.json({ ok: true, message: "Cache invalidated" });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = MovieController;