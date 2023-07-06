const express = require('express');

const router = express.Router();

router.get('/', function(req, res) {
    res.render('user/base/main');
});

router.get('/about', function(req, res) {
    res.render('user/base/about');
})

module.exports = router;