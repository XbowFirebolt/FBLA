const express = require('express');

const studentsConrtoller = require("../controllers/students.controller");

const router = express.Router();

router.get('/students', studentsConrtoller.getStudents);

router.get('/add-students', studentsConrtoller.getAddStudents);

router.post('/addStudent', studentsConrtoller.addStudent);

router.post('/randomize', studentsConrtoller.randomizeStudents);

router.post('/tableSearch', studentsConrtoller.tableSearch);

router.get('/students/:header', studentsConrtoller.tableSort);

router.get('/editStudent/:id', studentsConrtoller.getEditStudent);

router.post('/edit-student', studentsConrtoller.editStudent);

router.get('/deleteStudent', studentsConrtoller.deleteStudent);

module.exports = router;