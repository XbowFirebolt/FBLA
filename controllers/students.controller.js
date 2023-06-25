const db = require('../data/database');

const Student = require('../models/student.model');
const sessionFlash = require('../util/session-flash');
const validation = require('../util/validation');

async function getStudents(req, res, next) {

    try {
        const query = 'SELECT * FROM fbla.students WHERE school_id = ?';

        const students = await db.query(query, req.session.selectedSchool);

        if (students[0][0] === undefined) {
            const sessionData = {
                exists: false,
                top5: [],
                random5: [],
                allStudents: []
            }
            res.render('user/main/students/students', { inputData: sessionData });
        } else {

            const allStudentsDB = await db.query(query, req.session.selectedSchool);

            const allStudents = allStudentsDB[0];

            const top5Query = 'SELECT * FROM fbla.students WHERE school_id = ? ORDER BY points DESC LIMIT 5';

            const studentList = await db.query(top5Query, req.session.selectedSchool);

            const top5 = studentList[0];

            req.session.top5Students = top5;

            const sessionData = {
                TOP5: top5,
                random5: req.session.randomStudents,
                exists: true,
                allStudents: allStudents
            }
            res.render('user/main/students/students', { inputData: sessionData });
        }
    } catch (error) {
        next(error);
    }
}

async function randomizeStudents(req, res, next) {

    const ErrorData = {
        errorMessage: 'Invalid Input!',
        searchbar: req.body.searchbar   
    }

    var gradeRequirement;

    if(req.body.searchbar != '') {
        gradeRequirement = parseInt(req.body.searchbar.trim());
        if(!(Number.isInteger(gradeRequirement))) {
            sessionFlash.flashDataToSession(req, ErrorData, function () {
                res.redirect('/students');
            })
            return;
        } 
    } else {
        gradeRequirement = '';
    }

    try {

        var query = '';
        var students = [];
        var top5Id = [];
        const top5 = req.session.top5Students;

        for(o of top5) {
            top5Id.push(o.id);
        }

        const queryData = [
            req.session.selectedSchool,
            gradeRequirement,
            top5Id
        ]

        const queryData2 = [
            req.session.selectedSchool,
            top5Id
        ]

        if(!(gradeRequirement === '')) {
            query = 'SELECT * FROM fbla.students WHERE school_id = ? AND grade = ? AND id NOT IN (?) ORDER BY RAND() LIMIT 5';
            students = await db.query(query, queryData);
        } else {
            query = 'SELECT * FROM fbla.students WHERE school_id = ? AND id NOT IN (?) ORDER BY RAND() LIMIT 5';
            students = await db.query(query, queryData2);
        }
        
        if (students[0][0] === undefined) {
            //Maybe say something telling them there are no students in that grade?
            res.redirect('/students');
        } else {
            
            req.session.randomStudents = students[0];

            res.redirect('/students');
        }
    } catch (error) {
        next(error);
        return;
    }
}

function getAddStudents(req, res) {

    let sessionData = sessionFlash.getSessionData(req);

    if(!sessionData) {
        sessionData = {
            name: '',
            grade: '',
            points: 0
        };
    }

    res.render('user/main/students/addStudent', { inputData: sessionData });

}

async function addStudent(req, res, next) {

        const enteredData = {
            name: req.body.name,
            grade: req.body.grade,
            points: req.body.points
        }

        if(!validation.studentDetailsAreValid(enteredData.name, enteredData.grade, enteredData.points)) {
            sessionFlash.flashDataToSession(req, { errorMessage: 'Please check your input', ...enteredData }, 
            function() {
                res.redirect('/add-students');
            })
            return;
        }
        
        const newStudent = new Student(
            req.body.name, req.body.grade, req.body.points, req
            );
    
        try {
            await newStudent.add(req);
        } catch (error) {
            next(error);
            return;
        }
    
        res.redirect('/students');
}

