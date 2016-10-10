var User = require('../models/User').User;

module.exports.committee = function(req, res, next){


     var id = req.user.id;

    // var id  = req.body.uu ;
   

  User.findById(id).then(function(user) {
       
    if(!user.isUpperBoard()){
     throw "The user is not from UpperBoard";    
 }

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
