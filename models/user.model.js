const bcrypt = require('bcryptjs');

const db = require('../data/database');

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
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

    async getUsers(next) {
        const query = 'SELECT * FROM fbla.users WHERE username = ?';

        try {
            const [users] = await db.query(query, this.username);
            return [users];
        } catch(error) {
            next(error);
            return;
        }

    }

    async existsAlready(next) {
        const [existingUser] = await this.getUsers(next);

        if(existingUser[0] === undefined) {
            return false;
        }
        return true;
    }
}

module.exports = User;