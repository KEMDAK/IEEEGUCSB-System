/**
* @module Committee Controller
* @description The controller that is responsible of handling communittees's requests
*/

/* Models */
var User      = require('../models/User').User;
var Committee = require('../models/Committee').Committee;

/**
* This function gets a list of all committees currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
* @return {Array}  result The committees currently in the database
*/
module.exports.index = function(req, res, next){
    /*Validate and sanitizing User Agent*/
    req.checkHeaders('user_agent', 'User Agent is required').notEmpty();
    req.checkHeaders('user_agent', 'Enter a valid User Agent').isIn(['Web', 'Android', 'IOS']);
    req.sanitizeHeaders('user_agent').escape();

    var errors = req.validationErrors();
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

        req.err = errors;

        next();

        return;
    }

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

        req.err = err;

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
    req.checkParams('id', 'ID is required').notEmpty();
    req.sanitizeParams('id').escape();
    req.sanitizeParams('id').trim();
    req.checkParams('id', 'Enter a valid ID').isInt();

    /*Validate and sanitizing User Agent*/
    req.checkHeaders('user_agent', 'User Agent is required').notEmpty();
    req.checkHeaders('user_agent', 'Enter a valid User Agent').isIn(['Web', 'Android', 'IOS']);
    req.sanitizeHeaders('user_agent').escape();

    var errors = req.validationErrors();
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            error: errors
        });

        req.err = errors;

        next();

        return;
    }

    var id = req.params.id;

    Committee.findById(id).then(function(committee){

        if(!committee){
            /* The Committee was not found */
            res.status(400).json({
                status:'failed'
            });
        }
        else{ 

            res.status(200).json({
                status:'succeeded',
                committee: {
                    id: committee.id,
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
};

/**
* This function stores the provided committe in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next){
    /*Validate and sanitizing committee name Input*/
    req.checkBody('name', 'name is required').notEmpty();
    req.sanitizeBody('name').escape();
    req.sanitizeBody('name').trim();
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
};

/**
* This function updates a committees's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next){
    /*Validate and sanitizing ID Input*/
    req.checkParams('id', 'ID is required').notEmpty();
    req.sanitizeParams('id').escape();
    req.sanitizeParams('id').trim();
    req.checkParams('id', 'Enter a valid ID').isInt();
    /*Validate and sanitizing committee name Input*/
    req.checkBody('name', 'name is required').notEmpty();
    req.sanitizeBody('name').escape();
    req.sanitizeBody('name').trim();
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
    var name = req.body.name;
    var desc = req.body.description;

    /* Constructing the updated object */
    var updatedAttributes = {
        name: name,
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
};
