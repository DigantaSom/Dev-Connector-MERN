import axios from 'axios';
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    CLEAR_PROFILE,
} from './types';
import setAuthToken from '../utils/setAuthToken';
import { setAlert } from './alert';
// import { getCurrentProfile } from './profile';

// Load user
export const loadUser = () => async dispatch => {
    /* Adding a global header ->
	if we have a token in our localStorage, i wanna always send that in header, just like we did on Postman */
    if (localStorage.token) {
        setAuthToken(localStorage.token);
    }
    try {
        const res = await axios.get('/api/auth');

        dispatch({
            type: USER_LOADED,
            payload: res.data, // (user is sent from backend -> routes/api/auth.js)
        });
    } catch (err) {
        dispatch({
            type: AUTH_ERROR,
        });
    }
};

// Register user
export const register = ({ name, email, password }) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const body = JSON.stringify({ name, email, password });

    try {
        const res = await axios.post('/api/users', body, config);

        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data, // this object contains token from server
        });

        dispatch(loadUser());
    } catch (err) {
        const errors = err.response.data.errors; // refer to the express-validator errors section of backend -> routes/api/users.js

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger', 6000)));
        }

        dispatch({
            type: REGISTER_FAIL,
        });
    }
};

// Login user
export const login = (email, password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const body = JSON.stringify({ email, password });

    try {
        const res = await axios.post('/api/auth', body, config);

        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data, // this object contains token from server
        });

        dispatch(loadUser());
        // getCurrentProfile();
    } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger', 8000)));
        }

        dispatch({
            type: LOGIN_FAIL,
        });
    }
};

// Logout / Clear Profile
export const logout = () => dispatch => {
    dispatch({
        type: CLEAR_PROFILE,
    });

    dispatch({
        type: LOGOUT,
    });
};
