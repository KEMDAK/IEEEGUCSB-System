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
* @return {Array}  result The users currently in the database
*/
module.exports.index = function(req, res, next) {
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

      req.err = errors;

      next();

      return;
   }

   User.findAll({}).then(function(users) {
      if (!users) {
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'The requested route was not found.';

         next();
      }
      else {
         var result = [];
         for (var i = 0; i < users.length; i++)
         result.push(users[i].toJSON());

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

      req.err = err;

      next();
   });
};

/**
* This function gets a specifid User currently in the database.
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

      req.err = errors;

      next();

      return;
   }

   var id = req.params.id;
   var user = req.user;

   /** Get requested user */
   User.findById(id).then(function(requestedUser) {
      if (!requestedUser) {
         // Requested user was not found in the database
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'The requested route was not found.';

         next();

         return;
      }
      /** Get the committee of the requested user */
      requestedUser.getCommittee().then(function(requestedCommittee) {
         // Requested committee was not found in the database
         if (!requestedCommittee) {
            res.status(404).json({
               status:'failed',
               message: 'The requested route was not found.'
            });

            req.err = 'The requested route was not found.';

            next();

            return;
         }

         /** Get the head of this committee */
         requestedCommittee.head(function(head, error) {
            if (error) {
               // Couldn't get the head for the requested committee
               res.status(500).json({
                  status: 'failed',
                  message: 'Internal server error'
               });

               req.err = error;

               next();

               return;
            }

            var result;
            if (head.id == user.id || user.isUpperBoard() || user.id == id || user.isAdmin()) {
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

         req.err = err;

         next();
      });


   }).catch(function(err) {
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

   /*Validate and sanitizing type Input*/
   req.checkBody('type', 'Type is required').notEmpty();
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
   req.sanitizeBody('gender').escape();
   req.sanitizeBody('gender').trim();

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
   }

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

      req.err = errors;

      next();

      return;
   }

   User.findOrCreate({ where : { email : req.body.email, password : req.body.password, type : req.body.type, first_name : req.body.first_name, last_name : req.body.last_name, birthdate : req.body.birthdate, gender : req.body.gender, IEEE_membership_ID : req.body.IEEE_membership_ID } }).then(function(user, created) {
      res.status(200).json({
         status: 'succeeded'
      });

      next();
   }).catch(function(err) {
      /* failed to save the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = err;

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
   /*Validate and sanitizing email Input*/
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'Enter a Valid Email address').isEmail();
   req.sanitizeBody('email').escape();
   req.sanitizeBody('email').trim();
   req.sanitizeBody('email').normalizeEmail({ lowercase: true });

   /*Validate and sanitizing Password Input*/
   req.checkBody('password', 'Password is required').notEmpty();

   /*Validate and sanitizing type Input*/
   req.checkBody('type', 'Type is required').notEmpty();
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
   req.sanitizeBody('gender').escape();
   req.sanitizeBody('gender').trim();

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
   }

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

      req.err = errors;

      next();

      return;
   }

   User.update({ type : req.body.type, first_name : req.body.first_name, last_name : req.body.last_name, birthdate : req.body.birthdate, gender : req.body.gender, email : req.body.email, password : req.body.password, IEEE_membership_ID : req.body.IEEE_membership_ID }, { where : { id : req.user.id } }).then(function(affected) {
      if (affected[0] == 1) {
         res.status(200).json({
            status: 'succeeded',
            message: 'user updated'
         });
      }
      else {
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });
      }

      next();
   }).catch(function(err) {
      /* failed to update the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = err;

      next();
   });
};
