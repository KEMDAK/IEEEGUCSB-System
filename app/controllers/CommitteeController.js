/**
* @module Committee Controller
* @description The controller that is responsible of handling committee's requests
*/

var Committee = require('../models/Committee').Committee;
var format = require('../script').errorFormat;

/**
* This function gets a list of all committees currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
* @return {Array}  result The committees currently in the database
*/
module.exports.index = function(req, res, next){
   Committee.findAll().then(function(committees){

      var result = [];

      for(var i = 0; i < committees.length; i++){
         var committee = committees[i];

         result.push({
            id: committee.id,
            name: committee.name,
            description: committee.description
         });
      }

      res.status(200).json({
         status:'succeeded',
         committees: result
      });

      next();

   }).catch(function(err){
      /* failed to retrieve the committes from the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'CommitteeController.js, Line: 45\nCouldn\'t retreive the committees from the database.\n' + String(err);

      next();
   });
};

/**
* This function gets a specifid committee currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.show = function(req, res, next){
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

      req.err = 'CommitteeController.js, Line: 73\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id;

   Committee.findById(id).then(function(committee) {
      if(!committee){
         /* The Committee was not found */
         res.status(400).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'CommitteeController.js, Line: 90\nThe requested committee was not found in the database.';
      }
      else {
         res.status(200).json({
            status:'succeeded',
            committee: {
               id: committee.id,
               name: committee.name,
               description: committee.description
            }
         });
      }

      next();
   }).catch(function(err){
      /* failed to retrieve the committee from the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'CommitteeController.js, Line: 111\nCouldn\'t retreive the the committee from the database.\n' + String(err);

      next();
   });
};

/**
* This function stores the provided committe in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next){
   /*Validate and sanitizing committee name Input*/
   req.checkBody('name', 'required').notEmpty();
   req.sanitizeBody('name').escape();
   req.sanitizeBody('name').trim();

   /*Validate and sanitizing committee description Input*/
   req.checkBody('description', 'required').notEmpty();
   req.sanitizeBody('description').escape();
   req.sanitizeBody('description').trim();

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'CommitteeController.js, Line: 143\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   /* extracting data from the request body */
   var name = req.body.name;
   var desc = req.body.description ;

   /* building user instance to be inserted */
   var committeeInstance = Committee.build({
      name: name,
      description: desc
   });

   committeeInstance.save().then(function(client){
      /* the committee is saved successfully in the database */
      res.status(200).json({
         status:'succeeded',
         message: 'committee successfully added'
      });

      next();
   }).catch(function(err){
      if (err.message === 'Validation error') {
         /* The committee violated database constraints */
         var errors = [];
         for (var i = 0; i < err.errors.length; i++) {
            var curError = err.errors[i];

            errors.push({
               param: curError.path,
               value: curError.value,
               type: curError.type
            });
         }

         res.status(400).json({
            status:'failed',
            error: errors
         });

         req.err = 'CommitteeController.js, Line: 187\nThe committee violated some database constraints.\n' + JSON.stringify(errors);
      }
      else {
         /* failed to save the committee in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'CommitteeController.js, Line: 196\nCouldn\'t save the committee in the database.\n' + String(err);
      }

      next();
   });
};

/**
* This function updates a committees's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next){
   /*Validate and sanitizing ID Input*/
   req.checkParams('id', 'required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams('id', 'validity').isInt();

   var updatedAttributes = {};
   /*Validate the committee name Input*/
   if (req.body.name) {
      req.sanitizeBody('name').escape();
      req.sanitizeBody('name').trim();
      updatedAttributes.name = req.body.name;
   }

   /*Validate the committee description Input*/
   if (req.body.description) {
      req.sanitizeBody('description').escape();
      req.sanitizeBody('description').trim();
      updatedAttributes.description = req.body.description;
   }

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         error: errors
      });

      req.err = 'CommitteeController.js, Line: 240\nThe committee violated some database constraints.\n' + JSON.stringify(errors);

      next();

      return;
   }

   Committee.update(updatedAttributes, { where: {  id: req.params.id } }).then(function(arr) {
      var affectedRows = arr[0];

      if(affectedRows === 0){
         /* committee was not found */
         res.status(400).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'CommitteeController.js, Line: 257\nThe requested committee was not found in the database.';
      }
      else{
         /* the committee is updated successfully in the database */
         res.status(200).json({
            status:'succeeded',
            message: 'committee successfully updated'
         });
      }

      next();
   }).catch(function(err){
      /* failed to update the committee in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 275\nCouldn\'t update the committee in the database.\n' + String(err);

      next();
   });
};
