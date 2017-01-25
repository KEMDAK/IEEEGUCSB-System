/**
* @module User Controller
* @description The controller that is responsible of handling user's requests
*/

/* Models */
var User = require('../models/User').User;

/**
* This function gets a list of all users currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.index = function(req, res, next) {
   User.findAll({}).then(function(users) {
      if (!users) {
         var message = 'The requested route was not found.';
         res.status(404).json({
            status:'failed',
            message: message
         });

         req.err = 'UserController.js, Line: 24\n' + message;

         next();
      }
      else {
         var result = [];
         for (var i = 0; i < users.length; i++)
            result.push(users[i].toJSON(false));

         res.status(200).json({
            status:'succeeded',
            users: result
         });

         next();
      }
   }).catch(function(err) {
      /* failed to find the users in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 47\nCouldn\'t retreive the users from the database.\n' + String(err);

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
   req.checkParams('id', 'ID is required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'Enter a valid ID').isInt();

   var errors = req.validationErrors();
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'UserController.js, Line: 74\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id;
   var user = req.user;

   /* Get requested user */
   User.findById(id).then(function(requestedUser) {
      if (!requestedUser) {
         /* Requested user was not found in the database */
         var message = 'The requested route was not found.';
         res.status(404).json({
            status:'failed',
            message: message
         });

         req.err = 'UserController.js, Line: 94\n' + message;

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
               result = requestedUser.toJSON(true);       // TO BE MODIFIED
            }
            else {
               // Basic Profile
               result = requestedUser.toJSON(false);       // TO BE MODIFIED
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

               req.err = 'UserController.js, Line: 135\nCouldn\'t retreive the head of the commitee.\n' + String(error);

               next();

               return;
            }

            var result;
            if ((head && head.id == user.id) || user.isUpperBoard() || user.id == id || user.isAdmin()) {
               // Detailed Profile
               result = requestedUser.toJSON(true);       // TO BE MODIFIED
            }
            else {
               // Basic Profile
               result = requestedUser.toJSON(false);       // TO BE MODIFIED
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

         req.err = 'UserController.js, Line: 167\nCouldn\'t retreive the user\'s committee.\n' + String(err);

         next();
      });


   }).catch(function(err) {
      /* failed to find the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 180\nCouldn\'t retreive the user from the database.\n' + String(err);

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
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'Enter a Valid Email address').isEmail();
   req.sanitizeBody('email').escape();
   req.sanitizeBody('email').trim();
   req.sanitizeBody('email').normalizeEmail({ lowercase: true });

   /*Validate and sanitizing Password Input*/
   req.checkBody('password', 'Password is required').notEmpty();
   req.assert('password', 'The length of the password must be between 6 and 20 characters').len(6, 20);

   /*Validate and sanitizing type Input*/
   req.checkBody('type', 'Type is required').notEmpty();
   req.checkBody('type', 'Enter a valid account type [\'Admin\', \'Upper Board\', \'High Board\', \'Member\']').isIn(['Admin', 'Upper Board', 'High Board', 'Member']);
   req.sanitizeBody('type').escape();
   req.sanitizeBody('type').trim();

   /*Validate and sanitizing first name Input*/
   req.checkBody('first_name', 'First Name is required').notEmpty();
   req.sanitizeBody('first_name').escape();
   req.sanitizeBody('first_name').trim();

   /*Validate and sanitizing last name Input*/
   req.checkBody('last_name', 'Last Name is required').notEmpty();
   req.sanitizeBody('last_name').escape();
   req.sanitizeBody('last_name').trim();

   /*Validate and sanitizing birthdate Input*/
   req.checkBody('birthdate', 'Birth Date is required').notEmpty();
   req.sanitizeBody('birthdate').escape();
   req.sanitizeBody('birthdate').trim();

   /*Validate and sanitizing gender Input*/
   req.checkBody('gender', 'Gender is required').notEmpty();
   req.checkBody('gender', 'Enter a valid gender [\'Male\', \'Female\']').isIn(['Male', 'Female']);
   req.sanitizeBody('gender').escape();
   req.sanitizeBody('gender').trim();

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
   }

   var errors = req.validationErrors();
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'UserController.js, Line: 245\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   User.findOrCreate({ where : { email : req.body.email, password : req.body.password, type : req.body.type, first_name : req.body.first_name, last_name : req.body.last_name, birthdate : req.body.birthdate, gender : req.body.gender, IEEE_membership_ID : req.body.IEEE_membership_ID } }).then(function(user, created) {
      res.status(200).json({
         status: 'succeeded',
         message: 'user successfully added'
      });

      next();
   }).catch(function(err) {
      /* failed to save the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 266\nCouldn\'t save the user in the database.\n' + String(err);

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
   // FIXME not all information is required.

   /*Validate and sanitizing email Input*/
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'Enter a Valid Email address').isEmail();
   req.sanitizeBody('email').escape();
   req.sanitizeBody('email').trim();
   req.sanitizeBody('email').normalizeEmail({ lowercase: true });

   /*Validate and sanitizing Password Input*/
   req.checkBody('password', 'Password is required').notEmpty();
   req.assert('password', 'The length of the password must be between 6 and 20 characters').len(6, 20);

   /*Validate and sanitizing type Input*/
   req.checkBody('type', 'Type is required').notEmpty();
   req.checkBody('type', 'Enter a valid account type [\'Admin\', \'Upper Board\', \'High Board\', \'Member\']').isIn(['Admin', 'Upper Board', 'High Board', 'Member']);
   req.sanitizeBody('type').escape();
   req.sanitizeBody('type').trim();

   /*Validate and sanitizing first name Input*/
   req.checkBody('first_name', 'First Name is required').notEmpty();
   req.sanitizeBody('first_name').escape();
   req.sanitizeBody('first_name').trim();

   /*Validate and sanitizing last name Input*/
   req.checkBody('last_name', 'Last Name is required').notEmpty();
   req.sanitizeBody('last_name').escape();
   req.sanitizeBody('last_name').trim();

   /*Validate and sanitizing birthdate Input*/
   req.checkBody('birthdate', 'Birth Date is required').notEmpty();
   req.sanitizeBody('birthdate').escape();
   req.sanitizeBody('birthdate').trim();

   /*Validate and sanitizing gender Input*/
   req.checkBody('gender', 'Gender is required').notEmpty();
   req.checkBody('gender', 'Enter a valid gender [\'Male\', \'Female\']').isIn(['Male', 'Female']);
   req.sanitizeBody('gender').escape();
   req.sanitizeBody('gender').trim();

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
   }

   var errors = req.validationErrors();
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'UserController.js, Line: 333\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   User.update({ type : req.body.type, first_name : req.body.first_name, last_name : req.body.last_name, birthdate : req.body.birthdate, gender : req.body.gender, email : req.body.email, password : req.body.password, IEEE_membership_ID : req.body.IEEE_membership_ID }, { where : { id : req.user.id } }).then(function(affected) {
      if (affected[0] == 1) {
         res.status(200).json({
            status: 'succeeded',
            message: 'user successfully updated'
         });
      }
      else {
         var message = 'The requested route was not found.';
         res.status(404).json({
            status:'failed',
            message: message
         });

         req.err = 'UserController.js, Line: 354\n' + message;
      }

      next();
   }).catch(function(err) {
      /* failed to update the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 354\nCouldn\'t save the user in the database.\n' + err;

      next();
   });
};
