const { request } = require('express');
const express = require('express');
const User = require('../../model/User');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken')
const keys = require('../../config/keys');
const passport = require('passport');

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
            });

            /*
            * hasing passwords
            */
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err))
                })
            })
        }
    });

});

/*
* @Route    POST api/user/login
* @desc     Login User & Return JWT Token
* @access   Public
*/
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({ email })
        .then(user => {
            if (!user) return res.status(404).json({ email: 'User not found' });

            // Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //user matched
                        const payload = { id: user.id, name: user.name, avatar: user.avatar }
                        //sign Token
                        JWT.sign(
                            payload,
                            keys.secretKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        return res.status(400).json({ password: 'Password Incorrect' });
                    }
                })
        })
});

/*
* @Route    GET api/user/current
* @desc     Return current user
* @access   Private
*/
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        message: 'success',
        user : {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
        }
    });
});


module.exports = router;