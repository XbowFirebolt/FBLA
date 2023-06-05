const bcrypt = require('bcryptjs');

const db = require('../data/database');

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    getUserWithSameUsername() {
        return db.query('SELECT * FROM fbla.users WHERE username = ?', [this.username]);
    }

    async signup() {
        const hashedPassword = await bcrypt.hash(this.password, 12);

        const data = [
            this.username,
            this.email,
            hashedPassword
        ];
        await db.query('INSERT INTO fbla.users (username, email, password) VALUES (?)', [data]);
    }

    hasMatchingPassword(hashedPassword) {
        return bcrypt.compare(this.password, hashedPassword);
    }
}

module.exports = User;