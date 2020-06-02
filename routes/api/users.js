const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        if (users.length > 0) {
            res.json(users);
        }
    } catch (err) {
        res.status(400).json({
            error: err,
        });
    }
});

// @route 		POST api/users
// @desc  		Register User
// @access 	  Public
router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({ email });

            if (user) {
                // return is important, unless -> unhandled promise rejection error
                return res.status(400).json({
                    errors: [{ msg: 'User already exists' }],
                });
            }

            // Get user's Gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm',
            });

            user = new User({ name, email, avatar, password });

            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // Return jsonwebtoken		(becuase in the frontend, when the user registers, i want them to get logged in right away)
            const payload = {
                user: {
                    id: user._id, // (_ may be omitted. courtesy of mongoose)
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '1d' }, // see the official docs for other values
                (err, token) => {
                    if (err) {
                        throw err;
                    } else {
                        res.json({ token }); // we can also send an user id along with the unique token
                    }
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
