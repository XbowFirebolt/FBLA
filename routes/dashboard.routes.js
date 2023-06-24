const express = require('express');

const dashboardConrtoller = require("../controllers/dashboard.controller");

const router = express.Router();

router.get('/dashboard', dashboardConrtoller.getDashboard);

router.get('/dashboard/:id', dashboardConrtoller.getDashboard);

module.exports = router;