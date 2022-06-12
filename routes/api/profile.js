const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');
// Load Profile Model
const Profile = require('../../model/Profile');
// Load User Model
const User = require('../../model/User');
const { json } = require('body-parser');

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
        .catch(err => res.status(404).json({ noProfile: "There are no profiles" }));
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
        .catch(err => res.status(404).json({ noProfile: "There is no profile for this handle." }))
});

/*
* @Route    GET api/profile/user/:user_id
* @desc     Get profile by user ID
* @access   public
*/
router.get('/user/:user_id', (req, res) => {
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = "There is no profile for this user"
                return res.status(404).json(errors);
            }
            return res.json(profile);
        })
        .catch(err => res.status(404).json({ noProfile: "There is no profile for this user." }));
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
                    } else {
                        // Save Profile
                        new Profile(profileFields).save().then(profile => res.json(profile))
                    }
                });
            }
        })
});

/*
* @Route    POST api/profile/experience
* @desc     Create current users experience
* @access   private
*/
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    //check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            //add to exp array
            profile.experience.unshift(newExp);

            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json({ noProfile: "Please add a profile first!" }))
});

/*
* @Route    POST api/profile/education
* @desc     Create current users Education
* @access   private
*/
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    //check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            //add to education array
            profile.education.unshift(newEdu);

            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json({ noProfile: "Please add a profile first!" }))
});

/*
* @Route    DELETE api/profile/experience/:exp_id
* @desc     Delete current users Experience
* @access   private
*/
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);
            // Splice out of array
            if (removeIndex !== -1) {
                profile.experience.splice(removeIndex, 1);

                //Save
                profile.save()
                    .then(profile => res.json(profile))
                    .catch(err => res.status(404).json(err));
            } else {
                return res.status(404).json({ noExp: "No exprerice found" });
            }
        })
        .catch(err => res.status(404).json({ noProfile: "Please add a profile first!" }))
});

/*
* @Route    DELETE api/profile/education/:edu_id
* @desc     Delete current users Education
* @access   private
*/
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);
            // Splice out of array
            if (removeIndex !== -1) {
                profile.education.splice(removeIndex, 1);

                //Save
                profile.save()
                    .then(profile => res.json(profile))
                    .catch(err => res.status(404).json(err));
            } else {
                return res.status(404).json({ noExp: "No education found" });
            }
        })
        .catch(err => res.status(404).json({ noProfile: "Please add a profile first!" }))
});

/*
* @Route    DELETE api/profile/
* @desc     Delete current user and profile
* @access   private
*/
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOneAndRemove({ user: req.user.id })
    .then( () => {
        User.findOneAndRemove({_id : req.user.id})
        .then(() => res.json({success : true}));
    })
    .catch(err => res.status(404).json(err))
});



module.exports = router;