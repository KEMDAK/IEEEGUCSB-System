/**
 * @module Task Controller
 * @description The controller that is responsible of handling task's requests
 */

var Task = require('../models/Task').Task;
var format = require('../script').errorFormat;

/**
 * This function deletes a task currently in the database.
 * @param  {HTTP}   req  The request object
 * @param  {HTTP}   res  The response object
 * @param  {Function} next Callback function that is called once done with handling the request
 */
module.exports.delete = (req, res, next)
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
