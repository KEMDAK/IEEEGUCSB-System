var User = require('../models/User').user;

module.exports.committee = function(req, res, next){


  var id = req.user.id;

  User.findById(id).then(function(user) {

    if(!user.isUpperBoard()){
     throw "The user is not from UpperBoard";    
 }

 next();


}).catch(function(err){

    res.status(404).json({
        status:'failed',
        message: 'The requested route was not found.'
    });

    log.save(req, res);
});

}
