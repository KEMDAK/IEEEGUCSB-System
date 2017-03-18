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

                if(supervisor.profilePicture)
                  result.supervisor.profile_picture =
                  {
                    type: supervisor.profilePicture.type,
                    url: supervisor.profilePicture.url
                  };

                task.getAssignedUsers(
                   {
                      include: [{ model: Media, as: 'profilePicture' }]
                   })
                   .then(function(assigned_users)
                   {
                     var i = 0;
                     assigned_users.forEach(function(assigned_user)
                       {
                          result.assigned_to[i++] =
                          {
                            id: assigned_user.id,
                            first_name: assigned_user.first_name,
                            last_name: assigned_user.last_name
                          };

                          if(assigned_user.profilePicture)
                            result.assigned_to[i].profile_picture =
                            {
                              type: assigned_user.profilePicture.type,
                              url: assigned_user.profilePicture.url
                            };

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
                             message: 'Access denied.',
                             // some test required this
                             errors: null
                          });

                       req.err = 'TaskController.js, Line: 43\nthe requesting user has no authority to show the task.';
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
                          for(var i = 0; i < comments.length; i++)
                          {
                            result.comments[i] =
                            {
                              id: comments[i].id,
                              content: comments[i].content,
                              user:
                              {
                                id: comments[i].User.id,
                                first_name: comments[i].User.first_name,
                                last_name: comments[i].User.last_name
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
                            console.log(req.err);
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
                      console.log(req.err);
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
                  console.log(req.err);
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
                console.log(req.err);
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

   /*Validate and sanitizing end date Input*/
   req.checkBody('priority', 'required').notEmpty();
   req.sanitizeBody('priority').escape();
   req.sanitizeBody('priority').trim();

   var p = req.body.priority;
   var errors = req.validationErrors();

   if(p!=1 && p!= 3 && p!= 5 && p!= 8)
   {
     if(!errors)
      errors = [];

     errors.push({
        param: 'priority',
        value: req.body.priority,
        msg: 'validity'
     });
   }

   /*Validate and sanitizing end date Input*/
   if(req.body.evaluation)
   {
      req.sanitizeBody('evaluation').escape();
      req.sanitizeBody('evaluation').trim();
   }
   else
   {
      req.body.evaluation = null;
   }

   var assignedUsers = null;

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
         res.status(200).json(
         {
            status: 'succeeded',
            message: 'task successfully added'
         });

         next();
         return;
      }).catch(function(err)
      {
         /* failed to save the task in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'TaskController.js, Line: 301\nCouldn\'t save the task in the database.\n' + String(err);
         console.log(err);
         next();
         return;
      });
   };

   if(req.body.assignedUsers)
   {
      /*validating the user list*/
      User.findAll({ where: { id: { in: req.body.assignedUsers } } }).then(function(assignedUsers) {
         req.checkBody('assignedUsers', 'validity').isArray(assignedUsers.length);
         errors = req.validationErrors();

         for (var i = 0; i < assignedUsers.length; i++)
         {
           console.log(req.user.committee_id +" "+ assignedUsers[i].committee_id);
           if((req.user.isHighBoard() && req.user.committee_id != assignedUsers[i].committee_id)
              || req.user.id == assignedUsers[i].id
              || (req.user.isHighBoard() && (assignedUsers[i].isAdmin() || assignedUsers[i].isUpperBoard() || assignedUsers[i].isHighBoard())))
           {
             if(!errors)
              errors = [];

             errors.push({
                param: 'assignedUsers',
                value: req.body.assignedUsers,
                msg: 'validity'
             });
             break;
            }
         }
         assigned_users = assignedUsers;
      }).catch(function(err) {
         /* failed to validate the assignedUsers in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'TaskController.js, Line: 338\nfailed to validate the assignedUsers in the database.\n' + String(err);
         next();
         return;
      });
   }
   rest();
};

/**
* This function updates a task's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next) {
   /*Validate and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'validity').isInt();

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

   /*Validate and sanitizing end date Input*/
   req.checkBody('priority', 'required').notEmpty();
   req.sanitizeBody('priority').escape();
   req.sanitizeBody('priority').trim();

   var p = req.body.priority;
   var errors = req.validationErrors();

   if(p!=1 && p!= 3 && p!= 5 && p!= 8)
   {
     if(!errors)
      errors = [];
     errors.push({
        param: 'priority',
        value: req.body.priority,
        msg: 'validity'
     });
   }

   /*Validate and sanitizing end date Input*/
   if(req.body.evaluation)
   {
      req.sanitizeBody('evaluation').escape();
      req.sanitizeBody('evaluation').trim();
   }
   else
   {
      req.body.evaluation = null;
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

         req.err = 'TaskController.js, Line: 414\nSome validation errors occurred.\n' + JSON.stringify(errors);
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
         else if(task.supervisor != req.user.id) {
            /* The requesting user has no authority to update the task */
            res.status(403).json({
               status:'failed',
               message: 'Access denied'
            });

            req.err = 'TaskController.js, Line: 449\nThe requesting user has no authority to update the task.';
            next();
         }
         else {

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

            task.update(attributes).then(function(task) {
               if(req.body.assignedUsers){
                  task.setAssignedUsers(req.body.assignedUsers).then(function(){
                     res.status(200).json({
                        status: 'succeeded',
                        message: 'task successfully updated'
                     });

                     next();
                  }).catch(function(err) {
                     /* failed to update the task assignedUsers in the database */
                     res.status(500).json({
                        status:'failed',
                        message: 'Internal server error'
                     });

                     req.err = 'TaskController.js, Line: 470\nfailed to update the task assignedUsers in the database.\n' + String(err);
                     next();
                  });
               } else {
                  res.status(200).json({
                     status: 'succeeded',
                     message: 'task successfully updated'
                  });

                  next();
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

   var errors = req.validationErrors();
   if(req.body.assignedUsers){
      /*validating the user list*/
      User.findAll({ where: { id: { in: req.body.assignedUsers } } }).then(function(assignedUsers) {
         req.checkBody('assignedUsers', 'validity').isArray(assignedUsers.length);
         errors = req.validationErrors();
         for (var i = 0; i < assignedUsers.length; i++) {
           if((req.user.isHighBoard() && req.user.committee_id != assignedUsers[i].committee_id)
              || req.user.id == assignedUsers[i].id
              || (req.user.isHighBoard() && (assignedUsers[i].isAdmin() || assignedUsers[i].isUpperBoard() || assignedUsers[i].isHighBoard())))
           {
             if(!errors)
              errors = [];

             errors.push({
                param: 'assignedUsers',
                value: req.body.assignedUsers,
                msg: 'validity'
             });
             break;
            }
         }

         rest();
      }).catch(function(err) {
         /* failed to validate the assignedUsers in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'TaskController.js, Line: 536\nfailed to validate the assignedUsers in the database.\n' + String(err);
         next();
      });
   }
   else{
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

     // task.getSupervisor() is not working
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
