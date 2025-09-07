const { openConnection } = require('../connection');

class Movie{

    constructor(row){
        this.movieId = row.movie_id;
        this.title = row.title;
        this.genre = row.genre;
        this.director = row.director;
        this.description = row.description;
        this.releaseDate = row.release_date;
        this.endDate = row.end_date;
        this.languageId = row.language_id;
        this.mediaId = row.media_id;
        this.status = Movie.computeStatus(row.release_date, row.end_date);
    }

    // Compute movie status based on current date and release/end dates
    static computeStatus(releaseDate, endDate){
        const today = new Date();
        const start = new Date(releaseDate);
        const end = new Date(endDate);

        if(today < start) return 'Comming Soon';
        if(today >= start && now <= end) return 'Now Showing';
        return 'Ended';
    }

    static async getAllMovies(){
        const conn = await openConnection();
        try{
            const rows = await conn.query("SELECT * FROM Movie");
            return rows.map(r => new Movie(r)); // Create Movie instances
        } finally { conn.close(); }
    }  
    
    // Find movie by ID (from cache)
    static async getMovieById(movieId) {
        const all = await Movie.getAllMovies();
        return all.find(m => m.movie_id === movieId) || null;
    }

    // Get movies by status (Coming Soon, Now Showing, Ended) for tab views
    static async getMoviesByStatus(status) {
        const all = await Movie.getAllMovies();
        return all.filter(m => m.status === status);
    }
}

module.exports = Movie;     