const db = require('../data/database');

class Event {
    constructor(name, sporting, date, reward, school_id) {
        this.name = name;
        this.sporting = sporting;
        this.date = date;
        this.reward = reward;
        this.school_id = school_id
    }

    async add() {

        const data = [
            this.name,
            this.sporting,
            this.date,
            this.reward,
            this.school_id
        ];

        await db.query('INSERT INTO fbla.events (name, sporting, date, reward, school_id) VALUES (?)', [data]);
    }
}

module.exports = Event;