import { v4 as uuid } from 'uuid'; // v5 is available though
import { SET_ALERT, REMOVE_ALERT } from './types';

// we can use dispatch because of the 'thunk' middleware

export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
    const id = uuid();
    
    dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id },
    });

    setTimeout(() => {
        dispatch({
            type: REMOVE_ALERT,
            payload: id,
        });
    }, timeout);
};
