const { openConnection } = require("../connection");
class MovieModel{
  static cache = null; // Cache for movie data

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
    this.genres = row.genres ? row.genres.split(',') : []; // Genres as array
    this.poster = row.poster_path; // Primary poster path
    this.status = MovieModel.computeStatus(row.release_date, row.end_date);
  }

  // Compute movie status based on current date
  static computeStatus(releaseDate, endDate) {
    if (!releaseDate || !endDate) return 'Unknown';
    const today = new Date();
    const release = new Date(releaseDate);
    const end = new Date(endDate);
    const todayNum = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const startNum = release.getFullYear() * 10000 + (release.getMonth() + 1) * 100 + release.getDate();
    const endNum = end.getFullYear() * 10000 + (end.getMonth() + 1) * 100 + end.getDate();
    if (todayNum < startNum) return 'Coming Soon';
    if (todayNum >= startNum && todayNum <= endNum) return 'Now Showing';
    return 'Ended';
  }

  // Fetch all movies with related data (genres, language, rating, primary poster)
  static async getAllMovies() {
    if (!MovieModel.cache) {
      try {
        const query = `
          SELECT 
            m.movie_id, m.title, m.director, m.description, 
            m.release_date, m.end_date, m.duration,
            l.name AS language_name,
            r.code AS rating_code, r.description AS rating_description,
            STRING_AGG(g.name, ',') AS genres,
            (SELECT path FROM media md WHERE md.movie_id = m.movie_id AND md.is_primary = 1 LIMIT 1) AS poster_path
          FROM movie m
          LEFT JOIN language l ON m.language_id = l.language_id
          LEFT JOIN rating r ON m.rating_id = r.rating_id
          LEFT JOIN movieGenre mg ON m.movie_id = mg.movie_id
          LEFT JOIN genre g ON mg.genre_id = g.genre_id
          GROUP BY m.movie_id, l.name, r.code, r.description
          ORDER BY m.title;
        `;
        const { rows } = await openConnection.query(query);
        MovieModel.cache = rows.map(row => new MovieModel(row));
      } catch (error) {
        console.error('Error fetching movies:', error);
        throw new Error('Failed to fetch movies');
      }
    }
    return MovieModel.cache;
  }

  // Fetch movie by title
  static async getMovieByTitle(title) {
    const movies = await MovieModel.getAllMovies();
    return movies.find(m => m.title.toLowerCase() === title.toLowerCase()) || null;
  }

  // Fetch movies by status
  static async getMoviesByStatus(status) {
    const movies = await MovieModel.getAllMovies();
    return movies.filter(m => m.status === status);
  }

  // Fetch showtimes for a movie on a specific date
  static async getShowtimesByMovie(movieId, showDate) {
    try {
      const query = `
        SELECT 
          s.showtime_id, s.show_date, s.show_time, s.price, s.seats_booked,
          c.cinema_id, c.name AS cinema_name,
          l.name AS location_name, st.name AS screen_type,
          st.seat_capacity
        FROM showtime s
        JOIN cinema c ON s.cinema_id = c.cinema_id
        JOIN location l ON c.location_id = l.location_id
        JOIN screenType st ON c.screen_type_id = st.screen_type_id
        WHERE s.movie_id = $1 AND s.show_date = $2 AND s.sched_status = 'scheduled'
        ORDER BY s.show_time;
      `;
      const { rows } = await openConnection.query(query, [movieId, showDate]);
      return rows.map(row => ({
        showtimeId: row.showtime_id,
        showDate: row.show_date,
        showTime: row.show_time,
        price: row.price,
        seatsAvailable: row.seat_capacity - row.seats_booked,
        cinema: {
          id: row.cinema_id,
          name: row.cinema_name,
          location: row.location_name,
          screenType: row.screen_type,
        },
      }));
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      throw new Error('Failed to fetch showtimes');
    }
  }

  // Fetch additional media for a movie
  static async getMediaByMovie(movieId) {
    try {
      const query = `
        SELECT 
          media_id, path, media_type, is_primary
        FROM media
        WHERE movie_id = $1 AND is_primary = 0
        ORDER BY media_id;
      `;
      const { rows } = await openConnection.query(query, [movieId]);
      return rows.map(row => ({
        mediaId: row.media_id,
        path: row.path,
        mediaType: row.media_type,
        isPrimary: row.is_primary,
      }));
    } catch (error) {
      console.error('Error fetching media for movie:', error);
      throw new Error('Failed to fetch media for movie');
    }
  }

  // Invalidate cache (for admin updates)
  static invalidateCache() {
    MovieModel.cache = null;
  }
}

module.exports = MovieModel;