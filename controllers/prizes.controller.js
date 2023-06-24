const db = require('../data/database');

const Prize = require('../models/prize.model');
const sessionFlash = require('../util/session-flash');
const validation = require('../util/validation');

async function getPrizes(req, res, next) {

    const query = 'SELECT * FROM fbla.prizes INNER JOIN types ON fbla.prizes.type_id = fbla.types.type_id WHERE school_id = ?';

    try {

        const prizes = await db.query(query, req.session.selectedSchool);

        const allPrizes = prizes[0];

        if (prizes[0][0] === undefined) {

            const sessionData = {
                exists: false,
                allprizes: []
            }
            res.render('user/main/prizes/prizes', { inputData: sessionData });
        } else {

            const sessionData = {
                exists: true,
                allPrizes: allPrizes
            };

            res.render('user/main/prizes/prizes', { inputData: sessionData });
        }
    } catch (error) {
        next(error);
    }
}

function getAddPrizes(req, res) {

    let sessionData = sessionFlash.getSessionData(req);

    if(!sessionData) {
        sessionData = {
            name: '',
            points_required: ''
        };
    }

    res.render('user/main/prizes/addPrizes', { inputData: sessionData });
}

async function addPrize(req, res, next) {

    const enteredData = {
        name: req.body.name,
        type: req.body.rewardTypes,
        points_required: req.body.points_required
    }

    if(!validation.prizeDetailsAreValid(enteredData.name, enteredData.points_required)) {
        sessionFlash.flashDataToSession(req, { errorMessage: 'Please check your input', ...enteredData }, 
        function() {
            res.redirect('/add-prizes');
        })
        return;
    }

    const newPrize = new Prize(
        req.body.name, req.body.rewardTypes, req.body.points_required, req.session.selectedSchool
        );

    try {
        await newPrize.add();
    } catch (error) {
        next(error);
        return;
    }

    res.redirect('/prizes');
}

async function prizeSearch(req, res, next) {

    try {

        const query = 'SELECT * FROM fbla.prizes INNER JOIN types ON fbla.prizes.type_id = fbla.types.type_id WHERE school_id = ?';

        const prizes = await db.query(query, req.session.selectedSchool);

        if (prizes[0][0] === undefined) {
            const sessionData = {
                exists: false,
                allPrizes: []
            }
            res.render('user/main/prizes/prizes', { inputData: sessionData });
        } else {

            if(req.body.searchbar === undefined) {
                req.body.searchbar = req.session.prizeSearchbar;
            }

            req.session.prizeSearchbar = req.body.searchbar;

            var searchQuery = 'SELECT * FROM fbla.prizes INNER JOIN types ON fbla.prizes.type_id = fbla.types.type_id WHERE school_id = ? AND prizes.name LIKE ? ORDER BY ';

            const search = '%' + req.body.searchbar + '%';

            const header = req.session.prizeTableSearch.header;

            if(header === 'prizes.name') {
                searchQuery += 'prizes.name ';
            } else if(header === 'prizes.type_id') {
                searchQuery += 'prizes.type_id ';
            } else if(header === 'prizes.points_required') {
                searchQuery += 'prizes.points_required ';
            } else {
                searchQuery += 'prizes.id';
            }
            if(req.session.prizeTableSearch.descending) {
                searchQuery += ' DESC';
            } else {
                searchQuery += ' ASC';
            }

            const data = [
                req.session.selectedSchool,
                search,
            ]

            const allPrizes = await db.query(searchQuery, data);

            const sessionData = {
                exists: true,
                allPrizes: allPrizes[0]
            }
            res.render('user/main/prizes/prizes', { inputData: sessionData });
        }   
    } catch (error) {
        next(error);
    }
}

function prizesSort(req, res, next) {

    if (req.params.header === req.session.prizeTableSearch.header) {
        if(req.session.prizeTableSearch.descending) {
            req.session.prizeTableSearch.descending = false;
        } else {
            req.session.prizeTableSearch.descending = true;
        }
    } else {
        req.session.prizeTableSearch.header = req.params.header;
        req.session.prizeTableSearch.descending = false;
    }

    prizeSearch(req, res, next);
}

async function getEditPrize(req, res, next) {

    try {
        const id = req.params.id;

        const query = 'SELECT * FROM fbla.prizes WHERE id = ?';

        const editPrize = await db.query(query, id);

        let sessionData = sessionFlash.getSessionData(req);

        if(!sessionData) {
            sessionData = {
                id: editPrize[0][0].id,
                name: editPrize[0][0].name,
                type_id: editPrize[0][0].type_id,
                points_required: editPrize[0][0].points_required
            };
        }

        req.session.selectedPrize = id;

        res.render('user/main/prizes/editPrizes', { inputData: sessionData });

    } catch (error) {
        next(error);
    }
}

async function editPrize(req, res) {

    const query = 'UPDATE fbla.prizes SET name = ?, type_id = ?, points_required = ? WHERE id = ?';

    const enteredData = {
        name: req.body.name,
        type: req.body.rewardTypes,
        points_required: req.body.points_required
    }

    if(!validation.prizeDetailsAreValid(enteredData.name, enteredData.points_required)) {
        sessionFlash.flashDataToSession(req, { errorMessage: 'Please check your input', ...enteredData }, 
        function() {
            res.redirect('/add-prizes');
        })
        return;
    }

    data = [
        req.body.name,
        req.body.rewardTypes,
        req.body.points_required,
        req.session.selectedPrize
    ]

    await db.query(query, data);

    req.session.selectedPrize = -1;

    res.redirect('/prizes');
}

async function deletePrize(req, res) {
    const query = 'DELETE FROM fbla.prizes WHERE id = ?';

    await db.query(query, req.session.selectedPrize);

    req.session.selectedPrize = -1;

    res.redirect('/prizes');
}

module.exports = {
    getPrizes: getPrizes,
    getAddPrizes: getAddPrizes,
    addPrize: addPrize,
    prizeSearch: prizeSearch,
    prizesSort: prizesSort,
    getEditPrize: getEditPrize,
    editPrize: editPrize,
    deletePrize: deletePrize
}