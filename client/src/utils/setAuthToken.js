import axios from 'axios';

const setAuthToken = token => {
    if (token) {
        // set the global header
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        // if what we pass in is not a token
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

export default setAuthToken;
