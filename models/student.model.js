const db = require('../data/database');

class Student {
    constructor(name, grade, points, req) {
        this.name = name;
        this.grade = grade;
        this.points = points;
        this.school_id = req.session.selectedSchool;
    }

    async add() {

        const data = [
            this.name,
            this.grade,
            this.points,
            this.school_id
        ];

        await db.query('INSERT INTO fbla.students (name, grade, points, school_id) VALUES (?)', [data]);
    }
}

module.exports = Student;