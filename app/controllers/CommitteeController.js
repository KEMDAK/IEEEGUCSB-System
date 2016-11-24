/**
* @module Committee Controller
* @description The controller that is responsible of handling communittees's requests
*/

/* Models */

var User = require('../models/User').User;
var Committee = require('../models/Committee').Committee;

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

            req.err = err;

            next();
        });
}

/**
* This function gets a specifid committee currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
* @return {Array}  result a specified committee currently in the database
*/
module.exports.show = function(req, res, next){

	  var id = req.params.id;

	   Committee.findById(id).then(function(committee){

	   	 if(!committee){
                res.status(400).json({
                status:'failed'
                });
            }
         else{ 
                 
                res.status(200).json({
                status:'succeeded',
                committee: {
                name: committee.name,
                description: committee.description
                } 
            });

            next();
            }
        }).catch(function(err){
            /* failed to retrieve the committe from the database */
            res.status(500).json({
                status:'failed',
                message: 'Internal server error'
            });

            req.err = err;

            next();
        });
}


/**
* This function stores the provided committe in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next){


     var id = req.user.id;

    // var id  = req.body.uu ;
   

      User.findById(id).then(function(user) {
       
    if(!user.isUpperBoard()){
     throw "The user is not from UpperBoard";    
     }

          /*Validate and sanitizing committee Name Input*/    
    req.checkBody('name', 'Name is required').notEmpty();
    req.sanitizeBody('name').escape();
    req.sanitizeBody('name').trim();

    req.checkBody('description', 'Description is required').notEmpty();
    req.sanitizeBody('description').escape();
    req.sanitizeBody('description').trim();

    var errors = req.validationErrors();
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

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
            status:'succeeded'
        });

        next();
    }).catch(function(err){
        /* failed to save the client in the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });

        req.err = err;

        next();
    });
      next();


}).catch(function(err){
     console.log(err);
    res.status(404).json({
        status:'failed',
        message: 'User not found.'
    });

    log.save(req, res);
});
	


}


/**
* This function updates a committees's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next){

     var id = req.user.id;

   

  User.findById(id).then(function(user) {
       
    if(!user.isUpperBoard()){
     throw "The user is not from UpperBoard";    
 }

       /*Validate and sanitizing committee description Input*/
    req.checkBody('description', 'Description is required').notEmpty();
    req.sanitizeBody('description').escape();
    req.sanitizeBody('description').trim();

    var errors = req.validationErrors();
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

        next();

        return;
    }

    /* extracting data from the request params and body */
    var desc = req.body.description;

    /* Constructing the updated object */
    var updatedAttributes = {
        description: desc
    };

    Committee.update(updatedAttributes, { where: {  id: req.params.id } }).then(function(arr) {
        var affectedRows = arr[0];

        if(affectedRows === 0){
            /* committee was not found */
            res.status(400).json({
                status:'failed'
            });
        }
        else{
            /* the committee is updated successfully in the database */
            res.status(200).json({
                status:'succeeded'
            });
        }

        next();
    }).catch(function(err){
        /* failed to update the committee in the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });

        req.err = err;

        next();
    });

 next();


}).catch(function(err){
     console.log(err);
    res.status(404).json({
        status:'failed',
        message: 'User not found.'
    });

    log.save(req, res);
});


}


