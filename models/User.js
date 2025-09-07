const { openConnection } = require('../connection');

class User {

    constructor(row) {
        this.userId = row.user_id;
        this.userName = row.user_name;
        this.email = row.email;
    }

    // Update the username for a user by user ID
    static async updateUserName(userId, newUserName) {
        const conn = await openConnection();
        try {
            await conn.query(
                "UPDATE User SET user_name = ? WHERE user_id = ?",
                [newUserName, userId]
            );
        } finally {
            conn.close();
        }
    }
}

module.exports = User;