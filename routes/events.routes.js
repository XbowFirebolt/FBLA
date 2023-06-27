const express = require('express');

const eventsConrtoller = require("../controllers/events.controller");

const router = express.Router();

router.get('/events', eventsConrtoller.getEvents);

router.get('/add-events', eventsConrtoller.getAddEvents);

router.post('/addEvent', eventsConrtoller.addEvent);

router.post('/eventsSearch', eventsConrtoller.eventSearch);

router.get('/events/:header', eventsConrtoller.eventsSort);

router.get('/editEvents/:id', eventsConrtoller.getEditEvent);

router.post('/edit-Event', eventsConrtoller.editEvent);

router.get('/deleteEvent', eventsConrtoller.deleteEvent);

router.get('/setAttendance/:id', eventsConrtoller.getAttendance);

router.post('/setAttendance', eventsConrtoller.setAttendance);

module.exports = router;