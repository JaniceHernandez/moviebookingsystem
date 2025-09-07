const { openConnection } = require("../connection");

class Movie{

    static cache = null; // Cache for all movies

    //Movie properties
    constructor(row) {
        this.movieId = row.MOVIE_ID;
        this.title = row.TITLE;
        this.genre = row.GENRE;
        this.director = row.DIRECTOR;
        this.description = row.DESCRIPTION;
        this.releaseDate = row.RELEASE_DATE;
        this.endDate = row.END_DATE;
        this.languageId = row.LANGUAGE_ID;
        this.mediaId = row.MEDIA_ID;
        this.ratingId = row.RATING_ID;
        this.status = Movie.computeStatus(row.RELEASE_DATE, row.END_DATE);
    }

    // Compute movie status based on current date and release/end dates
    static computeStatus(releaseDate, endDate) {
        if (!releaseDate || !endDate) return 'Unknown';
        const today = new Date();

        // Parse releaseDate and endDate (format YYYY-MM-DD)
        const [rYear, rMonth, rDay] = releaseDate.split('-').map(Number); //→ ['2025','09','07']
        const [eYear, eMonth, eDay] = endDate.split('-').map(Number); //converts each string to a number.

        // Convert today to YYYYMMDD number
        const todayNum = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const startNum = rYear * 10000 + rMonth * 100 + rDay;
        const endNum = eYear * 10000 + eMonth * 100 + eDay; //20250000 + 900 + 7 = 20250907

        // Compare numeric dates
        if (todayNum < startNum) return 'Coming Soon';
        if (todayNum >= startNum && todayNum <= endNum) return 'Now Showing';
        return 'Ended';
    }

    // Fetch all movies (from DB if cache is empty)
    static async getAllMovies() {
        if (!Movie.cache) {
        const conn = await openConnection();
        try {
            const rows = await conn.query("SELECT * FROM Movie");
            Movie.cache = rows.map(r => new Movie(r)); 
        } finally { 
            conn.close(); 
        }
      }
        return Movie.cache;
    } 
    
    // Find movie by title (from cache/storage)
    static async getMovieByTitle(movie) {
        const all = await Movie.getAllMovies();
        return all.find(m => m.title === movie) || null;
    }

    // Get movies by status (Coming Soon, Now Showing, Ended) for tab views
    static async getMoviesByStatus(status) {
        const all = await Movie.getAllMovies();
        return all.filter(m => m.status === status);
    }

    // Invalidate cache when admin changes data
    static invalidateCache() {
        Movie.cache = null;
  }
}

module.exports = Movie;     