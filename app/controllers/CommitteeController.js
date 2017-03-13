/**
* @module Committee Controller
* @description The controller that is responsible of handling committee's requests
*/

var Committee = require('../models/Committee').Committee;
var format    = require('../script').errorFormat;
var sequelize = require('../../config/database/Database').Seq;
var User       = require('../models/User').User;
var Media      = require('../models/Media').Media;


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
         errors: errors
      });

      req.err = 'CommitteeController.js, Line: 73\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id;

   Committee.findById(id).then(function(committee) {
      if(!committee){
         /* The Committee was not found */
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'CommitteeController.js, Line: 90\nThe requested committee was not found in the database.';
         next();
      }
      else {

      	var mediaInclude =
      	{   model : Media     ,
      		as :"profilePicture"       , 
      		where : {type :"Image"},
      		attributes :['url','type'],
      		required : false
      	};

        User.findAll(
      {  
         where     :{committee_id :committee.id},
         attributes:['id', 'first_name', 'last_name'],
         include   :[mediaInclude]      
      }).then(function(users){
        var members = [];
      	for (var i = users.length - 1; i >= 0; i--) {
      		var curr = users[i];
      		members.push ({ id         :curr.id,
      			            first_name :curr.first_name,
      			            last_name  :curr.last_name,
      			            profile_picture :curr.profilePicture
      		              });
      	    }
      	    var results = {
      				id: committee.id,
      				name: committee.name,
      				description: committee.description,
              created_at:committee.created_at,
              updated_at:committee.updated_at,
      				members :members
      			}
         res.status(200).json({
            status:'succeeded',
            committee:results
         });

         next();

       }).catch(function(err){
           /* failed to retrieve the members from the database */
      		res.status(500).json({
      			status:'failed',
      			message: err.message
      		});

      		req.err = 'CommitteeController.js, Line: 111\nCouldn\'t retreive the the committee members from the database.\n' + String(err);

      		next();
       });

     }
    
   }).catch(function(err){
      /* failed to retrieve the committee from the database */
      res.status(500).json({
         status:'failed',
         message: err.message
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
   req.checkBody('name', 'validity').isString();
   req.sanitizeBody('name').escape();
   req.sanitizeBody('name').trim();

   /*Validate and sanitizing committee description Input*/
   req.checkBody('description', 'required').notEmpty();
   req.checkBody('description', 'validity').isString();
   req.sanitizeBody('description').escape();
   req.sanitizeBody('description').trim();

   /*Validate and sanitizing committee head Input*/
   if(req.body.head_id){
   req.checkBody('head_id', 'validity').isInt();
    }

    /*Validate and sanitizing committee members Input*/
   if(!req.body.members){
        req.body.members = [];
   }else{
        req.checkBody('members','validity').isIntArray();
  }

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         errors: errors
      });

      req.err = 'CommitteeController.js, Line: 143\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }
     var users = req.body.members ;
     users.push(req.body.head_id);

     User.findAll({where : {id :{in :users}}}).then(function(members){
     	for (var i = members.length - 1; i >= 0; i--) {
     		if(members[i].type == 'Upper Board'){
               res.status(400).json({
               status: 'failed',
               error: 'Can not add an Upper Board User to a Committee'  
               });
               req.err = 'CommitteeController.js, Line: 143\nSome validation errors occured.\n' + JSON.stringify(errors);
               next();
               return; 
     		}else{
               if(members[i].type == 'High Board'){
                  if(members[i].id != req.body.head_id){
                   res.status(400).json({
                     status: 'failed',
                     error: 'Can not add an High Board User as a normal member in the Committe'  
                   });
                   req.err = 'CommitteeController.js, Line: 143\nSome validation errors occured.\n' + JSON.stringify(errors);
                   next();
                   return;
                  }
               }
        }
     	}
     }).then(function(){
           /* extracting data from the request body */
           var name = req.body.name;
           var desc = req.body.description ;

           /* building user instance to be inserted */
           var committeeInstance = Committee.build({
           	name: name,
           	description: desc
           });

           sequelize.transaction(function (t) {

        // chain all your queries here. make sure you return them.
           return committeeInstance.save(
        	{transaction: t}).then(function (committee) {
        		return committee.setUsers(
        			users, {transaction: t}); 
        	});

         }).then(function (result) {
      			    // Transaction has been committed
      			    // result is whatever the result of the promise chain returned to the transaction callback
      			    res.status(200).json({
      			    	status:'succeeded',
      			    	message: 'committee successfully added'
      			    });
      			    next();
      	 }).catch(function (err) {
      				  // Transaction has been rolled back
      			    // err is whatever rejected the promise chain returned to the transaction callback
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
      			    		message: 'Internal Server Error'
      			    	});

      			    	req.err = 'CommitteeController.js, Line: 196\nCouldn\'t save the committee in the database.\n' + String(err);
      			    }
      			    next();
      			});

     }).catch(function(err){
       	res.status(400).json({
       		status: 'failed',
       		error: 'Internal Server Error' 
       	});
       	req.err = 'CommitteeController.js, Line: 143\ncan not find members in the database.\n' + JSON.stringify(errors);
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
      req.checkBody('name', 'validity').isString();
      req.sanitizeBody('name').escape();
      req.sanitizeBody('name').trim();
      updatedAttributes.name = req.body.name;
   }

   /*Validate the committee description Input*/
   if (req.body.description) {
      req.checkBody('description', 'validity').isString();
      req.sanitizeBody('description').escape();
      req.sanitizeBody('description').trim();
      updatedAttributes.description = req.body.description;
   }

    /*Validate and sanitizing committee members Input*/
   if(!req.body.members){
        req.body.members = [];
   }else{
        req.checkBody('members','validity').isIntArray();
  }

  /*Validate and sanitizing committee head Input*/
   if(req.body.head_id){
   req.checkBody('head_id', 'validity').isInt();
    }


   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         errors: errors
      });

      req.err = 'CommitteeController.js, Line: 240\nThe committee violated some database constraints.\n' + JSON.stringify(errors);

      next();

      return;
   }

     var users = req.body.members ;
     users.push(req.body.head_id);

   Committee.findById(req.params.id).then(function(committee){
       if(!committee){
       	    res.status(404).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'UserController.js, Line: 296\nCouldn\'t find the committee in the database.\n' ;
         next();
         return ;
      }


      User.findAll({where : {id :{in :users}}}).then(function(members){
      for (var i = members.length - 1; i >= 0; i--) {
        if(members[i].type == 'Upper Board'){
               res.status(400).json({
               status: 'failed',
               error: 'Can not add an Upper Board User to a Committee'  
               });
               req.err = 'CommitteeController.js, Line: 143\nSome validation errors occured.\n' + JSON.stringify(errors);
               next();
               return; 
        }else{
               if(members[i].type == 'High Board'){
                  if(members[i].id != req.body.head_id){
                   res.status(400).json({
                     status: 'failed',
                     error: 'Can not add an High Board User as a normal member in the Committe'  
                   });
                   req.err = 'CommitteeController.js, Line: 143\nSome validation errors occured.\n' + JSON.stringify(errors);
                   next();
                   return;
                  }
               }
        }
      }
      sequelize.transaction(function (t) {

      	return committee.setUsers(users,
      		{transaction:t}).then(function(){
      			return committee.update(updatedAttributes,
      				{transaction:t})
      		});

     }).then(function(results){
     	 /* the committee is updated successfully in the database */
         res.status(200).json({
            status:'succeeded',
            message: 'committee successfully updated'
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
            errors: errors
         });

         req.err = 'CommitteeController.js, Line: 287\nThe committee violated some database constraints.\n' + JSON.stringify(errors);
      }
      else {
         /* failed to update the committee in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal Server Error'
         });

         req.err = 'CommitteeController.js, Line: 296\nCouldn\'t update the committee in the database.\n' + String(err);
      }

      next();
     });
      
    }).catch(function(err){
        res.status(400).json({
          status: 'failed',
          error: 'Internal Server Error' 
        });
        req.err = 'CommitteeController.js, Line: 143\ncan not find members in the database.\n' + JSON.stringify(errors);
        next();
     });
   }).catch(function(err){
    
         res.status(400).json({
                  status:'failed',
                  message: 'The requested committee was not found.'
               });

               req.err = 'CommitteeController.js, Line: 442\nThe requested committee was not found in the database.';
               next();
               return;
            });

    
       
};

/**
* This function deletes a committee from the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.delete = function(req, res, next) {
   /*Validate and sanitizing ID Input*/
   req.checkParams   ('id','required').notEmpty();
   req.sanitizeParams('id').escape();
   req.sanitizeParams('id').trim();
   req.checkParams   ('id','validity').isInt();

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         errors: errors
      });

      req.err = 'CommitteeController.js, Line: 662\nSome validation errors occurred.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id ;
   Committee.destroy({where : {id :id }}).then(function(destroyedRowsNum){

      if(destroyedRowsNum == 0){
       res.status(400).json({
         status: 'failed',
         errors: 'Committee not Found'
      });

       req.err = 'CommitteeController.js, Line: 678\nThe specified Committee is not found in the database.\n' + JSON.stringify(errors);

       next();
    }else{

         res.status(200).json({
         status: 'succeeded',
         message: 'The Committee has been deleted.'
      });
        next();
   

   }
     
   }).catch(function(err){
 /* failed to delete the committee from the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'CommitteeController.js, Line: 697\nCan not delete the Committee from the database.\n' + String(err);

      next();
   });


};
