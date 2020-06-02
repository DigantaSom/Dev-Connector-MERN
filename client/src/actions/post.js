import axios from 'axios';
import {
    GET_POSTS,
    POST_ERROR,
    UDPATE_LIKES,
    DELETE_POST,
    ADD_POST,
    GET_POST,
    ADD_COMMENT,
    REMOVE_COMMENT,
} from './types';
import { setAlert } from './alert';

// Get all posts
export const getAllPosts = () => async dispatch => {
    try {
        const res = await axios.get('/api/posts');

        dispatch({
            type: GET_POSTS,
            payload: res.data, // all posts
        });
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Like a post
export const addLike = post_id => async dispatch => {
    try {
        const res = await axios.put(`/api/posts/like/${post_id}`);

        dispatch({
            type: UDPATE_LIKES,
            payload: {
                post_id,
                likes: res.data,
            },
        });
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Unlike a post
export const removeLike = post_id => async dispatch => {
    try {
        const res = await axios.put(`/api/posts/unlike/${post_id}`);

        dispatch({
            type: UDPATE_LIKES,
            payload: {
                post_id,
                likes: res.data,
            },
        });
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Delete a post
export const deletePost = post_id => async dispatch => {
    if (window.confirm('Are you sure you want to delete this post?'))
        try {
            await axios.delete(`/api/posts/${post_id}`);

            dispatch({
                type: DELETE_POST,
                payload: post_id,
            });

            dispatch(setAlert('Post Deleted', 'success'));
        } catch (err) {
            dispatch({
                type: POST_ERROR,
                payload: {
                    msg: err.response.statusText, // http status text
                    status: err.response.status, // http status code
                },
            });
        }
};

// Add a post
export const addPost = formData => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const res = await axios.post('/api/posts', formData, config);

        dispatch({
            type: ADD_POST,
            payload: res.data, // created post
        });

        dispatch(setAlert('Post Created!', 'success'));
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Get a post
export const getPost = post_id => async dispatch => {
    try {
        const res = await axios.get(`/api/posts/${post_id}`);

        dispatch({
            type: GET_POST,
            payload: res.data, // post
        });
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Add a Comment to a post
export const addComment = (post_id, formData) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const res = await axios.post(`/api/posts/comment/${post_id}`, formData, config);

        dispatch({
            type: ADD_COMMENT,
            payload: res.data, // all comments
        });

        dispatch(setAlert('Comment Added!', 'success'));
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Delete Comment
export const deleteComment = (post_id, comment_id) => async dispatch => {
    if (window.confirm('Are you sure you want to delete this comment?'))
        try {
            await axios.delete(`/api/posts/comment/${post_id}/${comment_id}`);

            dispatch({
                type: REMOVE_COMMENT,
                payload: comment_id,
            });

            dispatch(setAlert('Comment Deleted', 'success'));
        } catch (err) {
            dispatch({
                type: POST_ERROR,
                payload: {
                    msg: err.response.statusText, // http status text
                    status: err.response.status, // http status code
                },
            });
        }
};
