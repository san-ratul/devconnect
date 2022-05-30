const { request } = require('express');
const express = require('express');
const User = require('../../model/User');
const router = express.Router();
const gravatar = require('gravatar');

/*
* @Route    GET api/user/test
* @desc     Tests user routes
* @access   Public
*/
router.get('/test', (req, res) => res.json({
    message: "Users working"
}));

/*
* @Route    POST api/user/register
* @desc     Register User
* @access   Public
*/
router.post('/register', (req, res) => {
    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            return res.status(400).json({
                email: "E-mail already exists!"
            });
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '200', //Size
                r: 'pg', //Rating
                d: 'mm' //default
            })
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            })
        }
    });

});

module.exports = router;