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

   User.findAll({}).then(function(users) {
      if (!users) {
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'The requested route was not found.'

         next();
      }
      else {
         var result = [];
         for (var i = 0; i < users.length; i++) {
            var currentUser = {
               id : users[i].id,
               type : users[i].type,
               first_name : users[i].first_name,
               last_name : users[i].last_name,
               birthday : users[i].birthday,
               gender : users[i].gender,
               email : users[i].email,
               IEEE_membership_ID : users[i].IEEE_membership_ID,
               created_at : users[i].created_at
            };

            result.push(currentUser);
         }

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

module.exports.show = function(req, res, next) {
   /** validate the id attached with the req with forms */

   var id = req.params.id;
   var user = req.user;

   User.findById(id).then(function(requestedUser) {
      /** Get the committee of the requested user */
      requestedUser.getCommittee().then(function(requestedCommittee) {

         /** Get the committee of logged in user */
         user.getCommittee().then(function(myCommittee) {

            var result;
            /** Return the detailed profile only if the requesting user is an upper board or a high board trying to view
                one of his member's profile or if the rquesting user of trying to view his own profile.
             */
            if ((user.isHighBoard() && myCommittee.id == requestedCommittee.id) || user.isUpperBoard() || user.id == id) {
               // detailed info
            }
            else {
               // basic info
            }

            res.status(200).json({
               status:'succeeded',
               user: result
            });

            next();

         }).catch(function(err) {
            /* failed to find my committee.*/
            res.status(500).json({
               status:'failed',
               message: 'Internal server error'
            });

            req.err = err;

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
