const { openConnection } = require('../connection');

class MovieModel {
  static cache = null; // Cache for movie data

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
    this.genres = row.GENRES ? row.GENRES.split(',') : []; // Genres as array
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

  // Fetch all movies with related data (genres, language, rating, primary poster)
  static async getAllMovies() {
    if (!MovieModel.cache) {
      let conn;
      try {
        conn = await openConnection();
        const query = `
          SELECT 
            m."MOVIE_ID" AS MOVIE_ID, 
            m."TITLE" AS TITLE, 
            m."DIRECTOR" AS DIRECTOR, 
            m."DESCRIPTION" AS DESCRIPTION, 
            m."RELEASE_DATE" AS RELEASE_DATE, 
            m."END_DATE" AS END_DATE, 
            m."DURATION" AS DURATION,
            l."NAME" AS LANGUAGE_NAME,
            r."CODE" AS RATING_CODE, 
            r."DESCRIPTION" AS RATING_DESCRIPTION,
            LISTAGG(g."NAME", ',') WITHIN GROUP (ORDER BY g."NAME") AS GENRES,
            (SELECT "PATH" FROM "MEDIA" md WHERE md."MOVIE_ID" = m."MOVIE_ID" AND md."IS_PRIMARY" = 1 FETCH FIRST 1 ROW ONLY) AS POSTER_PATH
          FROM "MOVIE" m
          LEFT JOIN "LANGUAGE" l ON m."LANGUAGE_ID" = l."LANGUAGE_ID"
          LEFT JOIN "RATING" r ON m."RATING_ID" = r."RATING_ID"
          LEFT JOIN "MOVIEGENRE" mg ON m."MOVIE_ID" = mg."MOVIE_ID"
          LEFT JOIN "GENRE" g ON mg."GENRE_ID" = g."GENRE_ID"
          GROUP BY m."MOVIE_ID", m."TITLE", m."DIRECTOR", m."DESCRIPTION", m."RELEASE_DATE", m."END_DATE", m."DURATION", l."NAME", r."CODE", r."DESCRIPTION"
          ORDER BY m."TITLE";
        `;
        const rows = await conn.query(query);
        MovieModel.cache = rows.map(row => new MovieModel(row));
      } catch (error) {
        console.error('Error fetching movies:', error);
        throw new Error('Failed to fetch movies');
      } finally {
        if (conn) await conn.close();
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
    let conn;
    try {
      conn = await openConnection();
      const query = `
        SELECT 
          s."SHOWTIME_ID" AS SHOWTIME_ID, 
          s."SHOW_DATE" AS SHOW_DATE, 
          s."SHOW_TIME" AS SHOW_TIME, 
          s."PRICE" AS PRICE, 
          s."SEATS_BOOKED" AS SEATS_BOOKED,
          c."CINEMA_ID" AS CINEMA_ID, 
          c."NAME" AS CINEMA_NAME,
          l."NAME" AS LOCATION_NAME, 
          st."NAME" AS SCREEN_TYPE,
          st."SEAT_CAPACITY" AS SEAT_CAPACITY
        FROM "SHOWTIME" s
        JOIN "CINEMA" c ON s."CINEMA_ID" = c."CINEMA_ID"
        JOIN "LOCATION" l ON c."LOCATION_ID" = l."LOCATION_ID"
        JOIN "SCREENTYPE" st ON c."SCREEN_TYPE_ID" = st."SCREEN_TYPE_ID"
        WHERE s."MOVIE_ID" = ? AND s."SHOW_DATE" = ? AND s."SCHED_STATUS" = 'scheduled'
        ORDER BY s."SHOW_TIME";
      `;
      const rows = await conn.query(query, [movieId, showDate]);
      return rows.map(row => ({
        showtimeId: row.SHOWTIME_ID,
        showDate: row.SHOW_DATE,
        showTime: row.SHOW_TIME,
        price: row.PRICE,
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
      if (conn) await conn.close();
    }
  }

  // Fetch additional media for a movie
  static async getMediaByMovie(movieId) {
    let conn;
    try {
      conn = await openConnection();
      const query = `
        SELECT 
          "MEDIA_ID" AS MEDIA_ID, 
          "PATH" AS PATH, 
          "MEDIA_TYPE" AS MEDIA_TYPE, 
          "IS_PRIMARY" AS IS_PRIMARY
        FROM "MEDIA"
        WHERE "MOVIE_ID" = ? AND "IS_PRIMARY" = 0
        ORDER BY "MEDIA_ID";
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
      if (conn) await conn.close();
    }
  }

  // Invalidate cache (for admin updates)
  static invalidateCache() {
    MovieModel.cache = null;
  }
}

module.exports = MovieModel;