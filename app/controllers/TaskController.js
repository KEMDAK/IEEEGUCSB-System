/**
 * @module Task Controller
 * @description The controller that is responsible of handling task's requests
 */

var Task = require('../models/Task').Task;

/**
 * This function deletes a task currently in the database.
 * @param  {HTTP}   req  The request object
 * @param  {HTTP}   res  The response object
 * @param  {Function} next Callback function that is called once done with handling the request
 */
module.exports.destroy = (req, res, next)
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
         error: errors
      });

      req.err = 'TaskController.js, Line: 32\nSome validation errors occured.\n' + JSON.stringify(errors);
      next();
      return;
   }

   var id = req.params.id;
   var user = req.user;
   Task.findById(id).then(function(task)
      {
         if (!task)
         {
            /* Requested task was not found in the database */
            res.status(404).json({
               status:'failed',
               message: 'The requested route was not found.'
            });

            req.err = 'TaskController.js, Line: 49\nThe requested task was not found in the database.';
            next();
            return;
         }

         if(task.getSupervisor.id === user.id)
         {
            task.destroy();
         }
         else
         {
            res.status(403).json(
               {
                  status:'failed',
                  message: 'Access denied'
               });

            req.err = 'TaskController.js, Line: 66\nCannot delete a task without being the supervisor';
            next();
            return;
         }

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
