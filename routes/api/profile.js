const express = require('express');
const router = express.Router();

/*
* @Route    GET api/profile/test
* @desc     Tests profile routes
* @access   Public
*/
router.get('/test', (req, res) => res.json({
    message : "Profile working"
}));

module.exports = router;