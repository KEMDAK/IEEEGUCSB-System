/**
 * @module Task Controller
 * @description The controller that is responsible of handling task's requests
 */

var Task = require('../models/Task').Task;
var Media = require('../models/Media').Media;
var format = require('../script').errorFormat;

/**
* This function gets a specifid task currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.show = function(req, res, next)
{
   /*Validate and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'validity').isInt();

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors)
   {
      /* input validation failed */
      res.status(400)
         .json(
         {
            status: 'failed',
            errors: errors
         });

      req.err = 'TaskController.js, Line: 29\nSome validation errors occurred.\n' + JSON.stringify(errors);
      next();
      return;
   }


   /* Get requested task */
   Task.findById(req.params.id)
       .then(function(task)
       {
         if (!task)
         {
            /* Requested task was not found in the database */
            res.status(404)
               .json(
               {
                  status:'failed',
                  message: 'The requested route was not found.'
               });

            req.err = 'TaskController.js, Line: 43\nThe requested task was not found in the database.';
            next();
            return;
         }

         /* building the returned task */
         var result =
         {
            id: task.id,
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            priority: task.priority,
            status: task.duration,
            evaluation: task.evaluation,
            created_at: task.created_at,
            updated_at: task.updated_at,
         };

         task.getSupervisor(
             {
                attributes: ['id', 'first_name', 'last_name'],
                include: [{ model: Media, as: 'profilePicture' }]
             })
             .then(function(supervisor)
             {
                result.supervisor = supervisor;
                result.supervisor.profile_picture = supervisor.profilePicture;

                task.getAssignedUsers(
                   {
                      attributes: ['id', 'first_name', 'last_name'],
                      include: [{ model: Media, as: 'profilePicture' }]
                   })
                   .then(function(assigned_users)
                   {
                      assigned_users.forEach(function(assigned_user)
                        {
                           assigned_user.profile_picture = assigned_user.profilePicture;
                        });

                      result.assignedTo = assigned_users;

                      // Authorization
                     var flag = false;
                     if(result.supervisor.id === req.user.id
                      || req.user.isUpperBoard() || req.user.isAdmin())
                        flag = true;
                     else
                        for (var i = 0; i < result.assignedTo.length; i++)
                           if(result.assignedTo[i].id === req.user.id)
                           {
                              flag = true;
                              break;
                           }

                     // not autharized
                     if(!flag)
                     {
                        res.status(404)
                          .json(
                          {
                             status:'failed',
                             message: 'The requested route was not found.'
                          });

                       req.err = 'TaskController.js, Line: 43\nThe requested task was not found in the database.';
                       next();
                       return;
                     }

                     task.getComments(
                         {
                            order: [['created_at', 'ASC']],
                            include: [{ model: User, as: 'User' }]
                         })
                         .then(function(comments)
                         {
                            result.comments = comments;
                         })
                         .catch(function()
                         {
                            /* failed to get the comments from the database */
                            res.status(500).json({
                               status:'failed',
                               message: 'Internal server error'
                            });

                            req.err = 'TaskController.js, Line: 111\nfailed to get the assigned user from the database.\n' + String(err);
                            next();
                         });

                     res.status(200).json(
                        {
                           status:'succeeded',
                           task: result
                        });

                     next();
                   })
                   .catch(function()
                   {
                      /* failed to get the assigned users from the database */
                      res.status(500).json({
                         status:'failed',
                         message: 'Internal server error'
                      });

                      req.err = 'TaskController.js, Line: 111\nfailed to get the supervisor from the database.\n' + String(err);
                      next();
                   });
               })
               .catch(function(err)
               {
                  /* failed to get the task from the database */
                  res.status(500).json({
                     status:'failed',
                     message: 'Internal server error'
                  });
                  req.err = 'TaskController.js, Line: 111\nfailed to get the supervisor from the database.\n' + String(err);
                  next();
               });
             })
             .catch(function(err)
             {
                /* failed to get the supervisor from the database */
                res.status(500).json({
                   status:'failed',
                   message: 'Internal server error'
                });

                req.err = 'TaskController.js, Line: 111\nfailed to get the task from the database.\n' + String(err);
                next();
             });
};

/**
 * This function deletes a task currently in the database.
 * @param  {HTTP}   req  The request object
 * @param  {HTTP}   res  The response object
 * @param  {Function} next Callback function that is called once done with handling the request
 */
module.exports.delete = function(req, res, next)
{
   /*Validate and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'validity').isInt();

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors)
   {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         errors: errors
      });
      req.err = 'TaskController.js, Line: 32\nSome validation errors occured.\n' + JSON.stringify(errors);
      next();
      return;
   }

   Task.destroy({ where: { id: req.params.id, supervisor: req.user.id } }).then(function(affectedRows) {
      if(affectedRows == 0){
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });
         req.err = 'TaskController.js, Line: 46\nThe requested task was not found in the database or the user has no authority to delete it.';
      } else {
         res.status(200).json({
            status: 'succeeded',
            message: 'The task has been deleted.'
         });
      }
      next();
   }).catch(function(err)
      {
         /* failed to find the task in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });
         req.err = 'TaskController.js, Line: 79\nCouldn\'t retreive the task from the database.\n' + String(err);
         next();
      });
};
