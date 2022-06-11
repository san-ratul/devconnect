const { request } = require('express');
const express = require('express');
const User = require('../../model/User');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken')
const keys = require('../../config/keys');
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../../validation/registration');
const validateLoginInput = require('../../validation/login');

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
    const { errors, isValid } = validateRegisterInput(req.body);
    //check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            errors.email = "E-mail already exists!";
            return res.status(400).json(errors);
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
    const {errors, isValid} = validateLoginInput(req.body);
    
    //check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({ email })
        .then(user => {
            if (!user){
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

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
                                return res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(404).json(errors);
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
    return res.json({
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