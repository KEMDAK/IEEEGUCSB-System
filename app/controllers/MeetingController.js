/**
* @module Meeting Controller
* @description The controller that is responsible of handling meetings' requests
*/

var Meeting = require('../models/Meeting').Meeting;
var Media   = require('../models/Media').Media;
var format  = require('../script').errorFormat;

/**
* This function gets a specifid meeting currently in the database.
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
         date: meeting.date,
         goals: JSON.parse(meeting.goal),
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
