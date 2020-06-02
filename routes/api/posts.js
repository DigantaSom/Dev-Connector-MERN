const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route 		POST api/posts
// @desc  		Create a post
// @access 	  Private
router.post('/', [auth, [check('text', 'Text is required').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
        });

        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route		GET api/posts
// @desc		Get all posts
// @access	  Private	(since we won't be able to view this url if we're not logged in)
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 }); //sort by date, in descending order (most recent first)
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route		GET api/posts/:id
// @desc		Get post by id
// @access	  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found',
            });
        }
        res.json(post);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found',
            });
        }
        res.status(500).send('Server Error');
    }
});

// @route		DELETE api/posts/:id
// @desc		Delete a post
// @access	  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found',
            });
        }
        // only the post owner should be able to delete the post
        // check for user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized',
            });
        }
        await post.delete();
        res.json({
            msg: 'Post removed',
        });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found',
            });
        }
        res.status(500).send('Server Error');
    }
});

// @route		PUT api/posts/like/:post_id
// @desc		Like a post
// @access	  Private
router.put('/like/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        // Check if the post is already been liked by the same user
        if (post.likes.some(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({
                msg: 'Post already liked',
            });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route		PUT api/posts/unlike/:post_id
// @desc		Unlike a post
// @access	  Private
router.put('/unlike/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        // Check if post exists by provided id
        // if (!post) {
        //     return res.json(404).json({
        //         msg: 'Post not found',
        //     });
        // }

        // Check if the post is already been liked by the same user
        if (!post.likes.some(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({
                msg: 'Post has not been liked yet',
            });
        }

        // Get remove index
        // const removeIndex = post.likes
        //     .map(like => like.user.toString())
        //     .indexOf(req.user.id);
        // post.likes.splice(removeIndex, 1);

        // or just simply, remove the like
        post.likes = post.likes.filter(({ user }) => user.toString() !== req.user.id);

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route 		POST api/posts/comment/:post_id
// @desc  		Comment on a post
// @access 	  Private
router.post(
    '/comment/:post_id',
    [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.post_id);

            const newComment = {
                user: req.user.id,
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
            };
            post.comments.unshift(newComment);

            await post.save();
            res.json(post.comments);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route 		DELETE api/posts/comment/:post_id/:comment_id
// @desc  		Delete a comment of a post
// @access 	  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        // Pull out the comment to be deleted
        const comment = post.comments.find(com => com.id === req.params.comment_id);

        // Make sure the comment exists
        if (!comment) {
            return res.status(400).json({ msg: 'Comment does not exist' });
        }

        // Check if the user that's deleting the comment is the owner of the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Now delete the comment
        post.comments = post.comments.filter(com => com.id !== req.params.comment_id);

        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
