const { openConnection } = require("../connection");

class MovieModel {
  static cache = null;
  static cacheTimestamp = null;
  static CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  constructor(row) {
    this.movieId = row.movie_id;
    this.title = row.title;
    this.director = row.director;
    this.description = row.description;
    this.releaseDate = row.release_date;
    this.endDate = row.end_date;
    this.duration = row.duration;
    this.language = row.language_name;
    this.rating = { code: row.rating_code, description: row.rating_description };
    this.genres = row.genres ? row.genres.split(',').map(s => s.trim()).filter(Boolean) : [];
    this.poster = null; // updated in loadAllFromDb from mediaGallery
    this.mediaGallery = [];
    this.status = MovieModel.computeStatus(row.release_date, row.end_date);
  }

  static computeStatus(releaseDate, endDate) {
    if (!releaseDate || !endDate) return 'Unknown';
    const today = new Date();
    const release = new Date(releaseDate);
    const end = new Date(endDate);
    const formatDateNum = (dt) => dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
    const todayNum = formatDateNum(today);
    const releaseNum = formatDateNum(release);
    const endNum = formatDateNum(end);
    if (todayNum < releaseNum) return 'Coming Soon';
    if (todayNum >= releaseNum && todayNum <= endNum) return 'Now Showing';
    return 'Ended';
  }

  static async fetchMediaForMovies(movieIds) {
    if (!movieIds || movieIds.length === 0) return {};
    const sql = `
      SELECT movie_id, media_type, path, is_primary
      FROM media
      WHERE movie_id = ANY($1)
      ORDER BY movie_id, is_primary DESC;
    `;
    const { rows } = await openConnection.query(sql, [movieIds]);
    const mediaByMovie = {};
    rows.forEach(row => {
      if (!mediaByMovie[row.movie_id]) mediaByMovie[row.movie_id] = [];
      mediaByMovie[row.movie_id].push({
        type: row.media_type,
        path: row.path,
        isPrimary: row.is_primary === 1,
      });
    });
    return mediaByMovie;
  }

  static async loadAllFromDb() {
    const now = Date.now();
    if (MovieModel.cache && (now - MovieModel.cacheTimestamp) < MovieModel.CACHE_EXPIRY_MS) {
      return MovieModel.cache;
    }
    const sql = `
      SELECT 
        m.movie_id, m.title, m.director, m.description, m.release_date, m.end_date, m.duration,
        l.name AS language_name,
        r.code AS rating_code, r.description AS rating_description,
        COALESCE(STRING_AGG(DISTINCT g.name, ','), '') AS genres
      FROM movie m
      LEFT JOIN language l ON m.language_id = l.language_id
      LEFT JOIN rating r ON m.rating_id = r.rating_id
      LEFT JOIN movieGenre mg ON m.movie_id = mg.movie_id
      LEFT JOIN genre g ON mg.genre_id = g.genre_id
      GROUP BY m.movie_id, l.name, r.code, r.description
      ORDER BY m.release_date DESC, m.title;
    `;
    const { rows } = await openConnection.query(sql);
    const movieIds = rows.map(r => r.movie_id);
    const mediaByMovie = await MovieModel.fetchMediaForMovies(movieIds);

    const movies = rows.map(row => {
      const movie = new MovieModel(row);
      movie.mediaGallery = mediaByMovie[row.movie_id] || [];
      const primaryMedia = movie.mediaGallery.find(m => m.isPrimary && m.type === 'poster');
      movie.poster = primaryMedia ? primaryMedia.path : null;
      return movie;
    });

    MovieModel.cache = movies;
    MovieModel.cacheTimestamp = now;
    return movies;
  }

  static async getAllMovies() {
    return await MovieModel.loadAllFromDb();
  }

  static async getMovieByTitle(title) {
    if (!title) return null;
    const movies = await MovieModel.getAllMovies();
    const normalizedTitle = title.trim().toLowerCase();
    return movies.find(m => m.title.trim().toLowerCase() === normalizedTitle) || null;
  }

  static async getMoviesByStatus(status) {
    if (!status) return [];
    const movies = await MovieModel.getAllMovies();
    return movies.filter(m => m.status === status);
  }

  static async getShowtimesByMovieAndDate(movieId, showDate) {
    const sql = `
      SELECT 
        s.showtime_id, s.show_date, s.show_time, s.price, s.seats_booked,
        c.cinema_id, c.name AS cinema_name, c.seating_capacity,
        l.name AS location_name, st.name AS screen_type
      FROM showtime s
      JOIN cinema c ON s.cinema_id = c.cinema_id
      JOIN location l ON c.location_id = l.location_id
      JOIN screenType st ON c.screen_type_id = st.screen_type_id
      WHERE s.movie_id = $1 AND s.show_date = $2 AND s.sched_status = 'scheduled'
      ORDER BY s.show_time;
    `;
    const { rows } = await openConnection.query(sql, [movieId, showDate]);
    return rows.map(row => ({
      showtimeId: row.showtime_id,
      showDate: row.show_date,
      showTime: row.show_time,
      price: row.price,
      seatsAvailable: row.seating_capacity - row.seats_booked,
      cinema: {
        id: row.cinema_id,
        name: row.cinema_name,
        location: row.location_name,
        screenType: row.screen_type,
      },
    }));
  }

  static invalidateCache() {
    MovieModel.cache = null;
    MovieModel.cacheTimestamp = null;
  }
}

module.exports = MovieModel;
