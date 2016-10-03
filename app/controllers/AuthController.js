/**
* @module Auth Controller
* @description The controller that is responsible of handling requests that deals with authentication.
*/

var User              = require('../models/User').User;
var Identity          = require('../models/Identity').Identity;
var jwt               = require('jsonwebtoken');
var path              = require('path');

/**
* This function handles /logout get request by removing the corresponding identity from the database
* @param  {HTTP}   req The request Object
* @param  {HTTP}   res The response Object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.logout = function (req, res, next){
    Identity.findOne({where: {user_id: req.payload.userId, user_agent: req.payload.userAgent } } ).then(function(identity){
        if(!identity){
            //no Identity found
            res.status(400).json({
                status:'failed'
            });

            req.err = 'The used identity was not found in the database';

            next();
        }
        else{
            //delete the identity from the database
            identity.destroy().then(function(){
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

                req.err = err;

                next();
            });
        }
    }).catch(function(err){

        /* failed to find the identity in the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });

        req.err = err;

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
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Enter a Valid Email address').isEmail();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('email').trim();
    req.sanitizeBody('email').normalizeEmail({ lowercase: true });

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
    var email     = req.body.email;

    /* search for the user */
    User.findOne({ where: {email: email} }).then(function(user) {
        if(user){
            /* Adding the user to the request object */
            req.user = user;

            /* saving the identity */
            var exp_date = new Date();
            exp_date.setDate(exp_date.getDate() + 1); // sets the expiry date to one day

            /* generating a reset token */
            var payload = {
                type: 'reset-token',
                userId: user.id,
                exp: exp_date.getTime() // 24 hours
            };
            var token = jwt.sign(payload, process.env.JWTSECRET);

            // var templateDir = path.join(__dirname, '../../', 'public', 'views', 'auth', 'emails', 'resetPasswordMail');
            // var mail = new EmailTemplate(templateDir);
            // var variables = {
            //     token: token
            // };

            // mail.render(variables, function (err, result) {
            //     if(err){
            //         return;
            //     }
            //
            //     /* setting up email options */
            //     var mailOptions = {
            //         from: process.env.FROM , // sender address
            //         to: email, // list of receivers
            //         subject:'Reset password request', // Subject line
            //         text: result.text, // plaintext body
            //         html: result.html // html body
            //     };
            //
            //     /* Sending the reset email */
            //     transporter.sendMail(mailOptions);

                user.reset_token = token;
                user.save();
            // });

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

        req.err = err;

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
    req.checkBody('password', 'Password is required').notEmpty();
    req.assert('password', 'The legnth of the password must be between 6 and 20 characters').len(6, 20);

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
    var password     = req.body.password;

    /* search for the user */
    User.findById(req.payload.userId).then(function(user) {
        if(!user){
            /* User not found */
            res.status(404).sendFile('/errors/404.html', { root : 'public/views'});

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

                req.err = err;

                next();
            });
        }
    }).catch(function(err){

        /* failed to find the user in the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });

        req.err = err;

        next();
    });
};
