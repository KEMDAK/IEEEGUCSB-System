/**
 * This is a middleware that validates that the request sender is a visitor
 * @param  {HTTP}   req  The request object
 * @param  {HTTP}   res  The response object
 * @param  {Function} next Callback function that is called once the validation succeed
 * @ignore
 */
 module.exports = function(req, res, next) {
    var jwt  = require('jsonwebtoken');
    var User = require('../models/User').User;
    
    /* getting the token from the http headers */
    var token = req.headers.authorization;


    if(token){
        /* The request has an authorization header */

        try
        {
            /* validating the token */
            var payload = jwt.verify(token, secret);

            User.findById(payload.id).then(function(user) {
                /* Adding the authenticated user to the request object */
                req.user = user;

                /* Adding the token payload the request object */
                req.payload = payload;

                req.err = "VisitorMiddleware.js, 31\nThe user tries to access a route that is only for visitors.";

                log.save(req, res);
            });
        }
        catch(err){
            req.err = "VisitorMiddleware.js, 37\nThe user tries to access a route that is only for visitors.";

            log.save(req, res);
        }


        res.status(403).json({
            status:'failed',
            message: 'Access Denied'
        });
    }
    else{
        next();
    }
};
