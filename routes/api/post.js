const express = require('express');
const router = express.Router();

/*
* @Route    GET api/post/test
* @desc     Tests post routes
* @access   Public
*/
router.get('/test', (req, res) => res.json({
    message : "Posts working"
}));

module.exports = router;