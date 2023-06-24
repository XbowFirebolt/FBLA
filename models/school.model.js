const bcrypt = require('bcryptjs');

const db = require('../data/database');

class School {
    constructor(name, password, address, postal, city, state, country) {
        this.name = name;
        this.students = 0;
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

    async create() {
        const hashedPassword = await bcrypt.hash(this.password, 12);

        const data = [
            this.name,
            this.students,
            hashedPassword,
            this.district,
            this.totalAddress.address,
            this.totalAddress.postal,
            this.totalAddress.city,
            this.totalAddress.state,
            this.totalAddress.country
        ];

        await db.query('INSERT INTO fbla.schools (name, students, password, district_id, address, postal, city, state, country) VALUES (?)', [data]);
    }

    static async getSchools(id, next) {
        const query = 'SELECT * FROM fbla.schools WHERE id = ?';
    
        try {

            const students = await db.query('SELECT * FROM fbla.student_schools WHERE school_id = ?', id);

            const studentNumber = students[0].length;

            const data = [
                studentNumber,
                id
            ]

            await db.query('UPDATE fbla.schools SET students = ? WHERE id = ?', data);

            const [school] = await db.query(query, id);
            return [school];
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