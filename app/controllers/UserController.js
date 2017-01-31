/**
* @module User Controller
* @description The controller that is responsible of handling user's requests
*/

var User = require('../models/User').User;
var format = require('../script').errorFormat;

/**
* This function gets a list of all users currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.index = function(req, res, next) {
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

      req.err = 'UserController.js, Line: 30\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   User.findAll().then(function(users) {
      if (!users) {
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'UserController.js, Line: 44\nThe users were not found.';

         next();
      }
      else {
         var result = [];

         var addUsers = function(i, callback) {
            if (i == users.length) {
               callback(null);
               return;
            }

            users[i].getCommittee().then(function(committee) {
               var curUser = {
                  id: users[i].id,
                  first_name: users[i].first_name,
                  last_name: users[i].last_name,
               };

               if (committee)
                  curUser.committee = { id: committee.id, name: committee.name };

               result.push(curUser);
               addUsers(i+1, callback);
            }).catch(function(err) {
               /* failed to retreive the committee of the current user */
               callback(err);
               return;
            });
         };

         addUsers(0, function(err) {
            if (err) {
               res.status(500).json({
                  status:'failed',
                  message: 'Internal server error'
               });

               req.err = 'UserController.js, Line: 83\nCouldn\'t retreive the users from the database.\n' + String(err);

               next();

               return;
            }

            res.status(200).json({
               status:'succeeded',
               users: result
            });

            next();
         });
      }
   }).catch(function(err) {
      /* failed to find the users in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 105\nCouldn\'t retreive the users from the database.\n' + String(err);

      next();
   });
};

/**
* This function gets a specifid user currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.show = function(req, res, next) {
   /*Validate and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'validity').isInt();

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'UserController.js, Line: 133\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id;
   var user = req.user;

   /* Get requested user */
   User.findById(id).then(function(requestedUser) {
      if (!requestedUser) {
         /* Requested user was not found in the database */
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'UserController.js, Line: 152\nThe requested user was not found in the database.';

         next();

         return;
      }

      /* Get the committee of the requested user */
      requestedUser.getCommittee().then(function(requestedCommittee) {
         /* Requested committee was not found in the database */
         if (!requestedCommittee) {

            var result;
            if (user.isUpperBoard() || user.id == id || user.isAdmin()) {
               // Detailed Profile
               result = requestedUser.toJSON(true);
            }
            else {
               // Basic Profile
               result = requestedUser.toJSON(false);
            }

            res.status(200).json({
               status:'succeeded',
               user: result
            });

            next();

            return;
         }

         /* Get the head of this committee */
         requestedCommittee.head(function(head, error) {
            if (error) {
               /* Couldn't get the head for the requested committee */
               res.status(500).json({
                  status: 'failed',
                  message: 'Internal server error'
               });

               req.err = 'UserController.js, Line: 193\nCouldn\'t retreive the head of the commitee.\n' + String(error);

               next();

               return;
            }

            var result;
            if ((head && head.id == user.id) || user.isUpperBoard() || user.id == id || user.isAdmin()) {
               // Detailed Profile
               result = requestedUser.toJSON(true);
            }
            else {
               // Basic Profile
               result = requestedUser.toJSON(false);
            }

            res.status(200).json({
               status:'succeeded',
               user: result
            });

            next();
         });

      }).catch(function(err) {
         /* failed to find the user's committee.*/
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'UserController.js, Line: 225\nCouldn\'t retreive the user\'s committee.\n' + String(err);

         next();
      });


   }).catch(function(err) {
      /* failed to find the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 238\nCouldn\'t retreive the user from the database.\n' + String(err);

      next();
   });
};

/**
* This function stores the provided user in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next) {
   /*Validate and sanitizing email Input*/
   req.checkBody('email', 'required').notEmpty();
   req.checkBody('email', 'validity').isEmail();
   req.sanitizeBody('email').escape();
   req.sanitizeBody('email').trim();
   req.sanitizeBody('email').normalizeEmail({ lowercase: true });

   /*Validate and sanitizing Password Input*/
   req.checkBody('password', 'required').notEmpty();
   req.assert('password', 'validity').len(6, 20);

   /*Validate and sanitizing type Input*/
   req.checkBody('type', 'required').notEmpty();
   req.checkBody('type', 'validity').isIn(['Admin', 'Upper Board', 'High Board', 'Member']);
   req.sanitizeBody('type').escape();
   req.sanitizeBody('type').trim();

   /*Validate and sanitizing first name Input*/
   req.checkBody('first_name', 'required').notEmpty();
   req.sanitizeBody('first_name').escape();
   req.sanitizeBody('first_name').trim();

   /*Validate and sanitizing last name Input*/
   req.checkBody('last_name', 'required').notEmpty();
   req.sanitizeBody('last_name').escape();
   req.sanitizeBody('last_name').trim();

   /*Validate and sanitizing birthdate Input*/
   req.checkBody('birthdate', 'required').notEmpty();
   req.sanitizeBody('birthdate').escape();
   req.sanitizeBody('birthdate').trim();

   /*Validate and sanitizing phone number Input*/
   req.checkBody('phone_number', 'required').notEmpty();
   req.sanitizeBody('phone_number').escape();
   req.sanitizeBody('phone_number').trim();
   req.checkBody('phone_number', 'validity').isPhoneNumber();

   /*Validate and sanitizing gender Input*/
   req.checkBody('gender', 'required').notEmpty();
   req.checkBody('gender', 'validity').isIn(['Male', 'Female']);
   req.sanitizeBody('gender').escape();
   req.sanitizeBody('gender').trim();

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
   }

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'UserController.js, Line: 310\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var obj = {
      email : req.body.email,
      password : req.body.password,
      type : req.body.type,
      first_name : req.body.first_name,
      last_name : req.body.last_name,
      birthdate : req.body.birthdate,
      phone_number: req.body.phone_number,
      gender : req.body.gender,
      IEEE_membership_ID : req.body.IEEE_membership_ID,
      settings: {
         public: {
            background: "The background of the profile"
         },
         private: {
            notifications: {
               email: {
                  comment: "boolean sent email on comments",
                  lastSent: "timestamp",
                  meetingDay: "boolean sent email on meeting day",
                  taskDeadline: "boolean sent a reminder email before the task deadline",
                  taskAssignment: "boolean sent email on task assignment",
                  meetingAssignment: "boolean sent email on meetings"
               }
            }
         }
      }
   };

   User.create(obj).then(function() {
      res.status(200).json({
         status: 'succeeded',
         message: 'user successfully added'
      });

      next();
   }).catch(function(err) {
      if (err.message === 'Validation error') {
         /* The user violated database constraints */
         var errors = [];
         for (var i = 0; i < err.errors.length; i++) {
            var curError = err.errors[i];

            errors.push({
               param: curError.path,
               value: curError.value,
               type: curError.type
            });
         }

         res.status(400).json({
            status:'failed',
            error: errors
         });

         req.err = 'UserController.js, Line: 372\nThe user violated some database constraints.\n' + JSON.stringify(errors);
      }
      else {
         /* failed to save the user in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'UserController.js, Line: 381\nCouldn\'t save the user in the database.\n' + String(err);
      }

      next();
   });
};

/**
* This function updates a user's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next) {
   /*Validate Old Password Input*/
   req.checkBody('old_password', 'required').notEmpty();

   var obj = {};
   /*Validate New Password Input*/
   if (req.body.new_password) {
      req.assert('new_password', 'validity').len(6, 20);
      obj.password = req.body.new_password;
   }

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
      obj.IEEE_membership_ID = req.body.IEEE_membership_ID;
   }

   /*Sanitizing Phone Number Input*/
   if (req.body.phone_number) {
      req.sanitizeBody('phone_number').escape();
      req.sanitizeBody('phone_number').trim();
      req.checkBody('phone_number', 'validity').isPhoneNumber();
      obj.phone_number = req.body.phone_number;
   }


   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'UserController.js, Line: 430\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   if (!req.user.validPassword(req.body.old_password)) {
      res.status(403).json({
         status: 'failed',
         message: 'The provided credentials are not correct'
      });

      req.err = 'UserController.js, Line: 443\nThe old password doesn\'t match the password in the database.';

      next();

      return;
   }

   User.update(obj, { where : { id : req.user.id } }).then(function(affected) {
      if (affected[0] == 1) {
         res.status(200).json({
            status: 'succeeded',
            message: 'user successfully updated'
         });
      }
      else {
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'UserController.js, Line: 463\nThe requested user was not found in the database.';
      }

      next();
   }).catch(function(err) {
      /* failed to update the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 474\nCouldn\'t update the user in the database.\n' + String(err);

      next();
   });
};
