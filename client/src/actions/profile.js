import axios from 'axios';
import { setAlert } from './alert';
import {
    GET_PROFILE,
    GET_PROFILES,
    GET_REPOS,
    PROFILE_ERROR,
    UPDATE_PROFILE,
    ACCOUNT_DELETED,
    CLEAR_PROFILE,
} from './types';

// Get current user's profile
export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me'); // backend -> routes/api/profile.js

        dispatch({
            type: GET_PROFILE,
            payload: res.data, // current user's profile
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Get all profiles
export const getProfiles = () => async dispatch => {
    dispatch({ type: CLEAR_PROFILE }); // to prevent the flashing of the past user's profile

    try {
        const res = await axios.get('/api/profile'); // backend -> routes/api/profile.js

        dispatch({
            type: GET_PROFILES,
            payload: res.data, // all profiles
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Get a user's profile (by user ID)
export const getProfileById = userId => async dispatch => {
    try {
        const res = await axios.get(`/api/profile/user/${userId}`); // backend -> routes/api/profile.js

        dispatch({
            type: GET_PROFILE,
            payload: res.data, // profile matching the user ID
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Get Github repos of a user
export const getGithubRepos = username => async dispatch => {
    try {
        const res = await axios.get(`/api/profile/github/${username}`); // backend -> routes/api/profile.js

        dispatch({
            type: GET_REPOS,
            payload: res.data, // Github repos
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Create or update current user's profile
export const createProfile = (formData, history, edit = false) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = await axios.post('/api/profile', formData, config);

        dispatch({
            type: GET_PROFILE,
            payload: res.data, // profile
        });

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

        // we can remove the if check to based on preference
        if (!edit) {
            history.push('/dashboard'); // redirect to dashboard afterwards acc. to the condition in this case
        }
    } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger', 6000)));
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Add Experience
export const addExperience = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = await axios.put('/api/profile/experience', formData, config);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data, // profile with added experience
        });

        dispatch(setAlert('Experience Added', 'success'));

        history.push('/dashboard'); // redirect to dashboard afterwards
    } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger', 6000)));
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Add Education
export const addEducation = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = await axios.put('/api/profile/education', formData, config);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data, // current profile, including education
        });

        dispatch(setAlert('Education Added', 'success'));

        history.push('/dashboard'); // redirect to dashboard afterwards
    } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger', 6000)));
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Delete Experience
export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/experience/${id}`);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data, // current user's profile without deleted experience
        });

        dispatch(setAlert('Experience Removed', 'success'));
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Delete Education
export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data, // current user's profile without deleted education
        });

        dispatch(setAlert('Education Removed', 'success'));
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {
                msg: err.response.statusText, // http status text
                status: err.response.status, // http status code
            },
        });
    }
};

// Delete current account & profile
export const deleteAccount = () => async dispatch => {
    if (window.confirm('Are you sure? This can NOT be undone!')) {
        try {
            await axios.delete('/api/profile');

            dispatch({ type: CLEAR_PROFILE });
            dispatch({ type: ACCOUNT_DELETED });

            dispatch(setAlert('Your account has been permenantly deleted', 7000));
        } catch (err) {
            dispatch({
                type: PROFILE_ERROR,
                payload: {
                    msg: err.response.statusText, // http status text
                    status: err.response.status, // http status code
                },
            });
        }
    }
};
