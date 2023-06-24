const db = require('../data/database');

class Prize {
    constructor(name, type_id, points_required, school_id) {
        this.name = name;
        this.type_id = type_id;
        this.points_required = points_required;
        this.school_id = school_id
    }

    async add() {

        const data = [
            this.name,
            this.type_id,
            this.points_required,
            this.school_id
        ];

        await db.query('INSERT INTO fbla.prizes (name, type_id, points_required, school_id) VALUES (?)', [data]);
    }
}

module.exports = Prize;