const express = require('express');
const router = express.Router();

/*
* @Route    GET api/user/test
* @desc     Tests user routes
* @access   Public
*/
router.get('/test', (req, res) => res.json({
    message : "Users working"
}));

module.exports = router;