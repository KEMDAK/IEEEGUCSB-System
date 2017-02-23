/**
* @module Meeting Controller
* @description The controller that is responsible of handling meetings' requests
*/

var Meeting = require('../models/Meeting').Meeting;
var User    = require('../models/User').User;
var Media   = require('../models/Media').Media;
var format  = require('../script').errorFormat;

/**
* This function gets a specifid meeting currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.show = function(req, res, next) {
   /*Validagte and sanitizing ID Input*/
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

      req.err = 'MeetingController.js, Line: 31\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id;

   /* Get requested meeting */
   Meeting.findById(id).then(function(meeting) {
      if (!meeting) {
         /* Requested meeting was not found in the database */
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'MeetingController.js, Line: 49\nThe requested meeting was not found in the database.';

         next();

         return;
      }

      /* building the returned meeting */
      var result = {
         id: meeting.id,
         start_date: meeting.start_date,
         end_date: meeting.end_date,
         goals: JSON.parse(meeting.goal),
         description: meeting.description,
         location: meeting.location,
         duration: meeting.duration,
         evaluation: meeting.evaluation,
         created_at: meeting.created_at,
         updated_at: meeting.updated_at,
         attendees: []
      };

      /* Get the attendees of the requested meeting */
      meeting.getAttendees({ include: [{ model: Media, as: 'profile_picture' }] }).then(function(attendees) {
         for (var i = 0; i < attendees.length; i++) {
            var cur = {
               id: attendees[i].id,
               first_name: attendees[i].first_name,
               last_name: attendees[i].last_name,
               profile_picture: {
                  type: attendees[i].profile_picture.type,
                  url: attendees[i].profile_picture.url
               }
            };

            /* adding the rating and the review of the attendee */
            if(req.user.isAdmin() || req.user.isUpperBoard() || req.user.isHighBoard()){
               cur.rating = attendees[i].rating;
               cur.review = attendees[i].review;
            }

            result.attendees.push(cur);
         }

         meeting.getSupervisor({ include: [{ model: Media, as: 'profile_picture' }] }).then(function(supervisor) {
            result.supervisor = {
               id: supervisor.id,
               first_name: supervisor.first_name,
               last_name: supervisor.last_name,
               profile_picture: {
                  type: supervisor.profile_picture.type,
                  url: supervisor.profile_picture.url
               }
            };

            res.status(200).json({
               status:'succeeded',
               meeting: result
            });

            next();
         });
      });
   }).catch(function(err) {
      /* failed to get the meeting or its details from the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'MeetingController.js, Line: 111\nfailed to get the meeting or its details from the database.\n' + String(err);

      next();
   });  
};

/**
* This function stores the provided meeting in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next) {
   /*Validate and sanitizing start date Input*/
   req.checkBody('start_date', 'required').notEmpty();
   req.checkBody('start_date', 'validity').isDate();
   req.sanitizeBody('start_date').escape();
   req.sanitizeBody('start_date').trim();

   /*Validate and sanitizing end date Input*/
   req.checkBody('end_date', 'required').notEmpty();
   req.checkBody('end_date', 'validity').isDate();
   req.sanitizeBody('end_date').escape();
   req.sanitizeBody('end_date').trim();

   /*Validate and sanitizing goals Input*/
   req.checkBody('goals', 'required').notEmpty();
   req.checkBody('goals', 'validity').isJSON();
   req.sanitizeBody('goals').escape();
   req.sanitizeBody('goals').trim();

   /*Validate and sanitizing location Input*/
   if(req.body.location){
      req.sanitizeBody('location').escape();
      req.sanitizeBody('location').trim();
   }

   /*Validate and sanitizing description Input*/
   if(req.body.description){
      req.sanitizeBody('description').escape();
      req.sanitizeBody('description').trim();
   }

   var errors = req.validationErrors();
   
   if(!req.user.isAdmin() && !req.user.isUpperBoard && req.body.attendees){
      /*validating the user list*/
      User.findAll({ where: { id: { in: req.body.attendees } } }).then(function(attendees) {
         for (var i = 0; i < attendees.length; i++) {
            if(req.user.committee_id != attendees[i].committee_id){
               if(!errors){
                  errors = [];
               }

               errors.push({
                  param: 'attendees',
                  value: req.body.attendees,
                  type: 'validity'
               });
               break;
            }
         }

         rest();
      });
   }
   else{
      rest();
   }

   var rest = function(){
      /*sending validation errors*/
      errors = format(errors);
      if (errors) {
         /* input validation failed */
         res.status(400).json({
            status: 'failed',
            error: errors
         });

         req.err = 'MeetingController.js, Line: 194\nSome validation errors occured.\n' + JSON.stringify(errors);

         next();

         return;
      }

      var attributes = {
         start_date: req.body.start_date,
         end_date: req.body.end_date,
         goals: JSON.parse(req.body.goals),
         location: req.body.location,
         description: req.body.description
      };

      Meeting.create(attributes).then(function(meeting) {
         meeting.serAttendees(req.body.attendees, { rating: null, review: null }).then(function(){
            res.status(200).json({
               status: 'succeeded',
               message: 'meeting successfully added'
            });

            next();
         });
      }).catch(function(err) {
         /* failed to save the meeting in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'MeetingController.js, Line: 225\nCouldn\'t save the meeting in the database.\n' + String(err);

         next();
      });
   };
};

/**
* This function updates a meeting's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next) {
   var attributes = {};

   /*Validagte and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'validity').isInt();

   /*Validate and sanitizing start date Input*/
   if(req.body.start_date){  
      req.checkBody('start_date', 'validity').isDate();
      req.sanitizeBody('start_date').escape();
      req.sanitizeBody('start_date').trim();
      attributes.start_date = req.body.start_date;
   }

   /*Validate and sanitizing end date Input*/
   if(req.body.end_date){  
      req.checkBody('end_date', 'validity').isDate();
      req.sanitizeBody('end_date').escape();
      req.sanitizeBody('end_date').trim();
      attributes.end_date = req.body.end_date;
   }

   /*Validate and sanitizing goals Input*/
   if(req.body.goals){  
      req.checkBody('goals', 'validity').isJSON();
      req.sanitizeBody('goals').escape();
      req.sanitizeBody('goals').trim();
      attributes.goals = req.body.goals;
   }

   /*Validate and sanitizing location Input*/
   if(req.body.location){
      req.sanitizeBody('location').escape();
      req.sanitizeBody('location').trim();
      attributes.location = req.body.location;
   }

   /*Validate and sanitizing description Input*/
   if(req.body.description){
      req.sanitizeBody('description').escape();
      req.sanitizeBody('description').trim();
      attributes.description = req.body.description;
   }

   var errors = req.validationErrors();
   
   if(!req.user.isAdmin() && !req.user.isUpperBoard && req.body.attendees){
      /*validating the user list*/
      User.findAll({ where: { id: { in: req.body.attendees } } }).then(function(attendees) {
         for (var i = 0; i < attendees.length; i++) {
            if(req.user.committee_id != attendees[i].committee_id){
               if(!errors){
                  errors = [];
               }

               errors.push({
                  param: 'attendees',
                  value: req.body.attendees,
                  type: 'validity'
               });
               break;
            }
         }

         rest();
      });
   }
   else{
      rest();
   }

   var rest = function(){
      /*sending validation errors*/
      errors = format(errors);
      if (errors) {
         /* input validation failed */
         res.status(400).json({
            status: 'failed',
            error: errors
         });

         req.err = 'MeetingController.js, Line: 329\nSome validation errors occured.\n' + JSON.stringify(errors);

         next();

         return;
      }

      Meeting.update(attributes, { where : { supervisor : req.user.id } }).then(function(affected) {
         if (affected[0] == 1) {
            meeting.serAttendees(req.body.attendees, { rating: null, review: null }).then(function(){
               res.status(200).json({
                  status: 'succeeded',
                  message: 'meeting successfully updated'
               });

               next();
            });
         }
         else {
            res.status(404).json({
               status:'failed',
               message: 'The requested route was not found.'
            });

            req.err = 'MeetingController.js, Line: 353\nThe requested meeting was not found in the database.';
            
            next();
         }

      }).catch(function(err) {
         /* failed to update the meeting in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'MeetingController.js, Line: 365\nCouldn\'t update the meeting in the database.\n' + String(err);

         next();
      });
   };
};
