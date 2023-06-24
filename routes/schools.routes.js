const express = require('express');

const schoolsConrtoller = require("../controllers/schools.controller");

const router = express.Router();

router.get('/schools', schoolsConrtoller.getSchool);

router.get('/new-schools', schoolsConrtoller.getNewSchools);

router.get('/create-school', schoolsConrtoller.getCreateSchool);

router.post('/create-school', schoolsConrtoller.createSchool);

router.get('/preview-school', function(req, res) {
    res.render('user/main/preview-school');
})

router.post('/preview-school', schoolsConrtoller.getSchoolDetails);

router.post('/join', schoolsConrtoller.joinSchool);

router.post('/edit-school', schoolsConrtoller.editSchool);

router.post('/change-school', schoolsConrtoller.changeSchool);

module.exports = router;