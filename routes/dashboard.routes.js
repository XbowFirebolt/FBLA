const express = require('express');

const router = express.Router();

router.get('/dashboard', function(req, res) {
    res.render('user/main/dashboard')
});

module.exports = router;