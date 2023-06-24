const db = require('../data/database');

async function createUserSession(req, user, action) {

    const userId = await db.query('SELECT (id) FROM fbla.users WHERE username = ?', [user.username]);
    req.session.uid = userId[0][0].id;

    const selectedSchool = await db.query('SELECT * FROM fbla.user_schools WHERE user_id = ?', userId[0][0].id);

    if (selectedSchool[0][0].schools_id === undefined) {
        req.session.selectedSchool = -1;
    } else {
        req.session.selectedSchool = selectedSchool[0][0].schools_id;
    }

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

    req.session.save(action);
}

function destroyUserAuthSession(req) {
    req.session.uid = null;
}

module.exports = {
    createUserSession: createUserSession,
    destroyUserAuthSession: destroyUserAuthSession
}