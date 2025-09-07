const { openConnection } = require("../connection");

class Movie{

    static cache = null; // Cache for all movies

    //Movie properties
    constructor(row){
        this.movieId = row.MOVIE_ID;
        this.title = row.TITLE;
        this.genre = row.GENRE;
        this.director = row.DIRECTOR;
        this.description = row.DESCRIPTION;
        this.releaseDate = row.RELEASE_DATE;
        this.endDate = row.END_DATE;
        this.languageId = row.LANGUAGE_ID;
        this.mediaId = row.MEDIA_ID;
        this.status = Movie.computeStatus(row.release_date, row.end_date);
    }

    // Compute movie status based on current date and release/end dates
    static computeStatus(releaseDate, endDate){
        const today = new Date();
        const start = new Date(releaseDate);
        const end = new Date(endDate);

        if(today < start) return 'Coming Soon';
        if(today >= start && today <= end) return 'Now Showing';
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
    
    // Find movie by ID (from cache)
    static async getMovieById(movie_Id) {
        const all = await Movie.getAllMovies();
        return all.find(m => m.movieId === movie_Id) || null;
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