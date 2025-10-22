const { openConnection } = require('../connection');

class MovieModel {
  static cache = null; // Cache for movie data
  static cacheTimestamp = null; // Timestamp for cache
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(row) {
    this.movieId = row.MOVIE_ID;
    this.title = row.TITLE;
    this.director = row.DIRECTOR;
    this.description = row.DESCRIPTION;
    this.releaseDate = row.RELEASE_DATE;
    this.endDate = row.END_DATE;
    this.duration = row.DURATION;
    this.language = row.LANGUAGE_NAME;
    this.rating = { code: row.RATING_CODE, description: row.RATING_DESCRIPTION };
    this.genres = row.GENRES ? row.GENRES.split(',').map(g => g.trim()) : []; // Trim genres
    this.poster = row.POSTER_PATH; // Primary poster path
    this.status = MovieModel.computeStatus(row.RELEASE_DATE, row.END_DATE);
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

  // Check if cache is valid
  static isCacheValid() {
    if (!MovieModel.cache || !MovieModel.cacheTimestamp) return false;
    const now = Date.now();
    return (now - MovieModel.cacheTimestamp) < MovieModel.CACHE_DURATION;
  }

  // Fetch all movies with related data (genres, language, rating, primary poster)
  static async getAllMovies() {
    if (MovieModel.isCacheValid()) {
      return MovieModel.cache;
    }

    let conn;
    try {
      conn = await openConnection();
      const query = `
        SELECT 
          m.movie_id AS MOVIE_ID, 
          m.title AS TITLE, 
          m.director AS DIRECTOR, 
          CAST(m.description AS VARCHAR(1000)) AS DESCRIPTION, 
          m.release_date AS RELEASE_DATE, 
          m.end_date AS END_DATE, 
          m.duration AS DURATION,
          l.name AS LANGUAGE_NAME,
          r.code AS RATING_CODE, 
          CAST(r.description AS VARCHAR(4000)) AS RATING_DESCRIPTION,
          (SELECT LISTAGG(g.name, ',') WITHIN GROUP (ORDER BY g.name)
           FROM movieGenre mg 
           JOIN genre g ON mg.genre_id = g.genre_id 
           WHERE mg.movie_id = m.movie_id) AS GENRES,
          (SELECT path FROM media md WHERE md.movie_id = m.movie_id AND md.is_primary = 1 FETCH FIRST 1 ROW ONLY) AS POSTER_PATH
        FROM movie m
        LEFT JOIN language l ON m.language_id = l.language_id
        LEFT JOIN rating r ON m.rating_id = r.rating_id
        ORDER BY m.title;
      `;
      const rows = await conn.query(query);
      MovieModel.cache = rows.map(row => new MovieModel(row));
      MovieModel.cacheTimestamp = Date.now();
      return MovieModel.cache;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw new Error('Failed to fetch movies');
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
    }
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
    let conn;
    try {
      conn = await openConnection();
      const query = `
        SELECT 
          s.showtime_id AS SHOWTIME_ID, 
          s.show_date AS SHOW_DATE, 
          s.show_time AS SHOW_TIME, 
          s.price AS PRICE, 
          s.seats_booked AS SEATS_BOOKED,
          c.cinema_id AS CINEMA_ID, 
          c.name AS CINEMA_NAME,
          l.name AS LOCATION_NAME, 
          st.name AS SCREEN_TYPE,
          st.seat_capacity AS SEAT_CAPACITY
        FROM showtime s
        JOIN cinema c ON s.cinema_id = c.cinema_id
        JOIN location l ON c.location_id = l.location_id
        JOIN screenType st ON c.screen_type_id = st.screen_type_id
        WHERE s.movie_id = ? AND s.show_date = ? AND s.sched_status = 'scheduled'
        ORDER BY s.show_time;
      `;
      const rows = await conn.query(query, [movieId, showDate]);
      return rows.map(row => ({
        showtimeId: row.SHOWTIME_ID,
        showDate: row.SHOW_DATE,
        showTime: row.SHOW_TIME,
        price: Number(row.PRICE).toFixed(2), // Ensure price is formatted
        seatsAvailable: row.SEAT_CAPACITY - row.SEATS_BOOKED,
        cinema: {
          id: row.CINEMA_ID,
          name: row.CINEMA_NAME,
          location: row.LOCATION_NAME,
          screenType: row.SCREEN_TYPE,
        },
      }));
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      throw new Error('Failed to fetch showtimes');
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
    }
  }

  // Fetch additional media for a movie
  static async getMediaByMovie(movieId) {
    let conn;
    try {
      conn = await openConnection();
      const query = `
        SELECT 
          media_id AS MEDIA_ID, 
          path AS PATH, 
          media_type AS MEDIA_TYPE, 
          is_primary AS IS_PRIMARY
        FROM media
        WHERE movie_id = ? AND is_primary = 0
        ORDER BY media_id;
      `;
      const rows = await conn.query(query, [movieId]);
      return rows.map(row => ({
        mediaId: row.MEDIA_ID,
        path: row.PATH,
        mediaType: row.MEDIA_TYPE,
        isPrimary: row.IS_PRIMARY,
      }));
    } catch (error) {
      console.error('Error fetching media for movie:', error);
      throw new Error('Failed to fetch media for movie');
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
    }
  }

  // Invalidate cache (for admin updates)
  static invalidateCache() {
    MovieModel.cache = null;
    MovieModel.cacheTimestamp = null;
  }
}

module.exports = MovieModel;