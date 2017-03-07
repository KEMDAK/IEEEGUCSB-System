/**
* @module Meeting Controller
* @description The controller that is responsible of handling meetings' requests
*/

var Meeting     = require('../models/Meeting').Meeting;
var User        = require('../models/User').User;
var MeetingUser = require('../models/MeetingUser').MeetingUser;
var Media       = require('../models/Media').Media;
var format      = require('../script').errorFormat;

/**
* This function gets a specified meeting currently in the database.
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
         errors: errors
      });

      req.err = 'MeetingController.js, Line: 34\nSome validation errors occurred.\n' + JSON.stringify(errors);

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

         req.err = 'MeetingController.js, Line: 52\nThe requested meeting was not found in the database.';

         next();

         return;
      }

      /* building the returned meeting */
      var result = {
         id: meeting.id,
         start_date: meeting.start_date,
         end_date: meeting.end_date,
         goals: JSON.parse(meeting.goals),
         description: meeting.description,
         location: meeting.location,
         duration: meeting.duration,
         created_at: meeting.created_at,
         updated_at: meeting.updated_at,
         attendees: []
      };

      /* adding the evaluation of the meeting to the result */
      if(req.user.isAdmin() || req.user.isUpperBoard() || req.user.isHighBoard() && req.user.id == meeting.supervisor){
         result.evaluation = meeting.evaluation;
      }

      /* Get the attendees of the requested meeting */
      meeting.getAttendees({ include: [{ model: Media, as: 'profilePicture' }] }).then(function(attendees) {
         var attendee = false;
         for (var i = 0; i < attendees.length; i++) {
            if(attendees[i].id == req.user.id) {
               attendee = true;
               break;
            }
         }

         if(!(req.user.isAdmin() || req.user.isUpperBoard() || req.user.isHighBoard() && req.user.id == meeting.supervisor || attendee)) {
            /* The requesting user has no authority to show the meeting */
            res.status(403).json({
               status:'failed',
               message: 'Access denied'
            });

            req.err = 'MeetingController.js, Line: 95\nThe requesting user has no authority to show the meeting.';

            next();

            return;
         }

         for (var i = 0; i < attendees.length; i++) {
            var cur = {
               id: attendees[i].id,
               first_name: attendees[i].first_name,
               last_name: attendees[i].last_name,
               profile_picture: null
            };

            if(attendees[i].profilePicture) {
               cur.profile_picture = {
                  type: attendees[i].profilePicture.type,
                  url: attendees[i].profilePicture.url
               };
            }

            /* adding the rating and the review of the attendee */
            if(req.user.isAdmin() || req.user.isUpperBoard() || req.user.isHighBoard() && req.user.id == meeting.supervisor){
               cur.rating = attendees[i].meeting_user.rating ? attendees[i].meeting_user.rating : null;
               cur.review = attendees[i].meeting_user.review ? attendees[i].meeting_user.review : null;
            }

            result.attendees.push(cur);
         }

         meeting.getSupervisor({ include: [{ model: Media, as: 'profilePicture' }] }).then(function(supervisor) {
            result.supervisor = {
               id: supervisor.id,
               first_name: supervisor.first_name,
               last_name: supervisor.last_name,
               profile_picture: null
            };

            if(supervisor.profilePicture) {
               result.supervisor.profile_picture = {
                  type: attendees[i].profilePicture.type,
                  url: attendees[i].profilePicture.url
               };
            }

            res.status(200).json({
               status:'succeeded',
               meeting: result
            });

            next();
         }).catch(function(err) {
            /* failed to get the meeting supervisor from the database */
            res.status(500).json({
               status:'failed',
               message: 'Internal server error'
            });

            req.err = 'MeetingController.js, Line: 154\nfailed to get the meeting supervisor from the database.\n' + String(err);

            next();
         });
      }).catch(function(err) {
         /* failed to get the meeting attendees from the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'MeetingController.js, Line: 165\nfailed to get the meeting attendees from the database.\n' + String(err);

         next();
      });
   }).catch(function(err) {
      /* failed to get the meeting from the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'MeetingController.js, Line: 176\nfailed to get the meeting from the database.\n' + String(err);

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
   if(req.body.goals){  
      req.checkBody('goals', 'validity').isArray();

      for (var i = 0; i < req.body.goals.length; i++) {
         req.checkBody('goals[' + i + ']', 'validity').isString();
      }
   }
   
   /*Validate and sanitizing location Input*/
   if(req.body.location){
      req.checkBody('location', 'validity').isString();
      req.sanitizeBody('location').escape();
      req.sanitizeBody('location').trim();
   } else {
      req.body.location = null;
   }

   /*Validate and sanitizing description Input*/
   if(req.body.description){
      req.checkBody('description', 'validity').isString();
      req.sanitizeBody('description').escape();
      req.sanitizeBody('description').trim();
   } else {
      req.body.description = null;
   }

   var rest = function(){
      /*sending validation errors*/
      errors = format(errors);
      if (errors) {
         /* input validation failed */
         res.status(400).json({
            status: 'failed',
            errors: errors
         });

         req.err = 'MeetingController.js, Line: 238\nSome validation errors occurred.\n' + JSON.stringify(errors);

         next();

         return;
      }
  
      var goals = [];
      if(req.body.goals){  
         for (var i = 0; i < req.body.goals.length; i++) {
            goals.push({
               name: req.body.goals[i],
               isDone: false
            });
         }
      }

      var attributes = {
         start_date: req.body.start_date,
         end_date: req.body.end_date,
         goals: goals,
         location: req.body.location,
         description: req.body.description,
         supervisor: req.user.id
      };

      Meeting.create(attributes).then(function(meeting) {
         if(req.body.attendees){
            meeting.setAttendees(req.body.attendees, { rating: null, review: null }).then(function(){
               res.status(200).json({
                  status: 'succeeded',
                  message: 'meeting successfully added'
               });

               next();
            }).catch(function(err) {
               /* failed to assign the attendees to the meeting in the database */
               res.status(500).json({
                  status:'failed',
                  message: 'Internal server error'
               });

               meeting.destroy();

               req.err = 'MeetingController.js, Line: 282\nfailed to assign the attendees to the meeting in the database.\n' + String(err);

               next();
            });
         } else {
            res.status(200).json({
               status: 'succeeded',
               message: 'meeting successfully added'
            });

            next();
         }
      }).catch(function(err) {
         /* failed to save the meeting in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'MeetingController.js, Line: 301\nCouldn\'t save the meeting in the database.\n' + String(err);

         next();
      });
   };
   
   var errors = req.validationErrors();
   
   if(req.body.attendees){
      /*validating the user list*/
      User.findAll({ where: { id: { in: req.body.attendees } } }).then(function(attendees) {
         req.checkBody('attendees', 'validity').isArray(attendees.length);
         errors = req.validationErrors();

         for (var i = 0; i < attendees.length; i++) {
            if(!req.user.isAdmin() && !req.user.isUpperBoard() && req.user.committee_id != attendees[i].committee_id || req.user.id == attendees[i].id){
               if(!errors){
                  errors = [];
               }

               errors.push({
                  param: 'attendees',
                  value: req.body.attendees,
                  msg: 'validity'
               });
               break;
            }
         }

         rest();
      }).catch(function(err) {
         /* failed to validate the attendees in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'MeetingController.js, Line: 338\nfailed to validate the attendees in the database.\n' + String(err);

         next();
      });
   }
   else{
      rest();
   }
};

/**
* This function updates a meeting's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next) {
   var attributes = {};

   /*Validate and sanitizing ID Input*/
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
      req.checkBody('goals', 'validity').isArray();

      for (var i = 0; i < req.body.goals.length; i++) {
         req.checkBody('goals[' + i + ']', 'validity').isString();
      }
   }

   /*Validate and sanitizing location Input*/
   if(req.body.location){
      req.checkBody('location', 'validity').isString();
      req.sanitizeBody('location').escape();
      req.sanitizeBody('location').trim();
      attributes.location = req.body.location;
   }

   /*Validate and sanitizing description Input*/
   if(req.body.description){
      req.checkBody('description', 'validity').isString();
      req.sanitizeBody('description').escape();
      req.sanitizeBody('description').trim();
      attributes.description = req.body.description;
   }

   var rest = function(){
      /*sending validation errors*/
      errors = format(errors);
      if (errors) {
         /* input validation failed */
         res.status(400).json({
            status: 'failed',
            errors: errors
         });

         req.err = 'MeetingController.js, Line: 414\nSome validation errors occurred.\n' + JSON.stringify(errors);

         next();

         return;
      }

      if(req.body.goals){  
         attributes.goals = [];
         for (var i = 0; i < req.body.goals.length; i++) {
            attributes.goals.push({
               goal: req.body.goals[i],
               isDone: false
            });
         }
      }

      Meeting.findById(req.params.id).then(function(meeting) {
         if(!meeting) {
            res.status(404).json({
               status:'failed',
               message: 'The requested route was not found.'
            });

            req.err = 'MeetingController.js, Line: 438\nThe requested meeting was not found in the database or the user has no authority to edit it.';

            next();
         } 
         else if(meeting.supervisor != req.user.id) {
            /* The requesting user has no authority to update the meeting */
            res.status(403).json({
               status:'failed',
               message: 'Access denied'
            });

            req.err = 'MeetingController.js, Line: 449\nThe requesting user has no authority to update the meeting.';

            next();
         } 
         else {
            meeting.update(attributes).then(function(meeting) {
               if(req.body.attendees){
                  meeting.setAttendees(req.body.attendees, { rating: null, review: null }).then(function(){
                     res.status(200).json({
                        status: 'succeeded',
                        message: 'meeting successfully updated'
                     });

                     next();
                  }).catch(function(err) {
                     /* failed to update the meeting attendees in the database */
                     res.status(500).json({
                        status:'failed',
                        message: 'Internal server error'
                     });

                     req.err = 'MeetingController.js, Line: 470\nfailed to update the meeting attendees in the database.\n' + String(err);

                     next();
                  });
               } else {
                  res.status(200).json({
                     status: 'succeeded',
                     message: 'meeting successfully updated'
                  });

                  next();
               }
            }).catch(function(err) {
               /* failed to update the meeting in the database */
               res.status(500).json({
                  status:'failed',
                  message: 'Internal server error'
               });

               req.err = 'MeetingController.js, Line: 489\nCouldn\'t update the meeting in the database.\n' + String(err);

               next();
            });
         }
      }).catch(function(err) {
         /* failed to find the meeting in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'MeetingController.js, Line: 501\nCouldn\'t find the meeting in the database.\n' + String(err);

         next();
      });
   };
   
   var errors = req.validationErrors();
   if(req.body.attendees){
      /*validating the user list*/
      User.findAll({ where: { id: { in: req.body.attendees } } }).then(function(attendees) {
         req.checkBody('attendees', 'validity').isArray(attendees.length);
         errors = req.validationErrors();
         for (var i = 0; i < attendees.length; i++) {
            if(!req.user.isAdmin() && !req.user.isUpperBoard() && req.user.committee_id != attendees[i].committee_id || req.user.id == attendees[i].id){
               if(!errors){
                  errors = [];
               }

               errors.push({
                  param: 'attendees',
                  value: req.body.attendees,
                  msg: 'validity'
               });
               break;
            }
         }

         rest();
      }).catch(function(err) {
         /* failed to validate the attendees in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'MeetingController.js, Line: 536\nfailed to validate the attendees in the database.\n' + String(err);

         next();
      });
   }
   else{
      rest();
   }
};

/**
* This function deletes a meeting from the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.delete = function(req, res, next) {
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
         errors: errors
      });

      req.err = 'MeetingController.js, Line: 568\nSome validation errors occurred.\n' + JSON.stringify(errors);

      next();

      return;
   }

   Meeting.findById(req.params.id).then(function(meeting) {
      if(!meeting){
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'MeetingController.js, Line: 582\nThe requested meeting was not found in the database or the user has no authority to delete it.';

         next();
      } else if(meeting.supervisor != req.user.id) {
         /* The requesting user has no authority to delete the meeting */
         res.status(403).json({
            status:'failed',
            message: 'Access denied'
         });

         req.err = 'MeetingController.js, Line: 592\nThe requesting user has no authority to delete the meeting.';

         next();
      } else {
         meeting.destroy().then(function() {
            res.status(200).json({
               status: 'succeeded',
               message: 'The Meeting has been deleted.'
            });

            next();
         }).catch(function(err) {
            /* failed to delete the meeting from the database */
            res.status(500).json({
               status:'failed',
               message: 'Internal server error'
            });

            req.err = 'MeetingController.js, Line: 610\nCouldn\'t delete the meeting from the database.\n' + String(err);

            next();
         });
      }
   }).catch(function(err) {
      /* failed to find the meeting in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'MeetingController.js, Line: 622\nCouldn\'t find the meeting in the database.\n' + String(err);

      next();
   });
};

/**
* This function rates a meeting in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.rate = function(req, res, next) {
   /*Validate and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeBody('id').escape();
   req.sanitizeBody('id').trim();
   req.checkParams('id', 'validity').isInt();

   /*validating the meeting evaluation*/
   req.checkBody('evaluation', 'required').notEmpty();
   req.sanitizeBody('evaluation').escape();
   req.sanitizeBody('evaluation').trim();
   req.checkBody('evaluation', 'validity').isInt({ min: 1, max: 5 });


   Meeting.findById(req.params.id).then(function(meeting) {
      if(!meeting) {
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'MeetingController.js, Line: 655\nThe requested meeting was not found in the database or the user has no authority to rate it.';
         
         next();
      } 
      else if(meeting.supervisor != req.user.id) {
         /* The requesting user has no authority to rate the meeting */
         res.status(403).json({
            status:'failed',
            message: 'Access denied'
         });

         req.err = 'MeetingController.js, Line: 666\nThe requesting user has no authority to rate the meeting.';

         next();
      }
      else {
         meeting.goals = JSON.parse(meeting.goals);

         /*validating the goals*/
         req.checkBody('goals', 'required').notEmpty();

         if(req.body.goals){
            req.checkBody('goals', 'validity').isArray(meeting.goals.length);

            for (var i = 0; i < req.body.goals.length && typeof req.body.goals !== "string"; i++) {
               req.checkBody('goals[' + i + ']', 'validity').isBoolean();
            }
         }

         MeetingUser.findAll({ where: { meeting_id: req.params.id } }).then(function(attendees) {
            /*validating the attendees*/
            req.checkBody('attendees', 'required').notEmpty();

            if(req.body.attendees){
               req.checkBody('attendees', 'validity').isArray(attendees.length);

               for (var i = 0; i < req.body.attendees.length && typeof req.body.attendees !== "string"; i++) {
                  req.checkBody('attendees[' + i + '].rating', 'validity').notEmpty().isInt({ min: 1, max: 5 });
                  if(req.body.attendees[i].rating && req.body.attendees[i].rating <= 3)
                     req.checkBody('attendees[' + i + '].review', 'validity').notEmpty();
                  if(req.body.attendees[i].review){
                     req.checkBody('attendees[' + i + '].review', 'validity').isString();
                     req.sanitizeBody('attendees[' + i + '].review').escape().trim();
                  }
               }
            }

            var errors = req.validationErrors();
            errors = format(errors);
            if (errors) {
               /* input validation failed */
               res.status(400).json({
                  status: 'failed',
                  errors: errors
               });

               req.err = 'MeetingController.js, Line: 711\nSome validation errors occurred.\n' + JSON.stringify(errors);

               next();
            } else {
               /*adding the meeting evaluation*/
               meeting.evaluation = req.body.evaluation;

               /*changing goals status*/
               for (var i = 0; i < meeting.goals.length; i++) {
                  meeting.goals[i].isDone = req.body.goals[i];
               }

               for (var i = 0; i < attendees.length; i++) {
                  attendees[i].rating = req.body.attendees[i].rating;
                  attendees[i].review = req.body.attendees[i].review;
                  attendees[i].save();
               }

               meeting.save().then(function() {
                  res.status(200).json({
                     status: 'succeeded',
                     message: 'The Meeting has been rated.'
                  });

                  next();
               }).catch(function(err) {
                  /* failed to save the meeting in the database */
                  res.status(500).json({
                     status:'failed',
                     message: 'Internal server error'
                  });

                  req.err = 'MeetingController.js, Line: 743\nfailed to save the meeting in the database.\n' + String(err);

                  next();
               });
            }
         }).catch(function(err) {
            /* failed to find the meeting attendees in the database */
            res.status(500).json({
               status:'failed',
               message: 'Internal server error'
            });

            req.err = 'MeetingController.js, Line: 755\nfailed to find the meeting attendees in the database.\n' + String(err);

            next();
         });
      }
   }).catch(function(err) {
      /* failed to find the meeting in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'MeetingController.js, Line: 767\nCouldn\'t find the meeting in the database.\n' + String(err);

      next();
   });
};
