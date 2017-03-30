/**
 * @module Task Controller
 * @description The controller that is responsible of handling task's requests
 */

var Task = require('../models/Task').Task;
var Media = require('../models/Media').Media;
var User = require('../models/User').User;
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
            status: task.status,
            evaluation: task.evaluation,
            created_at: task.created_at,
            updated_at: task.updated_at,
            supervisor: null,
            assigned_to: [],
            comments: []
         };

         task.getSupervisor(
             {
                include: [{ model: Media, as: 'profilePicture' }]
             })
             .then(function(supervisor)
             {
                result.supervisor =
                {
                  id: supervisor.id,
                  first_name: supervisor.first_name,
                  last_name: supervisor.last_name
                };

                var pfp = null;
                if(supervisor.profilePicture)
                  pfp =
                  {
                    type: supervisor.profilePicture.type,
                    url: 'http://' + process.env.DOMAIN + ':' + process.env.PORT + supervisor.profilePicture.url
                  };
                result.supervisor.profile_picture = pfp;

                task.getAssignedUsers(
                   {
                      include: [{ model: Media, as: 'profilePicture' }]
                   })
                   .then(function(assigned_users)
                   {
                     var i = 0;
                     assigned_users.forEach(function(assigned_user)
                       {
                          result.assigned_to[i] =
                          {
                            id: assigned_user.id,
                            first_name: assigned_user.first_name,
                            last_name: assigned_user.last_name
                          };

                          var pfp = null;
                          if(assigned_user.profilePicture)
                            pfp =
                            {
                              type: assigned_user.profilePicture.type,
                              url: 'http://' + process.env.DOMAIN + ':' + process.env.PORT + assigned_user.profilePicture.url
                            };

                          result.assigned_to[i].profile_picture = pfp;
                          i++;
                       });

                      // Authorization, adding assigned_users to result
                     var flag = false;
                     if(result.supervisor.id === req.user.id || req.user.isUpperBoard() || req.user.isAdmin())
                        flag = true;
                     else
                     {
                       assigned_users.forEach(function(assigned_user)
                         {
                           // user is assignee
                            if(assigned_user.id === req.user.id)
                              flag = true;
                            else
                             if(assigned_user.committee_id === req.user.committee_id)
                               flag = true;
                         });
                     }

                     // not autharized
                     if(!flag)
                     {
                        res.status(403)
                          .json(
                          {
                             status:'failed',
                             message: 'Access denied.'
                          });

                       req.err = 'TaskController.js, Line: 43\nthe requesting user has no authority to show the task.';
                       next();
                       return;
                     }

                     task.getComments(
                         {
                            order: [['created_at', 'ASC']],
                            include: [{ model: User, as: 'User', include: [{ model: Media, as: 'profilePicture' }] }]
                         })
                         .then(function(comments)
                         {
                          for(var i = 0; i < comments.length; i++)
                          {
                            var pfp = null;
                            if(comments[i].User.profilePicture)
                              pfp =
                              {
                                type: comments[i].User.profilePicture.type,
                                url: comments[i].User.profilePicture.url
                              };
                            result.comments[i] =
                            {
                              id: comments[i].id,
                              content: comments[i].content,
                              created_at: comments[i].created_at,
                              updated_at: comments[i].updated_at,
                              user:
                              {
                                id: comments[i].User.id,
                                first_name: comments[i].User.first_name,
                                last_name: comments[i].User.last_name,
                                profile_picture: pfp
                              }
                            }
                          }

                          res.status(200).json(
                             {
                                status:'succeeded',
                                task: result
                             });

                          next();
                          return;
                         })
                         .catch(function(err)
                         {
                            /* failed to get the comments from the database */
                            res.status(500).json({
                               status:'failed',
                               message: 'Internal server error'
                            });

                            req.err = 'TaskController.js, Line: 111\nfailed to get the comments from the database.\n' + String(err);
                            next();
                            return;
                         });
                   })
                   .catch(function(err)
                   {
                      /* failed to get the assigned users from the database */
                      res.status(500).json({
                         status:'failed',
                         message: 'Internal server error'
                      });

                      req.err = 'TaskController.js, Line: 111\nfailed to get the assigned users from the database.\n' + String(err);
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

                req.err = 'TaskController.js, Line: 111\nfailed to get the task from the database.\n' + String(err);
                next();
             });
};

/**
* This function stores the provided task in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next) {
   /*Validate and sanitizing title Input*/
   req.checkBody('title', 'required').notEmpty();
   req.checkBody('title', 'validity').isString();
   req.sanitizeBody('title').escape();
   req.sanitizeBody('title').trim();

   /*Validate and sanitizing description Input*/
   if(req.body.description)
   {
     req.checkBody('description', 'validity').isString();
     req.sanitizeBody('description').escape();
     req.sanitizeBody('description').trim();
   }
   else
   {
     req.body.description = null;
   }

   /*Validate and sanitizing deadline Input*/
   req.checkBody('deadline', 'required').notEmpty();
   req.checkBody('deadline', 'validity').isDate();
   req.sanitizeBody('deadline').escape();
   req.sanitizeBody('deadline').trim();

   if(req.body.assigned_to)
     req.checkBody('assigned_to', 'validity').isArray();

   /*Validate and sanitizing evaluation Input*/
   if(req.body.evaluation)
   {
      req.sanitizeBody('evaluation').escape();
      req.sanitizeBody('evaluation').trim();
      req.checkBody('evaluation', 'validity').isIn([1, 2, 3, 4, 5]);
   }
   else
      req.body.evaluation = null;

   /*Validate and sanitizing priority Input*/
   req.checkBody('priority', 'required').notEmpty();
   req.sanitizeBody('priority').escape();
   req.sanitizeBody('priority').trim();
   req.checkBody('priority', 'validity').isIn([1, 3, 5, 8]);

   var errors = req.validationErrors();

   var rest = function()
   {
      /*sending validation errors*/
      errors = format(errors);
      if (errors)
      {
         /* input validation failed */
         res.status(400).json({
            status: 'failed',
            errors: errors
         });

         req.err = 'TaskController.js, Line: 238\nSome validation errors occurred.\n' + JSON.stringify(errors);
         next();
         return;
      }

      var attributes =
      {
         title: req.body.title,
         description: req.body.description,
         deadline: req.body.deadline,
         priority: req.body.priority,
         status: 'New',
         evaluation: req.body.evaluation,
         supervisor: req.user.id
      };

      Task.create(attributes).then(function(task)
       {
         task.setAssignedUsers(req.body.assigned_to).then(function(){
            res.status(200).json({
               status: 'succeeded',
               message: 'task successfully created'
            });

            next();
            return;
         }).catch(function(err) {
            /* failed to update the task assigned_to in the database */
            res.status(500).json({
               status:'failed',
               message: 'Internal server error'
            });

            task.destroy();
            req.err = 'TaskController.js, Line: 470\nfailed to update the task assigned_to in the database.\n' + String(err);
            next();
            return;
         });
      }).catch(function(err)
      {
         /* failed to save the task in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'TaskController.js, Line: 301\nCouldn\'t save the task in the database.\n' + String(err);
         next();
         return;
      });
   };

   if(req.body.assigned_to)
   {
      /*validating the user list*/
      if(!errors)
      {
        User.findAll({ where: { id: { in: req.body.assigned_to } } }).then(function(assigned_to) {
           if(req.body.assigned_to.length != assigned_to.length)
           {
             if(!errors)
               errors = [];
             errors.push({
               param: 'assigned_to',
               value: req.body.assigned_to,
               msg: 'validity'
             });
           }

           if(!errors)
           {
            for (var i = 0; i < assigned_to.length; i++)
            {
              if((req.user.isHighBoard() && req.user.committee_id != assigned_to[i].committee_id)
              || (req.user.isHighBoard() && (assigned_to[i].isAdmin() || assigned_to[i].isUpperBoard() || (assigned_to[i].isHighBoard() && assigned_to[i].id != req.user.id))))
              {
                if(!errors)
                  errors = [];
                errors.push({
                  param: 'assigned_to',
                  value: req.body.assigned_to,
                  msg: 'validity'
                });
                break;
              }
            }
          }
          rest();
          return;
        }).catch(function(err) {
           /* failed to validate the assigned_to in the database */
           res.status(500).json({
              status:'failed',
              message: 'Internal server error'
           });

           req.err = 'TaskController.js, Line: 338\nfailed to validate the assigned_to in the database.\n' + String(err);
           next();
           return;
        });
      } else
      {
        rest();
      }
   } else
   {
     req.body.assigned_to = [];
     rest();
   }
};

/**
* This function updates a task's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next)
{
   /*Validate and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'validity').isInt();
   var attributes = {};

   /*Validate and sanitizing title Input*/
   if(req.body.title)
   {
     req.checkBody('title', 'validity').isString();
     req.sanitizeBody('title').escape();
     req.sanitizeBody('title').trim();
     attributes.title = req.body.title;
   }

   /*Validate and sanitizing description Input*/
   if(req.body.description)
   {
     req.checkBody('description', 'validity').isString();
     req.sanitizeBody('description').escape();
     req.sanitizeBody('description').trim();
     attributes.description = req.body.description;
   }

   /*Validate and sanitizing deadline Input*/
   if(req.body.deadline)
   {
     req.checkBody('deadline', 'validity').isDate();
     req.sanitizeBody('deadline').escape();
     req.sanitizeBody('deadline').trim();
     attributes.deadline = req.body.deadline;
   }

   /*Validate and sanitizing evaluation Input*/
   if(req.body.evaluation)
   {
     req.sanitizeBody('evaluation').escape();
     req.sanitizeBody('evaluation').trim();
     req.checkBody('evaluation', 'validity').isIn([1, 2, 3, 4, 5]);
     attributes.evaluation = req.body.evaluation;
   }

   if(req.body.assigned_to)
     req.checkBody('assigned_to', 'validity').isArray();

   /*Validate and sanitizing status Input*/
   if(req.body.status)
   {
     req.sanitizeBody('status').escape();
     req.sanitizeBody('status').trim();
     req.checkBody('status', 'validity').isIn(['New', 'In Progress', 'Ready', 'Done']);
     attributes.status = req.body.status;
   }

   /*Validate and sanitizing priority Input*/
   if(req.body.priority)
   {
     req.sanitizeBody('priority').escape();
     req.sanitizeBody('priority').trim();
     req.checkBody('priority', 'validity').isIn([1, 3, 5, 8]);
     attributes.priority = req.body.priority;
   }

   var errors = req.validationErrors();

   var rest = function()
   {
      /*sending validation errors*/
      errors = format(errors);
      if (errors)
      {
         /* input validation failed */
         res.status(400).json({
            status: 'failed',
            errors: errors
         });

         req.err = 'TaskController.js, Line: 238\nSome validation errors occurred.\n' + JSON.stringify(errors);
         next();
         return;
      }

      Task.findById(req.params.id).then(function(task) {
         if(!task) {
            res.status(404).json({
               status:'failed',
               message: 'The requested route was not found.'
            });

            req.err = 'TaskController.js, Line: 438\nThe requested task was not found in the database or the user has no authority to edit it.';
            next();
         }
         else
         {
          if(task.supervisor != req.user.id)
          {
            /* The requesting user has no authority to update the task */
            res.status(403).json({
               status:'failed',
               message: 'Access denied'
            });

            req.err = 'TaskController.js, Line: 449\nThe requesting user has no authority to update the task.';
            next();
          }
          else
          {
            task.update(attributes).then(function(task) {

              if(req.body.assigned_to)
              {
                task.setAssignedUsers(req.body.assigned_to).then(function()
                {
                   res.status(200).json({
                      status: 'succeeded',
                      message: 'task successfully updated'
                   });

                   next();
                   return;
                }).catch(function(err)
                {
                   /* failed to update the task assigned_to in the database */
                   res.status(500).json({
                      status:'failed',
                      message: 'Internal server error'
                   });

                   req.err = 'TaskController.js, Line: 470\nfailed to update the task assigned_to in the database.\n' + String(err);
                   next();
                   return;
                });
            }
            else
            {
              res.status(200).json({
                 status: 'succeeded',
                 message: 'task successfully updated'
              });

              next();
              return;
            }
            }).catch(function(err) {
               /* failed to update the task in the database */
               res.status(500).json({
                  status:'failed',
                  message: 'Internal server error'
               });

               req.err = 'TaskController.js, Line: 489\nCouldn\'t update the task in the database.\n' + String(err);
               next();
            });
         }
       }
      }).catch(function(err) {
         /* failed to find the task in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'TaskController.js, Line: 501\nCouldn\'t find the task in the database.\n' + String(err);
         next();
      });

   };

   if(req.body.assigned_to)
   {
      /*validating the user list*/
      if(!errors)
      {
        User.findAll({ where: { id: { in: req.body.assigned_to } } }).then(function(assigned_to) {
          if(req.body.assigned_to.length != assigned_to.length)
          {
            if(!errors)
              errors = [];
            errors.push({
              param: 'assigned_to',
              value: req.body.assigned_to,
              msg: 'validity'
            });
          }

           if(!errors)
           {
            for (var i = 0; i < assigned_to.length; i++)
            {
              if((req.user.isHighBoard() && req.user.committee_id != assigned_to[i].committee_id)
              || (req.user.isHighBoard() && (assigned_to[i].isAdmin() || assigned_to[i].isUpperBoard() || (assigned_to[i].isHighBoard() && assigned_to[i].id != req.user.id))))
              {
                if(!errors)
                  errors = [];
                errors.push({
                  param: 'assigned_to',
                  value: req.body.assigned_to,
                  msg: 'validity'
                });
                break;
              }
            }
          }
          rest();
          return;
        }).catch(function(err) {
           /* failed to validate the assigned_to in the database */
           res.status(500).json({
              status:'failed',
              message: 'Internal server error'
           });

           req.err = 'TaskController.js, Line: 338\nfailed to validate the assigned_to in the database.\n' + String(err);
           next();
           return;
        });
      } else
      {
        rest();
      }
   } else
   {
     rest();
   }
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

   Task.findById(req.params.id).then(function(task)
   {
     if(!task)
     {
        res.status(404).json({
           status:'failed',
           message: 'The requested route was not found.'
        });

        req.err = 'TaskController.js, Line: 438\nThe requested task was not found in the database or the user has no authority to edit it.';
        next();
        return;
      }

     if(req.user.id != task.supervisor)
     {
       res.status(403).json(
       {
         status:'failed',
         message: 'Access denied.'
       });
       req.err = 'TaskController.js, Line: 46\nThe user has no authority to delete the task.';
       next();
     }
     else
     {
       task.destroy();
       res.status(200).json(
       {
         status: 'succeeded',
         message: 'The task has been deleted.'
       });
     }
     next();
   })
   .catch(function(err)
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
