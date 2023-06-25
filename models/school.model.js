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

    async create() {
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

        await db.query('INSERT INTO fbla.schools (name, password, district_id, address, postal, city, state, country) VALUES (?)', [data]);
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