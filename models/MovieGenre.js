const { openConnection } = require("../connection");

class MovieGenre {
    constructor(row) {
        this.movieId = row.MOVIE_ID;
        this.genreId = row.GENRE_ID;
    }

    // Fetches all the genres linked to a particular movie ID
    static async getGenresByMovie(movieId) {
        const conn = await openConnection();
        try {
            const rows = await conn.query(
                `SELECT g.GENRE_ID, g.GENRE_NAME
                FROM MovieGenre mg
                JOIN Genre g ON mg.GENRE_ID = g.GENRE_ID
                WHERE mg.MOVIE_ID = ?`, 
                [movieId]
            );
            return rows;
        } finally {
            conn.close();
        }
    }
}

module.exports = MovieGenre;
