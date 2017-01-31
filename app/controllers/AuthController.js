/**
* @module Auth Controller
* @description The controller that is responsible of handling requests that deals with authentication.
*/

var User       = require('../models/User').User;
var Identity   = require('../models/Identity').Identity;
var Committee  = require('../models/Committee').Committee;
var jwt        = require('jsonwebtoken');
var path       = require('path');
var nodemailer = require('nodemailer');
var format     = require('../script').errorFormat;

/**
* This function recieves and handles login request
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.login = function(req, res, next) {
    /*Validate and sanitizing email Input*/
    req.checkBody('email', 'required').notEmpty();
    req.checkBody('email', 'validity').isEmail();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('email').trim();
    req.sanitizeBody('email').normalizeEmail({ lowercase: true });
    /*Validate and sanitizing Password Input*/
    req.checkBody('password', 'required').notEmpty();
    /*Validate and sanitizing User Agent*/
    req.checkHeaders('user_agent', 'required').notEmpty();
    req.checkHeaders('user_agent', 'validity').isIn(['Web', 'Android', 'IOS']);
    req.sanitizeHeaders('user_agent').escape();

    var errors = req.validationErrors();
    errors = format(errors);
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

        req.err = 'AuthController.js, 43\nSome validation errors occured.\n' + JSON.stringify(errors);

        next();

        return;
    }

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
            res.status(401).json({
                status: 'failed',
                message: 'The provided credentials are not correct'
            });

            req.err = 'AuthController.js, 67\nUser was not found in the database.';

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
                    var generateIdentity = function () {
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

                            user.getCommittee().then(function(committee) {
                                var curUser = user.toJSON(true, true);

                                if(committee){
                                    curUser.committee = { id: committee.id, name: committee.name };
                                }

                                res.status(200).json({
                                    status: 'succeeded',
                                    token: token,
                                    user: curUser
                                });

                                next();
                            }).catch(function(err) {
                                /* failed to find the committee in the database */
                                res.status(500).json({
                                    status: 'failed',
                                    message: 'Internal server error'
                                });

                                req.err = 'AuthController.js, 135\nFailed to find the committee in the database.\n' + err;

                                next();
                            });
                        }).catch(function(err) {
                            /* failed to save the user identity in the database */
                            res.status(500).json({
                                status: 'failed',
                                message: 'Internal server error'
                            });

                            req.err = 'AuthController.js, 146\nFailed to save the user identity in the database.\n' + err;

                            next();
                        });
                    };

                if (identity) {
                    /* found a valid identity */
                    try {
                        jwt.verify(identity.token, process.env.JWTSECRET);

                        /* Adding the authenticated user identity to the request object */
                        req.identity = identity;

                        user.getCommittee().then(function(committee) {
                            var curUser = user.toJSON(true, true);

                            if(committee){
                                curUser.committee = { id: committee.id, name: committee.name };
                            }

                            res.status(200).json({
                                status: 'succeeded',
                                token: identity.token,
                                user: curUser
                            });

                            next();
                        }).catch(function(err) {
                            /* failed to find the committee in the database */
                            res.status(500).json({
                                status: 'failed',
                                message: 'Internal server error'
                            });

                            req.err = 'AuthController.js, 181\nFailed to find the committee in the database.\n' + err;

                            next();
                        });

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

                    req.err = 'AuthController.js, 202\nFailed duo to an error in the database while trying to find the identity.\n' + err;

                    next();
                });
            } else {
                /* password mismatch */
                res.status(401).json({
                    status: 'failed',
                    message: 'The provided credentials are not correct'
                });

                req.err = 'AuthController.js, 213\nThe provided password doesn\'t match the database.\n';

                next();
            }
        }
    });
};


