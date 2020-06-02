import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
    alerts !== null &&
    alerts.length > 0 &&
    alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
            {alert.msg}
        </div>
    ));

Alert.propTypes = {
    alerts: PropTypes.array.isRequired, // ptar for snippet
};

// works similar to useSelector() hook
const mapStateToProps = state => ({
    alerts: state.alert,
});

export default connect(mapStateToProps)(Alert); // connect has dispatch object in actions/alert.js which works like useDispatch() hook
