const { openConnection } = require("../connection");

class MtrcbRating {
    constructor(row) {
        this.ratingId = row.RATING_ID;
        this.ratingName = row.RATING_NAME;
        this.description = row.DESCRIPTION;
    }

    // Fetch rating by ID
    static async getRatingById(ratingId) {
        const conn = await openConnection();
        try {
            const rows = await conn.query("SELECT * FROM MtrcbRatings WHERE RATING_ID = ?", [ratingId]);
            if (rows.length === 0) return null;
            return new MtrcbRating(rows[0]);
        } finally {
            conn.close();
        }
    }
}

module.exports = MtrcbRating;
