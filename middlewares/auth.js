const jwt = require('jsonwebtoken');
const { response } = require('../helpers/response.formatter');
const { auth_secret } = require('./../config/base.config');

module.exports = {
    verifyToken: (req, res, next) => {
        let token = req.header('Authorization');
        
        if (!token) {
            return res.status(401).json(response(401, 'Unauthorized - No Token'));
        }

        try {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }
            
            const decoded = jwt.verify(token, auth_secret);

            req.userId = decoded.userId;
            req.user = {
                id: decoded.userId,
                role: decoded.role
            };
            next();
        } catch (error) {
            return res.status(401).json(response(401, 'Unauthorized - Invalid Token'));
        }
    }
};