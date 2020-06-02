import {
    GET_PROFILE,
    UPDATE_PROFILE,
    PROFILE_ERROR,
    CLEAR_PROFILE,
    GET_PROFILES,
    GET_REPOS,
} from '../actions/types';

const initialState = {
    profile: null,
    profiles: [],
    repos: [],
    loading: true,
    error: {},
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case GET_PROFILE:
        case UPDATE_PROFILE:
            return {
                ...state,
                profile: payload,
                loading: false,
                // error: {}
            };

        case GET_PROFILES:
            return {
                ...state,
                profiles: payload,
                loading: false,
            };

        case GET_REPOS:
            return {
                ...state,
                repos: payload,
                loading: false,
            };

        case PROFILE_ERROR:
            return {
                ...state,
                loading: false,
                error: payload,
            };

        case CLEAR_PROFILE:
            return {
                ...state,
                profile: null,
                profiles: [],
                repos: [],
                loading: true,  // false in the tuts
            };

        default:
            return state;
    }
};
