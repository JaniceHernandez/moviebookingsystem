const { openConnection } = require("../connection");

class MovieMedia {
    constructor(row) {
        this.mediaId = row.MEDIA_ID;
        this.movieId = row.MOVIE_ID;
        this.mediaType = row.MEDIATYPE;
        this.mediaPath = row.MEDIAPATH;
    }

    static async getMediaByMovie(movieId) {
    const conn = await openConnection();
    try {
      const rows = await conn.query("SELECT * FROM MovieMedia WHERE movie_id = ?", [movieId]);
      return rows.map(r => new MovieMedia(r));
    } finally { conn.close(); }
  }
}

module.exports = MovieMedia;