const db = require('../data/database');

const School = require('../models/school.model');
const sessionFlash = require('../util/session-flash');
const validation = require('../util/validation');

async function getSchool(req, res, next) {

    const id = req.session.selectedSchool;

    try {

        const school = await School.getSchools(id, next);

        if(school[0][0] === undefined) {
            const sessionData = {
                school: school[0][0],
                exists: false
            }
            res.render('user/main/schools/schools', { inputData: sessionData });
        } else {
            const sessionData = {
                school: school[0][0],
                exists: true
            }
            res.render('user/main/schools/schools', { inputData: sessionData });
        }
    } catch (error) {
        next(error);
    }
}

function getCreateSchool(req, res) {
    let sessionData = sessionFlash.getSessionData(req);

    if(!sessionData) {
        sessionData = {
            name: '',
            password: '',
            address: '',
            postal: '',
            city: '',
            state: '',
            country: ''
        };
    }

    res.render('user/main/schools/create-school', { inputData: sessionData });
}

async function createSchool(req, res, next) {

    const enteredData = {
        username: req.body.name,
        password: req.body.password,
        streetNumber: req.body.address,
        postal: req.body.postal,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country
    }

    if (!validation.schoolDetailsAreValid(
        req.body.name,
        req.body.password,
        req.body.address,
        req.body.postal,
        req.body.city,
        req.body.state,
        req.body.country)
    ) {
        sessionFlash.flashDataToSession(req, {
            errorMessage: 'Please check your input. Password must be at least 6 characters long, postal code must be 5 characters long',
            ...enteredData
        }, 
        function() {
            res.redirect('/create-school');
        })
        return;
    }

    const school = new School(
        req.body.name,
        req.body.password,
        req.body.address,
        req.body.postal,
        req.body.city,
        req.body.state,
        req.body.country
        );
    
    try {
        await school.create();
    } catch (error) {
        next(error);
        return;
    }

    res.redirect('/dashboard');
}

function getNewSchools(req, res) {

    req.session.newSchoolId = -1;

    let sessionData = sessionFlash.getSessionData(req);

    if(!sessionData) {
        sessionData = {
            searchbar: '',
        }
    }

    res.render('user/main/schools/new-schools', { inputData: sessionData });
}

async function getSchoolDetails(req, res, next) {

    const sessionErrorData = {
        errorMessage: 'Invalid ID - That School Does Not Exist!',
        searchbar: req.body.searchbar
    }

    const ErrorData = {
        errorMessage: 'Invalid Input!',
        searchbar: req.body.searchbar
    }

    const id = parseInt(req.body.searchbar);

    if(!(Number.isInteger(id))) {
        sessionFlash.flashDataToSession(req, ErrorData, function () {
            res.redirect('/new-schools');
        })
        return;
    }

    req.session.newSchoolId = id;

    try {
        const school = await School.getSchools(id, next);

        if(school[0][0] === undefined) {
            sessionFlash.flashDataToSession(req, sessionErrorData, function () {
                res.redirect('/new-schools');
            })
            return;
        }

        const sessionData = {
            searchbar: req.body.searchbar,
            school: school[0][0]
        }

        res.render('user/main/schools/preview-school', { inputData: sessionData });  
    } catch (error) {
        next(error);
    }
}

async function joinSchool(req, res, next) {

    const existingSchool = await School.getSchools(req.session.newSchoolId, next);

    const school = new School(
        existingSchool[0][0].name,
        existingSchool[0][0].password,
        existingSchool[0][0].address,
        existingSchool[0][0].postal,
        existingSchool[0][0].city,
        existingSchool[0][0].state,
        existingSchool[0][0].country
    );

    const sessionErrorData = {
        errorMessage: 'Invalid Password',
        searchbar: req.session.newSchoolId,
        school: existingSchool[0][0]
    }

    const passwordIsCorrect = await school.hasMatchingPassword(req.body.adminPassword);

    if(!passwordIsCorrect) {
        res.render('user/main/schools/preview-school', { inputData: sessionErrorData });
        return;
    }

    const uid = await req.session.uid;

    const searchErrorData = {
        errorMessage: 'You have already joined this school',
        searchbar: req.session.newSchoolId,
        school: existingSchool[0][0]
    }

    const searchQuery = 'SELECT * FROM fbla.user_schools WHERE (user_id, schools_id) = (?)';

    const query = 'INSERT INTO fbla.user_schools (user_id, schools_id) VALUES (?)';

    const data = [
        uid,
        req.session.newSchoolId
    ]

    const exists = await db.query(searchQuery, [data]);

    if(!(exists[0][0] === undefined)) {
        res.render('user/main/schools/preview-school', { inputData: searchErrorData });
        return;
    }

    db.query(query, [data]);

    req.session.selectedSchool = req.session.newSchoolId;

    res.redirect('/dashboard');
}

async function editSchool(req, res, next) {  

    try {
        const id = req.session.selectedSchool;

        const query = 'SELECT * FROM fbla.schools WHERE id = ?';

        const editSchool = await db.query(query, id);

        const sessionData = {
            school: editSchool[0][0]
        }

        res.render('user/main/schools/edit-school', { inputData: sessionData }); 
    } catch (error) {
        next(error);
    } 
}

async function changeSchool(req, res) {

    const query = 'UPDATE fbla.schools SET name = ?, address = ?, postal = ?, city = ?, state = ?, country = ? WHERE id = ?';

    data = [
        req.body.name,
        req.body.address,
        req.body.postal,
        req.body.city,
        req.body.state,
        req.body.country,
        req.session.selectedSchool
    ]

    await db.query(query, data);

    res.redirect('/schools');
}

module.exports = {
    getSchool: getSchool,
    getCreateSchool: getCreateSchool,
    createSchool: createSchool,
    getSchoolDetails : getSchoolDetails,
    getNewSchools: getNewSchools,
    joinSchool: joinSchool,
    editSchool: editSchool,
    changeSchool: changeSchool
};