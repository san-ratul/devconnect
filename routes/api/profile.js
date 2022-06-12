const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const validateProfileInput = require('../../validation/profile');
// Load Profile Model
const Profile = require('../../model/Profile');
// Load User Model
const User = require('../../model/User');

/*
* @Route    GET api/profile
* @desc     Get current users profile
* @access   private
*/
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = "There is no profile for this user"
                return res.status(404).json(errors);
            }
            return res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

/*
* @Route    GET api/profile/all
* @desc     Get all users profile
* @access   public
*/
router.get('/all', (req, res) => {
    const errors = {}
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noProfile = "No profiles found"
                return res.status(404).json(errors);
            }
            return res.json(profiles);
        })
        .catch(err => res.status(404).json({noProfile : "There are no profiles"}));
});

/*
* @Route    GET api/profile/handle/:handle
* @desc     Get profile by handle
* @access   public
*/
router.get('/handle/:handle', (req, res) => {
    Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if (!profile) {
            errors.noProfile = "There is no profile for this user"
            return res.status(404).json(errors);
        }
        return res.json(profile);
    })
    .catch(err => res.status(404).json({noProfile : "There is no profile for this handle."}))
});

/*
* @Route    GET api/profile/user/:user_id
* @desc     Get profile by user ID
* @access   public
*/
router.get('/user/:user_id', (req, res) => {
    Profile.findOne({ user : req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if (!profile) {
            errors.noProfile = "There is no profile for this user"
            return res.status(404).json(errors);
        }
        return res.json(profile);
    })
    .catch(err => res.status(404).json({noProfile : "There is no profile for this user."}));
});

/*
* @Route    POST api/profile
* @desc     Create current users profile
* @access   private
*/
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateProfileInput(req.body);

    //check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    //get fields
    const profileFields = {
        user: req.user.id,
    };
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.github_username) profileFields.github_username = req.body.github_username;
    // Skills - split into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
    //Social 
    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (profile) {
                //Update
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                )
                    .then(profile => res.json(profile));
            } else {
                // Create

                // Check if handle/slug exists
                Profile.findOne({ handle: profileFields.handle }).then(profile => {
                    if (profile) {
                        errors.handle = "That handle already exists";
                        return res.status(400).json(errors);
                    }
                });

                // Save Profile
                new Profile(profileFields).save().then(profile => res.json(profile))
            }
        })
});

module.exports = router;