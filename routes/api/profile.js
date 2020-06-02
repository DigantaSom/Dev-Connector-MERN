const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const request = require('request');
const config = require('config');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route 		GET api/profile/me
// @desc  		Get current user's profile
// @access 	  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id, // req.user comes from the token (so that find this only when a particular user is logged in)
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user',
            });
        }
        res.json(profile);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

// @route 		POST api/profile
// @desc  		Create or update current user's profile
// @access 	  Private
router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'At least one skill is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            status,
            skills,
            bio,
            githubusername,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin,
        } = req.body;

        // Build profile object
        const profileFields = {}; // because there are nested objects and arrays

        profileFields.user = req.user.id;

        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if (profile) {
                // Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            // Create
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route 		GET api/profile
// @desc  		Get all profiles
// @access 	  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route 		GET api/profile/user/:user_id
// @desc  		Get a user's profile (by user ID)
// @access 	  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id,
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(404).json({
                msg: 'Profile not found',
            });
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(404).json({
                msg: 'Profile not found',
            });
        }
        res.status(500).send('Server Error');
    }
});

// @route 		DELETE api/profile
// @desc  		Delete current user's profile, user & posts
// @access 	  Private
router.delete('/', auth, async (req, res) => {
    /** The order of the deletion of the schemas are important */
    try {
        // Delete posts
        await Post.deleteMany({ user: req.user.id });
        // Delete profile
        await Profile.findOneAndDelete({ user: req.user.id });
        // Delete user
        await User.findOneAndDelete({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route 		PUT api/profile/experience
// @desc  		Add profile experience  (update original profile document)
// @access 	  Private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { title, company, location, from, to, current, description } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            // unshift() does the same thing of push(), except it pushes it on to the beginning rather in the end
            // = most recent are first
            profile.experience.unshift(newExp);

            await profile.save();

            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route 		DELETE api/profile/experience/:exp_id
// @desc  		Delete an experience from profile (by experience ID)
// @access 	  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1); // take out (delete) 1 index which is removeIndex

        // or we could simply filter out the non-matched ids like this ->
        // profile.experience = profile.experience.filter(exp => exp._id.toString() !== req.params.exp_id);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route 		PUT api/profile/education
// @desc  		Add profile education       (update original profile document)
// @access 	  Private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study date is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { school, degree, fieldofstudy, from, to, current, description } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            // unshift() does the same thing of push(), except it pushes it on to the beginning rather in the end
            // = most recent are first
            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route 		DELETE api/profile/education/:edu_id
// @desc  		Delete an education from profile (by education ID)
// @access 	  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1); // take out (delete) 1 index which is removeIndex

        // or we could simply filter out the non-matched ids like this ->
        // profile.education = profile.education.filter(
        //   edu => edu._id.toString() !== req.params.edu_id
        // );

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route 		GET api/profile/github/:username
// @desc  		Get Github repos of a user
// @access 	  Public
router.get('/github/:username', async (req, res) => {
    try {
        // deprecated ------------>>
        const options = {
            uri: encodeURI(
                `https://github.com/users/${
                    req.params.username
                }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                    'githubClientId'
                )}&client_secret=${config.get('githubSecret')}`
            ),
            method: 'GET',
            headers: { 'user-agent': 'node.js' }, // important
        };

        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
            }
            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Github profile found' });
            }
            res.json(JSON.parse(body)); // becuase, 'body' is a string
        });
        // const uri = encodeURI(
        //     `https://api.github.com/users/${
        //         req.params.username
        //     }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        //         'githubClient'
        //     )}&client_secret=${config.get('githubSecret')}`
        // );
        // const headers = {
        //     'user-agent': 'node.js',
        //     // Authorization: `token ${config.get('githubToken')}`,
        //     Authorization: `token ${config.get('githubSecret')}`,
        // };

        // const gitHubResponse = await axios.get(uri, { headers });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
