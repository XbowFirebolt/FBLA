const bcrypt = require('bcryptjs');

const db = require('../data/database');

class School {
    constructor(name, password, address, postal, city, state, country) {
        this.name = name;
        this.password = password;
        this.district = -1;
        this.totalAddress = {
            address: address,
            postal: postal, 
            city: city,
            state: state,
            country: country
        };
    }

    async create(req, res) {
        const hashedPassword = await bcrypt.hash(this.password, 12);

        const data = [
            this.name,
            hashedPassword,
            this.district,
            this.totalAddress.address,
            this.totalAddress.postal,
            this.totalAddress.city,
            this.totalAddress.state,
            this.totalAddress.country
        ];

        const result = await db.query('INSERT INTO fbla.schools (name, password, district_id, address, postal, city, state, country) VALUES (?)', [data]);
        
        const queryData = [
            req.session.uid,
            result[0].insertId
        ]

        await db.query('INSERT INTO fbla.user_schools (user_id, schools_id) VALUES (?)', [queryData]);

        req.session.selectedSchool = result[0].insertId;

        req.session.newSchoolId = -1;

        req.session.selectedStudent = -1;

        req.session.randomStudents = [];

        req.session.studentTableSearch = {
            header: 'students.id',
            descending: false
        };

        req.session.studentTableSearchbar = '';

        req.session.top5Students = [];

        req.session.selectedPrize = -1;

        req.session.prizeTableSearch = {
            header: 'prizes.id',
            descending: false
        }

        req.session.prizeSearchbar = '';

        req.session.selectedEvent = -1;

        req.session.eventTableSearch = {
            header: 'event.id',
            descending: false
        }

        req.session.eventSearchbar = '';
    }

    static async getSchools(id, next) {
    
        try {
            const school = await db.query('SELECT schools.*, (SELECT COUNT(*) FROM fbla.students WHERE school_id = schools.id) as student_count FROM fbla.schools schools WHERE schools.id = ?', id);
            return school;
        } catch(error) {
            next(error);
            return;
        }
    
    }
    
    static async schoolExists(id, next) {
        const [school] = await getSchools(id, next);
        if(school[0] === undefined) {
            return false;
        }
        return true;
    }

    async hasMatchingPassword(inputPassword) {
        return bcrypt.compare(inputPassword, this.password);
    }

}

module.exports = School;