/**
 * @module Auth Controller
 * @description The controller that is responsible of handling requests that deals with authentication.
 */

var User = require('../models/User').User;
var Identity = require('../models/Identity').Identity;
var jwt = require('jsonwebtoken');

/**
 * This function recieves and handles login request
 * @param  {HTTP}   req  The request object
 * @param  {HTTP}   res  The response object
 * @param  {Function} next Callback function that is called once done with handling the request
 */
module.exports.login = function(req, res, next) {
    /*Validate and sanitizing email Input*/
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Enter a Valid Email address').isEmail();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('email').trim();
    req.sanitizeBody('email').normalizeEmail({
        lowercase: true
    });
    /*Validate and sanitizing Password Input*/
    req.checkBody('password', 'Password is required').notEmpty();
    /*Validate and sanitizing User Agent*/
    req.checkHeaders('user_agent', 'User Agent is required').notEmpty();
    req.checkHeaders('user_agent', 'Enter a valid User Agent').isIn(['Web', 'Android', 'IOS']);
    req.sanitizeHeaders('user_agent').escape();

    var errors = req.validationErrors();
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

        next();

        return;
    }

    /* extracting data from the request body */
    var email = req.body.email;
    var password = req.body.password;

    /* search for the user */
    User.findOne({
        where: {
            email: email
        }
    }).then(function(user) {
        if (!user) {
            /* user was not found */
            res.status(400).json({
                status: 'failed',
                message: 'The provided credentials are not correct'
            });

            next();
        } else {
            /* Adding the user to the request object */
            req.user = user;

            /* validating the users password */
            if (user.validPassword(password)) {
                /* user successfully authenticated */

                var userAgent = req.headers.user_agent;

                Identity.findOne({
                    where: {
                        user_agent: userAgent,
                        user_id: user.id
                    }
                }).then(function(identity) {
                    function generateIdentity() {
                        /* saving the identity */
                        var now = new Date();
                        var exp_date = new Date();
                        exp_date.setDate(exp_date.getDate() + 90);

                        /* generating a login token */
                        var payload = {
                            type: 'login-token',
                            userAgent: userAgent,
                            userId: user.id,
                            exp: exp_date.getTime() // 90 days
                        };
                        var token = jwt.sign(payload, process.env.JWTSECRET);

                        var identityInstance = Identity.build({
                            token: token,
                            token_exp_date: exp_date,
                            user_agent: userAgent,
                            last_logged_in: now,
                            user_id: user.id
                        });

                        identityInstance.save().then(function(identity) {

                            /* Adding the authenticated user identity to the request object */
                            req.identity = identity;

                            res.status(200).json({
                                status: 'succeeded',
                                token: token,
                                user: user.toJSON()
                            });

                            next();
                        }).catch(function(err) {
                            /* failed to save the user identity in the database */
                            res.status(500).json({
                                status: 'failed',
                                message: 'Internal server error'
                            });

                            req.err = err;

                            next();
                        });
                    }

                    if (identity) {
                        /* found a valid identity */
                        try {
                            jwt.verify(identity.token, process.env.JWTSECRET);

                            /* Adding the authenticated user identity to the request object */
                            req.identity = identity;

                            res.status(200).json({
                                status: 'succeeded',
                                token: identity.token,
                                user: user.toJSON()
                            });

                            next();

                            identity.last_logged_in = new Date();
                            identity.save();
                        } catch (err) {
                            identity.destroy();
                            generateIdentity();
                        }
                    } else {
                        generateIdentity();
                    }
                }).catch(function(err) {
                    /* failed duo to an error in the database while trying to find the identity */
                    res.status(500).json({
                        status: 'failed',
                        message: 'Internal server error'
                    });

                    req.err = err;

                    next();
                });
            } else {
                /* password mismatch */
                res.status(400).json({
                    status: 'failed',
                    message: 'The provided credentials are not correct'
                });

                next();
            }
        }
    });
};