/**
* This function handles /logout get request by removing the corresponding identity from the database
* @param  {HTTP}   req The request Object
* @param  {HTTP}   res The response Object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.logout = function (req, res, next){
    //delete the identity from the database
    req.identity.destroy().then(function(){
        res.status(200).json({
            status:'succeeded'
        });

        next();
    }).catch(function(err){
        /* failed to destroy the identity in the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });

        req.err = 'AuthController.js, 243\nFailed to destroy the identity in the database\n' + err;

        next();
    });
};

/**
* This function recieves and handles forgot password request
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.forgotPassword = function (req, res, next) {
    /*Validate and sanitizing email Input*/
    req.checkBody('email', 'required').notEmpty();
    req.checkBody('email', 'validity').isEmail();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('email').trim();
    req.sanitizeBody('email').normalizeEmail({ lowercase: true });

    var errors = req.validationErrors();
    errors = format(errors);
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

        req.err = 'AuthController.js, 272\nSome validation errors occured.\n' + JSON.stringify(errors);

        next();

        return;
    }

    /* extracting data from the request body */
    var email     = req.body.email;

    /* search for the user */
    User.findOne({ where: {email: email} }).then(function(user) {
        if(user){
            /* Adding the user to the request object */
            req.user = user;

            /* generating the exp_date */
            var exp_date = new Date();
            exp_date.setDate(exp_date.getDate() + 1); // sets the expiry date to one day

            /* generating a reset token */
            var payload = {
                type: 'reset-token',
                userId: user.id,
            exp: exp_date.getTime() // 24 hours
            };

            var token = jwt.sign(payload, process.env.JWTSECRET);

            var transporter = nodemailer.createTransport('smtps://' + process.env.EMAIL + ':' + process.env.PASSWORD + '@' + process.env.MAIL_SERVER);
            var EmailTemplate = require('email-templates').EmailTemplate;
            var path = require('path');

            var templateDir = path.join(__dirname, '../../', 'public', 'emails', 'resetPasswordMail');
            var mail = new EmailTemplate(templateDir);
            var variables = {
                domain: process.env.DOMAIN,
                port: process.env.PORT,
                token: token
            };

            mail.render(variables, function (err, result) {
                if(err){
                    /* failed to render the email */
                    res.status(500).json({
                        status:'failed',
                        message: 'Internal server error'
                    });

                    req.err = 'AuthController.js, 321\nFailed to render the email.\n' + err;

                    next();

                    return;
                }

                /* setting up email options */
                var mailOptions = {
                    from: process.env.FROM , // sender address
                    to: email, // list of receivers
                    subject:'Reset password request', // Subject line
                    text: result.text, // plaintext body
                    html: result.html // html body
                };

                /* Sending the reset email */
                transporter.sendMail(mailOptions);

                user.reset_token = token;
                user.save();

                /* request handled */
                res.status(200).json({
                    status: 'succeeded'
                });

                next();
            });
        } else{
            req.err = 'AuthController.js, 351\nThe requested user was not found in the database.\n';

            /* request handled */
            res.status(200).json({
                status: 'succeeded'
            });

            next();
        }
    }).catch(function(err){

        /* failed to find the user in the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });

        req.err = 'AuthController.js, 368\nFailed to find the user in the database.\n' + err;

        next();
    });
};

/**
* This function recieves and handles reset password request
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.resetPassword = function (req, res, next) {
    /*Validate and sanitizing Password  Input*/
    req.checkBody('password', 'required').notEmpty();
    req.assert('password', 'validity').len(6, 20);

    var errors = req.validationErrors();
    errors = format(errors);
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

        req.err = 'AuthController.js, 394\nSome validation errors occured.\n' + JSON.stringify(errors);

        next();

        return;
    }

    /* extracting data from the request body */
    var password     = req.body.password;

    /* search for the user */
    User.findById(req.payload.userId).then(function(user) {
        if(!user){
            /* User not found */
            res.status(400).json({
                status:'failed'
            });

            req.err = 'AuthController.js, 412\nThe user was not found in the database.\n';

            next();
        }
        else{
            user.password = password;
            user.reset_token = null;
            user.save().then(function(user){
                /* request handled */
                res.status(200).json({
                    status: 'succeeded'
                });

                next();
            }).catch(function(err){

                /* failed to change the password in the database */
                res.status(500).json({
                    status:'failed',
                    message: 'Internal server error'
                });

                req.err = 'AuthController.js, 434\nFailed to change the password in the database.\n' + err;

                next();
            });
        }
    }).catch(function(err){

        /* failed to find the user in the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });

        req.err = 'AuthController.js, 447\nFailed to find the user in the database.\n' + err;

        next();
    });
};
