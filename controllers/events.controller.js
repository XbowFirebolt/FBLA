const db = require('../data/database');

const Event = require('../models/event.model');
const sessionFlash = require('../util/session-flash');
const validation = require('../util/validation');

async function getEvents(req, res, next) {

    const query = 'SELECT * FROM fbla.events INNER JOIN sporting ON fbla.events.sporting = fbla.sporting.sporting_id WHERE school_id = ?';

    try {

        const events = await db.query(query, req.session.selectedSchool);

        const allEvents = events[0];

        if (events[0][0] === undefined) {

            const sessionData = {
                exists: false,
                allEvents: []
            }
            res.render('user/main/events/events', { inputData: sessionData });
        } else {

            const sessionData = {
                exists: true,
                allEvents: allEvents
            };

            res.render('user/main/events/events', { inputData: sessionData });
        }
    } catch (error) {
        next(error);
    }
}

function getAddEvents(req, res) {

    let sessionData = sessionFlash.getSessionData(req);

    if(!sessionData) {
        sessionData = {
            name: '',
            reward: ''
        };
    }

    res.render('user/main/events/addEvents', { inputData: sessionData });
}

async function addEvent(req, res, next) {

    if (req.body.sporting === undefined) {
        req.body.sporting = '0';
    }

    const enteredData = {
        name: req.body.name,
        sporting: req.body.sporting,
        date: req.body.date,
        reward: req.body.reward
    }

    if(!validation.eventDetailsAreValid(enteredData.name, enteredData.date, enteredData.reward)) {
        sessionFlash.flashDataToSession(req, { errorMessage: 'Please check your input', ...enteredData }, 
        function() {
            res.redirect('/add-events');
        })
        return;
    }

    const newEvent = new Event(
        req.body.name, req.body.sporting, req.body.date, req.body.reward, req.session.selectedSchool
        );

    try {
        await newEvent.add();
    } catch (error) {
        next(error);
        return;
    }

    res.redirect('/events');
}

async function eventSearch(req, res, next) {

    try {

        const query = 'SELECT * FROM fbla.events INNER JOIN sporting ON fbla.events.sporting = fbla.sporting.sporting_id WHERE school_id = ?';

        const events = await db.query(query, req.session.selectedSchool);

        if (events[0][0] === undefined) {
            const sessionData = {
                exists: false,
                allEvents: []
            }
            res.render('user/main/events/addEvents', { inputData: sessionData });
        } else {

            if(req.body.searchbar === undefined) {
                req.body.searchbar = req.session.eventSearchbar;
            }

            req.session.eventSearchbar = req.body.searchbar;

            var searchQuery = 'SELECT * FROM fbla.events INNER JOIN sporting ON fbla.events.sporting = fbla.sporting.sporting_id WHERE school_id = ? AND events.name LIKE ? ORDER BY ';

            const search = '%' + req.body.searchbar + '%';

            const header = req.session.eventTableSearch.header;

            if(header === 'events.name') {
                searchQuery += 'events.name ';
            } else if(header === 'events.sporting_id') {
                searchQuery += 'events.sporting_id ';
            } else if(header === 'events.date') {
                searchQuery += 'events.date ';
            } else if(header === 'events.reward') {
                searchQuery += 'events.reward ';
            } else {
                searchQuery += 'events.event_id';
            }
            if(req.session.eventTableSearch.descending) {
                searchQuery += ' DESC';
            } else {
                searchQuery += ' ASC';
            }

            const data = [
                req.session.selectedSchool,
                search,
            ]

            const allEvents = await db.query(searchQuery, data);

            const sessionData = {
                exists: true,
                allEvents: allEvents[0]
            }
            res.render('user/main/events/events', { inputData: sessionData });
        }   
    } catch (error) {
        next(error);
    }
}

function eventsSort(req, res, next) {

    if (req.params.header === req.session.eventTableSearch.header) {
        if(req.session.eventTableSearch.descending) {
            req.session.eventTableSearch.descending = false;
        } else {
            req.session.eventTableSearch.descending = true;
        }
    } else {
        req.session.eventTableSearch.header = req.params.header;
        req.session.eventTableSearch.descending = false;
    }

    eventSearch(req, res, next);
}

async function getEditEvent(req, res, next) {

    try {
        const id = req.params.id;

        const query = 'SELECT * FROM fbla.events WHERE event_id = ?';

        const editEvent = await db.query(query, id);

        let sessionData = sessionFlash.getSessionData(req);

        if(!sessionData) {
            sessionData = {
                id: editEvent[0][0].event_id,
                name: editEvent[0][0].name,
                sporting: editEvent[0][0].sporting,
                //date: editEvent[0][0].date.toISOString().split("T")[0],
                date: editEvent[0][0].date,
                reward: editEvent[0][0].reward
            };
        }

        req.session.selectedEvent = id;

        res.render('user/main/events/editEvents', { inputData: sessionData });

    } catch (error) {
        next(error);
    }
}

async function editEvent(req, res) {

    const query = 'UPDATE fbla.events SET name = ?, sporting = ?, date = ?, reward = ? WHERE event_id = ?';

    if (req.body.sporting) {
        req.body.sporting = '1';
    } else {
        req.body.sporting = '0';
    }

    const enteredData = {
        name: req.body.name,
        sporting: req.body.sporting,
        date: req.body.date,
        reward: req.body.reward
    }

    if(!validation.eventDetailsAreValid(enteredData.name, enteredData.date, enteredData.reward)) {
        sessionFlash.flashDataToSession(req, { errorMessage: 'Please check your input', ...enteredData }, 
        function() {
            res.redirect('/add-events');
        })
        return;
    }

    data = [
        req.body.name,
        req.body.sporting,
        req.body.date,
        req.body.reward,
        req.session.selectedEvent
    ]

    console.log(req.body.sporting);

    await db.query(query, data);

    req.session.selectedEvent = -1;

    res.redirect('/events');
}

async function deleteEvent(req, res) {
    const query = 'DELETE FROM fbla.events WHERE event_id = ?';

    await db.query(query, req.session.selectedEvent);

    req.session.selectedEvent = -1;

    res.redirect('/events');
}

function getAttendance(req, res) {

    const sessionData = {
        totalAttendance: 0,
        Attendees: [],
        id: ''
    };


    res.render('user/main/events/setAttendance', { inputData: sessionData });
}

module.exports = {
    getEvents: getEvents,
    getAddEvents: getAddEvents,
    addEvent: addEvent,
    eventSearch: eventSearch,
    eventsSort: eventsSort,
    getEditEvent: getEditEvent,
    editEvent: editEvent,
    deleteEvent: deleteEvent,
    getAttendance: getAttendance
}