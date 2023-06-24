const db = require('../data/database');

class Student {
    constructor(name, grade, points) {
        this.name = name;
        this.grade = grade;
        this.points = points;
    }

    async add(req) {

        const data = [
            this.name,
            this.grade,
            this.points
        ];

        const newStudent = await db.query('INSERT INTO fbla.students (name, grade, points) VALUES (?)', [data]);

        req.session.selectedStudent = newStudent[0].insertId;

        const query = 'INSERT INTO fbla.student_schools (student_id, school_id) VALUES (?)';

        const data2 = [
            req.session.selectedStudent,
            req.session.selectedSchool
        ]

        await db.query(query, [data2]);
    }
}

module.exports = Student;