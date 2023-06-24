const express = require('express');

const router = express.Router();

const prizesConrtoller = require("../controllers/prizes.controller");

router.get('/prizes', prizesConrtoller.getPrizes);

router.get('/add-prizes', prizesConrtoller.getAddPrizes);

router.post('/addPrize', prizesConrtoller.addPrize)

router.post('/prizesSearch', prizesConrtoller.prizeSearch);

router.get('/prizes/:header', prizesConrtoller.prizesSort);

router.get('/editPrizes/:id', prizesConrtoller.getEditPrize);

router.post('/edit-Prize', prizesConrtoller.editPrize);

router.get('/deletePrize', prizesConrtoller.deletePrize);

module.exports = router;