const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
	// Get token from header
	const token = req.header('x-auth-token');

	if (!token) {
		return res.status(401).json({
			msg: 'No token, authorization denied'
		});
	}

	// Verify token
	try {
		jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
	      if (error) {
	        return res.status(401).json({ msg: 'Token is not valid' });
	      } else {
	        req.user = decoded.user;
	        next();
	      }
	    });
	} catch (error) {
		res.status(401).json({
			msg: 'Token is not valid'
		});
	}
};

/* To login ------>>>
 header key -> x-auth-token
 header value -> <token>
*/