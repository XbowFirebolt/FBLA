const db = require('../data/database');

const sessionFlash = require('../util/session-flash');
const validation = require('../util/validation');

async function getDashboard(req, res) {

    const uid = await req.session.uid;
    const query = "SELECT * FROM fbla.user_schools INNER JOIN schools ON fbla.user_schools.schools_id = schools.id WHERE user_id = ?";

    const schoolList = await db.query(query, uid);

    schools = schoolList[0];

    if(!(req.params.id === undefined)) {

        var joined = false;

        for (const school of schools) {

            const schoolId = school.schools_id;


            if (req.params.id == schoolId) {
                joined = true;
            }
        }

        if(joined === false) {
            res.redirect("/dashboard");
            return;
        } else {
            req.session.selectedSchool = req.params.id;
            
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
            res.redirect("/dashboard");
            return;
        }   
    }

    const student = await db.query('SELECT * FROM fbla.students WHERE school_id = ? ORDER BY points DESC LIMIT 1', req.session.selectedSchool);
    const highEvent = await db.query('SELECT * FROM fbla.events WHERE school_id = ? ORDER BY reward DESC LIMIT 1', req.session.selectedSchool);
    const lowEvent = await db.query('SELECT * FROM fbla.events WHERE school_id = ? ORDER BY reward ASC LIMIT 1', req.session.selectedSchool);
    const highPrize = await db.query('SELECT * FROM fbla.prizes WHERE school_id = ? ORDER BY points_required DESC LIMIT 1', req.session.selectedSchool);
    const lowPrize = await db.query('SELECT * FROM fbla.prizes WHERE school_id = ? ORDER BY points_required ASC LIMIT 1', req.session.selectedSchool);

    if(student[0][0] === undefined || 
        highEvent[0][0] === undefined || 
        lowEvent[0][0] === undefined ||
        highPrize[0][0] === undefined || 
        lowPrize[0][0] === undefined
        ) {

        const schoolData = {
            schools: schools,
            student: '',
            highEvent: '',
            lowEvent: '',
            highPrize: '',
            lowPrize: '',
            exists: false
        }
        res.render('user/main/dashboard/dashboard', { inputData: schoolData });
        return;
    }

    const schoolData = {
        schools: schools,
        student: student[0][0].name,
        highEvent: highEvent[0][0].name,
        lowEvent: lowEvent[0][0].name,
        highPrize: highPrize[0][0].name,
        lowPrize: lowPrize[0][0].name,
        exists: true
    }

    res.render('user/main/dashboard/dashboard', { inputData: schoolData });
}

module.exports = {
    getDashboard: getDashboard,
}