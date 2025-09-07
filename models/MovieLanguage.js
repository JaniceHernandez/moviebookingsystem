const { openConnection } = require("../connection");

class MovieLanguage {
  constructor(row) {
    this.languageId = row.LANGUAGE_ID;
    this.languageName = row.LANGUAGE_NAME;
  }

  static async getLanguageById(languageId) {
    const conn = await openConnection();
    try {
      const rows = await conn.query("SELECT * FROM MovieLanguage WHERE language_id = ?", [languageId]);
      return rows.length ? new MovieLanguage(rows[0]) : null;
    } finally { conn.close(); }
  }
}

module.exports = MovieLanguage;