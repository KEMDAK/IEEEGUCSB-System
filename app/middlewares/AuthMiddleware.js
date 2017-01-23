/**
 * This is a middleware that validates that the user is logged in
 * @param  {HTTP}   req  The request object
 * @param  {HTTP}   res  The response object
 * @param  {Function} next Callback function that is called once the validation succeed
 * @ignore
 */
module.exports = function(req, res, next) {
    var jwt      = require('jsonwebtoken');
    var Identity = require('../models/Identity').Identity;
    var log      = require('./LogMiddleware');
    var User = require('../models/User').User;


    /* getting the token from the http headers */
    var token = req.headers.authorization;
    /* getting the JWT seacret from the environment variables */
    var secret = process.env.JWTSECRET;

    try
    {
        /* validating the token */
        var payload = jwt.verify(token, secret);

        if(payload.type !== 'login-token'){
            /* The used token is not for logging in */
            throw "The used token is not for logging in";
        }

        /* double check if the token has been generated by the server */
        Identity.findOne({ where: {token: token} }).then(function(identity) {
            if(!identity){
                /* No record found of this token in the database */
                throw "The server has no record of the used token";
            }

            /* Adding the used identity to the request object */
            req.identity = identity;

            /* checking if the used token is intended to be used with the current user agent */
            if(identity.user_agent !== req.headers.user_agent){
                /* The used token is not for the use from the current user agent */
                throw "The used token is not for the use from the current user agent";
            }

            /* The token has been validated successfully */

            /* Updating the last logged in */
            identity.last_logged_in = new Date();
            identity.save();

            identity.getUser().then(function(user) {
                /* Adding the authenticated user to the request object */
                req.user = user;

                /* Adding the token payload the request object */
                req.payload = payload;

                next();
            }).catch(function(err){

                /* failed to find the user in the database */
                res.status(500).json({
                    status:'failed',
                    message: 'Internal server error'
                });

                req.err = err;

                log.save(req, res);
            });
        }).catch(function(err){

            /* The token is valid however it might be stolen */
            res.status(401).json({
                status:'failed',
                message: 'Authentication error, please log in again.'
            });

            req.err = err;

            log.save(req, res);
        });
    }
    catch (err)
    {
        /* The token failed the validation */
        res.status(401).json({
            status:'failed',
            message: 'Authentication error, please log in again.'
        });

        req.err = err;

        log.save(req, res);
    }
};
