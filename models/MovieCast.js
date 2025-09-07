const { openConnection } = require("../connection");
class MovieCast {
    constructor(row) {
        this.castId = row.CAST_ID;
        this.movieId = row.MOVIE_ID;
        this.actorName = row.ACTOR_NAME;
        this.role = row.ROLE;
    }

    static async getCastsByMovieId(movieId) {
        const conn = await openConnection();
        try {
            const rows = await conn.query("SELECT * FROM MovieCast WHERE MOVIE_ID = ?", [movieId]);
            return rows.map(r => new MovieCast(r));
        } finally { conn.close(); }
    }
}

module.exports = MovieCast;