async function tableSearch(req, res, next) {

    try {
        const query = 'SELECT * FROM fbla.students WHERE students.school_id = ?';

        const students = await db.query(query, req.session.selectedSchool);
        
        if (students[0][0] === undefined) {
            const sessionData = {
                exists: false,
                top5: [],
                random5: [],
                allStudents: []
            }
            res.render('user/main/students/students', { inputData: sessionData });
        } else {

            if(req.body.searchbar === undefined) {
                req.body.searchbar = req.session.studentTableSearchbar;
            }

            req.session.studentTableSearchbar = req.body.searchbar;

            var searchQuery = 'SELECT * FROM fbla.students WHERE students.school_id = ? AND students.name LIKE ? ORDER BY ';

            const search = '%' + req.body.searchbar + '%';

            const header = req.session.studentTableSearch.header;
 
            if(header === 'students.name') {
                searchQuery += 'students.name'
            } else if(header === 'students.grade') {
                searchQuery += 'students.grade'
            } else if(header === 'students.points') {
                searchQuery += 'students.points'
            } else {
                searchQuery += 'id'
            }
            if(req.session.studentTableSearch.descending) {
                searchQuery += ' DESC';
            } else {
                searchQuery += ' ASC';
            }

            const data = [
                req.session.selectedSchool,
                search,
            ]

            const allStudentsDB = await db.query(searchQuery, data);

            const allStudents = allStudentsDB[0];
            var studentList = students[0];
            var top5 = [];

            studentList.sort((a, b) => parseInt(b.points) - parseInt(a.points));

            for (let i = 0; i < 5; i++) {
                if(studentList[0] === undefined) {
                    break;
                } else {
                    top5.push(studentList[0]);
                    studentList.shift();
                }
            }

            const sessionData = {
                TOP5: top5,
                random5: req.session.randomStudents,
                exists: true,
                allStudents: allStudents
            }
            res.render('user/main/students/students', { inputData: sessionData });
        }
    } catch (error) {
        next(error);
    }
}

function tableSort(req, res, next) {

    if (req.params.header === req.session.studentTableSearch.header) {
        if(req.session.studentTableSearch.descending) {
            req.session.studentTableSearch.descending = false;
        } else {
            req.session.studentTableSearch.descending = true;
        }
    } else {
        req.session.studentTableSearch.header = req.params.header;
        req.session.studentTableSearch.descending = false;
    }

    tableSearch(req, res, next);
}

async function getEditStudent(req, res) {

    try {
        const id = req.params.id;

        const query = 'SELECT * FROM fbla.students WHERE students.id = ?';

        const editStudent = await db.query(query, id);

        let sessionData = sessionFlash.getSessionData(req);

        if(!sessionData) {
            sessionData = {
                id: editStudent[0][0].id,
                name: editStudent[0][0].name,
                grade: editStudent[0][0].grade,
                points: editStudent[0][0].points
            };
        }

        req.session.selectedStudent = id;

        res.render('user/main/students/editStudent', { inputData: sessionData });

    } catch (error) {
        next(error);
    }
}

async function editStudent(req, res) {

    const query = 'UPDATE fbla.students SET name = ?, grade = ?, points = ? WHERE id = ?';

    const enteredData = {
        name: req.body.name,
        grade: req.body.grade,
        points: req.body.points
    }

    if(!validation.studentDetailsAreValid(enteredData.name, enteredData.grade, enteredData.points)) {
        sessionFlash.flashDataToSession(req, { errorMessage: 'Please check your input', ...enteredData }, 
        function() {
            res.redirect('/editStudent/' + req.session.selectedStudent.toString());
        })
        return;
    }

    data = [
        req.body.name,
        req.body.grade,
        req.body.points,
        req.session.selectedStudent
    ]

    await db.query(query, data);

    req.session.selectedStudent = -1;

    res.redirect('/students');
}

async function deleteStudent(req, res) {
    const query = 'DELETE FROM fbla.students WHERE students.id = ?';

    await db.query(query, req.session.selectedStudent);

    req.session.selectedStudent = -1;

    res.redirect('/students');
}

module.exports = {
    getStudents: getStudents,
    getAddStudents: getAddStudents,
    addStudent: addStudent,
    randomizeStudents: randomizeStudents,
    tableSearch: tableSearch,
    tableSort: tableSort,
    editStudent: editStudent,
    getEditStudent: getEditStudent,
    deleteStudent: deleteStudent
}