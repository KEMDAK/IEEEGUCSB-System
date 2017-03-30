/**
* @module User Controller
* @description The controller that is responsible of handling user's requests
*/

var User       = require('../models/User').User;
var format     = require('../script').errorFormat;
var Media      = require('../models/Media').Media;
var Committee  = require('../models/Committee').Committee;
var Task       = require('../models/Task').Task;
var Honor      = require('../models/Honor').Honor ;
var Meeting    = require('../models/Meeting').Meeting;
var jwt        = require('jsonwebtoken');
var path       = require('path');
var nodemailer = require('nodemailer');
var fse        = require('fs-extra'); 



/**
* This function gets a list of all users currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.index = function(req, res, next) {

   User.findAll().then(function(users) {
      if (!users) {
         res.status(404).json({
            status:'failed',
            message: 'The requested route was not found.'
         });

         req.err = 'UserController.js, Line: 23\nThe users were not found.';

         next();
      }
      else {
         var result = [];

         var addUsers = function(i, callback) {
            if (i == users.length) {
               callback(null);
               return;
            }

            users[i].getCommittee().then(function(committee) {
               var curUser = {
                  id: users[i].id,
                  first_name: users[i].first_name,
                  last_name: users[i].last_name,
               };

               if (committee)
                  curUser.committee = { id: committee.id, name: committee.name };
               
               return curUser ;

            }).then(function(curUser){ 
             users[i].getProfilePicture({where:{type:'Image'}}).then(function(media){
               var image = media;

               if(image){
                  curUser.profile_picture = { url : image.url,type : 'Image' }; 
               }
               result.push(curUser);
               addUsers(i+1, callback);
                 }).catch(function(err){
                    /* failed to retreive the media of the current user */
                    callback(err);
                 });
              }).catch(function(err) {
               /* failed to retreive the committee of the current user */
               callback(err);
               return;
            });
           };

           addUsers(0, function(err) {
            if (err) {
               res.status(500).json({
                  status:'failed',
                  message: 'Internal server error'
               });

               req.err = 'UserController.js, Line: 62\nCouldn\'t retreive the users from the database.\n' + String(err);

               next();
              
               return;
            }

            res.status(200).json({
               status:'succeeded',
               users: result
            });

            next();
         });
        }
     }).catch(function(err) {
      /* failed to find the users in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 84\nCouldn\'t retreive the users from the database.\n' + String(err);

      next();
   });
  };

/**
* This function gets a specifid user currently in the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.show = function(req, res, next) {
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

      req.err = 'UserController.js, Line: 112\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id;
   var user = req.user;

 
   var basic    =[];
   var detailed =[];
   var mine     =[];

   var committeeInclude = 
         {model      : Committee,
         as         :"Committee",
         attributes :['id','name']
         };

   var mediaInclude =
        {model : Media     ,
        as :"profilePicture"       , 
        where : {type :"Image"},
        attributes :['url','type'],
        required : false
        };
   var honorsInclude =
        {model : Honor     ,
        as :'Honors'      ,
        attributes :['id','title'],
        through:{
        attributes:[]
         }
        };
   var tasksInclude = 
        {model   : Task,
        as      :"Tasks",
        attributes :{exclude:['description','deleted_at','evaluation','supervisor']},
        through:{
        attributes:[]
         }
        };
   var meetingsInclude=
        {model   : Meeting,
        as      :"Meetings",
        attributes :['id','start_date','end_date','location','created_at','updated_at'],
        through:{
        attributes:[] 
         }
        };

   basic.push(
            committeeInclude,
            mediaInclude,
            honorsInclude);

   detailed.push(
            committeeInclude,
            mediaInclude,
            honorsInclude,
            tasksInclude,
            meetingsInclude);

   mine.push(
            committeeInclude,
            mediaInclude,
            honorsInclude,
            tasksInclude,
            meetingsInclude);

   var excludeBasic = ['phone_number','birthdate'];

   User.findById(id).then(function(requestedUser) {
      var include ;
      var exclude ;
      var mineFlag = false ;
      var detailedFlag = false ;

      if ( user.id == id ) {
         include = mine ;
         mineFlag = true ;
      }else{
         if(user.isUpperBoard() || user.isAdmin() || ( user.isHighBoard() && (requestedUser.committee_id==user.committee_id))){
            include = detailed ;
            detailedFlag= true ;
         }else{  
            include = basic ; 
            exclude = excludeBasic;
         }
      }

      User.findAll(
      {  
         where     :{id :id},
         attributes:{exclude :exclude},
         include   :include      
      }).then(function(results){
         var finalResult = results[0].toJSON(detailedFlag,mineFlag);
         res.status(200).json({
            status:'succeeded',
            user:finalResult
         });

         next();

      }).catch(function(err) {
         /* failed to find the user's joined tables.*/
         res.status(500).json({
            status:'failed',
            message: 'Internal Server Error'
         });

         req.err = 'UserController.js, Line: 204\nCouldn\'t retreive the user\'s joined tables.\n' + String(err);

         next();
      });
   }).catch(function(err) {
      /* failed to find the user in the database */
      res.status(500).json({
         status:'failed',
         message: err.message
      });

      req.err = 'UserController.js, Line: 217\nCouldn\'t retreive the user from the database.\n' + String(err);

      next();
   });

};

/**
* This function stores the provided user in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next) {

   // /*Validate and sanitizing email Input*/
   req.checkBody('email', 'required').notEmpty();
   req.checkBody('email', 'validity').isEmail();
   req.sanitizeBody('email').escape();
   req.sanitizeBody('email').trim();
   req.sanitizeBody('email').normalizeEmail({ lowercase: true });

   /*Validate and sanitizing type Input*/
   req.checkBody('type', 'required').notEmpty();
   req.checkBody('type', 'validity').isIn(['Upper Board', 'High Board', 'Member']);
   req.sanitizeBody('type').escape();
   req.sanitizeBody('type').trim();

   /*Validate and sanitizing first name Input*/
   req.checkBody('first_name', 'required').notEmpty();
   req.checkBody('first_name', 'validity').isString();
   req.sanitizeBody('first_name').escape();
   req.sanitizeBody('first_name').trim();

   /*Validate and sanitizing last name Input*/
   req.checkBody('last_name', 'required').notEmpty();
   req.checkBody('last_name', 'validity').isString();
   req.sanitizeBody('last_name').escape();
   req.sanitizeBody('last_name').trim();

   /*Validate and sanitizing birthdate Input*/
   req.checkBody('birthdate', 'required').notEmpty();
   req.checkBody('birthdate', 'validity').isString().isBirthdate();
   req.sanitizeBody('birthdate').escape();
   req.sanitizeBody('birthdate').trim();

   /*Validate and sanitizing phone number Input*/
   req.checkBody('phone_number', 'required').notEmpty();
   req.sanitizeBody('phone_number').escape();
   req.sanitizeBody('phone_number').trim();
   req.checkBody('phone_number', 'validity').isPhoneNumber();

   /*Validate and sanitizing gender Input*/
   req.checkBody('gender', 'required').notEmpty();
   req.checkBody('gender', 'validity').isIn(['Male', 'Female']);
   req.sanitizeBody('gender').escape();
   req.sanitizeBody('gender').trim();

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
   }
   else{
      req.body.IEEE_membership_ID = null;
   }

   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         errors: errors
      });

      req.err = 'UserController.js, Line: 292\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

    var defaultURL ;
   if(req.body.gender == 'Male'){
      defaultURL = '/general/male.jpg';
   }else
   {
      defaultURL = '/general/female.jpg';
   }
   
  

   var pass = require('../script').generatePassword(20);

   var obj = {
      email : req.body.email,
      type : req.body.type,
      first_name : req.body.first_name,
      last_name : req.body.last_name,
      birthdate : req.body.birthdate,
      phone_number: req.body.phone_number,
      gender : req.body.gender,
      password :pass,
      IEEE_membership_ID : req.body.IEEE_membership_ID,
      settings: {
         public: {
            background: "The background of the profile"
         },
         private: {
            notifications: {
               email: {
                  comment: "boolean sent email on comments",
                  lastSent: "timestamp",
                  meetingDay: "boolean sent email on meeting day",
                  taskDeadline: "boolean sent a reminder email before the task deadline",
                  taskAssignment: "boolean sent email on task assignment",
                  meetingAssignment: "boolean sent email on meetings"
               }
            }
         }
      },
      profilePicture:[{
         type : 'Image',
         url  : defaultURL
      }]
   };

   User.create(obj,{include: [{model: Media,as:'profilePicture'}]}).then(function(user) {
          

            var transporter = nodemailer.createTransport('smtps://' + process.env.EMAIL + ':' + process.env.PASSWORD + '@' + process.env.MAIL_SERVER);
            var EmailTemplate = require('email-templates').EmailTemplate;

            var templateDir = path.join(__dirname, '../../', 'public', 'emails', 'welcoming');
            var mail = new EmailTemplate(templateDir);
            var variables = {
                domain: process.env.DOMAIN,
                port: process.env.PORT,
                password: pass
            };

            mail.render(variables, function (err, result) {
                if(err){
                    /* failed to render the email */
                    res.status(500).json({
                        status:'failed',
                        message: 'Internal server error'
                    });

                    req.err = 'AuthController.js, 321\nFailed to render the email.\n' + err;

                    next();

                    return;
                }

                /* setting up email options */
                var mailOptions = {
                    from: process.env.FROM , // sender address
                    to: user.email, // list of receivers
                    subject:'IEEE GUC', // Subject line
                    text: result.text, // plaintext body
                    html: result.html // html body
                };

                /* Sending the reset email */
                transporter.sendMail(mailOptions);


            });

          
            var dirPath = path.resolve( '../IEEEGUCSB-System/public/images/'+user.id);
            fse.ensureDir(dirPath, function(err) { 
               if(err){
               res.status(400).json({
                  status:'failed',
                  error: 'Internal Server Error' 
               });
               req.err = 'UserController.js, Line: 441\n can not make user directory.\n' + JSON.stringify(err);
               next();
             }
            });



      res.status(200).json({
         status: 'succeeded',
         message: 'user successfully added'
      });

      next();
   }).catch(function(err) {
      if (err.message === 'Validation error') {
         /* The user violated database constraints */
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

         req.err = 'UserController.js, Line: 354\nThe user violated some database constraints.\n' + JSON.stringify(errors);
      }
      else {
         /* failed to save the user in the database */
         res.status(500).json({
            status:'failed',
            message: 'Internal server error'
         });

         req.err = 'UserController.js, Line: 363\nCouldn\'t save the user in the database.\n' + String(err);
      }

      next();
   });
};

/**
* This function updates a user's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.upload = function(req, res, next) {
         var id  =  req.user.id ;
         var newExt ;
         var newURL ;
      if(req.file){
          newExt = path.extname(req.file.filename);
          newURL = path.resolve('/'+id,req.file.filename);
       }else{
        var defaultURL ;
        if(req.user.gender == 'Male'){
          defaultURL = '/general/male.jpg';
        }else
        {
          defaultURL = '/general/female.jpg';  
        }
        newExt = '.jpg';
        newURL = path.resolve(defaultURL);
      }

      Media.findOne({where :{user_id :id,type:'Image'}}).then(function(profilePicture){
         
         if(profilePicture){
         var oldExt = path.extname(profilePicture.url);
          
         if(oldExt != newExt || (!req.file && (defaultURL != profilePicture.url))){           
             var deletePath = path.resolve( '../IEEEGUCSB-System/public/images'+profilePicture.url);
             fse.remove(deletePath,function(err){
             });
         }
       }
        
          profilePicture.update({url:newURL},
            {where :{user_id :id,type:'Image'}}).then(function(Upicture){
                res.status(200).json({
                  status: 'succeeded',
                  message: 'user successfully updated'
               });
                next();
              }).catch(function(err){
                 /* failed to update the user in the database */
                  res.status(500).json({
                     status:'failed',
                     message: 'Internal server error'
                  });

                  req.err = 'UserController.js, Line: 453\nCouldn\'t update the user in the database.\n' + String(err);

                  next(); 
              }); 
        });
    
    
};
/**
* This function updates a user's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.update = function(req, res, next) {
   // /*Validate Old Password Input*/
   req.checkBody('old_password', 'required').notEmpty();

   var obj = {};
   /*Validate New Password Input*/
   if (req.body.new_password) {
      req.assert('new_password', 'validity').len(6, 20);
      obj.password = req.body.new_password;
   }

   /*Sanitizing IEEE membership ID Input*/
   if (req.body.IEEE_membership_ID) {
      req.checkBody('IEEE_membership_ID', 'validity').isString();
      req.sanitizeBody('IEEE_membership_ID').escape();
      req.sanitizeBody('IEEE_membership_ID').trim();
      obj.IEEE_membership_ID = req.body.IEEE_membership_ID;
   }

   /*Sanitizing Phone Number Input*/
   if (req.body.phone_number) {
      req.sanitizeBody('phone_number').escape();
      req.sanitizeBody('phone_number').trim();
      req.checkBody('phone_number', 'validity').isPhoneNumber();
      obj.phone_number = req.body.phone_number;
   }

   
   var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         errors: errors
      });

      req.err = 'UserController.js, Line: 412\nSome validation errors occured.\n' + JSON.stringify(errors);

      next();

      return;
   }

   if (!req.user.validPassword(req.body.old_password)) {
      res.status(403).json({
         status: 'failed',
         message: 'The provided credentials are not correct'
      });

      req.err = 'UserController.js, Line: 425\nThe old password doesn\'t match the password in the database.';

      next();

      return;
   }



      var id  =  req.user.id ;


           User.update(obj, { where : { id : req.user.id } }).then(function(affected) {
            if (affected[0] == 1) {
               res.status(200).json({
                  status: 'succeeded',
                  message: 'user successfully updated'
               });
            }
            else {
               res.status(404).json({
                  status:'failed',
                  message: 'The requested route was not found.'
               });

               req.err = 'UserController.js, Line: 442\nThe requested user was not found in the database.\n'+ String(err);
            }

            next();
         }).catch(function(err) {
            /* failed to update the user in the database */
            res.status(500).json({
               status:'failed',
               message: 'Internal server error'
            });

            req.err = 'UserController.js, Line: 453\nCouldn\'t update the user in the database.\n' + String(err);

            next();
         });
    
 };

/**
* This function deletes a user from the database
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

      req.err = 'UserController.js, Line: 662\nSome validation errors occurred.\n' + JSON.stringify(errors);

      next();

      return;
   }

   var id = req.params.id ;
   User.findById(id).then(function(user){
      if(!user ){
       res.status(400).json({
         status: 'failed',
         message: 'The request route was not Found'
      });

       req.err = 'UserController.js, Line: 678\nThe specified User is not found in the database.\n' + String(err);

       next();
    }else{
	        if(user.type != 'Admin' && (user.type != 'Upper Board' || req.user.type =='Admin')){
	         user.destroy().then(function(){
	           var deletePath = path.resolve( '../IEEEGUCSB-System/public/images/'+id);
	              fse.remove(deletePath,function(err){
	                  delete req.user ;
	                  delete req.identity; 
	                 res.status(200).json({
	                   status:  'succeeded',
	                   message: 'The User has been deleted.'
	                 });
	                 next();
	              });

	         }).catch(function(err){
		          /* failed to delete the user from the database */
		          res.status(500).json({
		           status:'failed',
		           message: 'Internal server error'
		          });

		          req.err = 'UserController.js, Line: 697\nCan not delete the User from the database.\n' + String(err);

		          next();
		         });
	       
		    }else{
		       res.status(403).json({
		          status:'failed',
		          message: 'Access Denied'
		       });

		       req.err = 'UserController.js, Line: 662\ncan not delete an admin or (upper board if req.user is upperboard)\n' + String(err);

		       next();
		       return ;
		    }
     
        }
   }).catch(function(err){
      /* failed to find the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 697\nCan not find the User in the database.\n' + String(err);

      next();
   });


};


/**
* This function updates the specific user's information in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.updateAuth = function(req, res, next) {
   var obj ={};
// /*Validate and sanitizing email Input*/
  if(req.body.email){
   req.checkBody('email', 'validity').isEmail();
   req.sanitizeBody('email').escape();
   req.sanitizeBody('email').trim();
   req.sanitizeBody('email').normalizeEmail({ lowercase: true });
   obj.email = req.body.email ;
   }

   /*Validate and sanitizing type Input*/
   if(req.body.type){
   req.checkBody('type', 'required').notEmpty();
   req.checkBody('type', 'validity').isIn(['Upper Board', 'High Board', 'Member']);
   req.sanitizeBody('type').escape();
   req.sanitizeBody('type').trim();
   obj.type = req.body.type ;
   }

   /*Validate and sanitizing ID Input*/
   if(req.body.committee_id){
   req.sanitizeBody('committee_id').escape();
   req.sanitizeBody('committee_id').trim();
   req.checkBody('committee_id', 'validity').isInt();
   obj.committee_id = req.body.committee_id ;
   }

    var errors = req.validationErrors();
   errors = format(errors);
   if (errors) {
      /* input validation failed */
      res.status(400).json({
         status: 'failed',
         errors: errors
      });

      req.err = 'UserController.js, Line: 662\nSome validation errors occurred.\n' + JSON.stringify(errors);

      next();

      return;
   }
   
    var id = req.params.id ;
   User.findById(id).then(function(user){
      if(!user ){
       res.status(404).json({
         status: 'failed',
         message: 'The requested route was not found.'
      });

       req.err = 'UserController.js, Line: 678\nThe specified User is not found in the database.\n'+String(err);

       next();
    }else{

          if(user.type != 'Admin' && (user.type != 'Upper Board' || req.user.type =='Admin')){
             user.update(obj).then(function(){
                  res.status(200).json({
                  status: 'succeeded',
                  message: 'user successfully updated'
               });
                  next();
           }).catch(function(err){
              /* failed to update the user  */
              res.status(400).json({
               status:'failed',
               message: 'Committee not found'
              });

              req.err = 'UserController.js, Line: 697\nCan not update the User .\n' + String(err);

              next();
             });
         
        }else{
            /* can't update an admin or (upper board if req.user is upperboard) */
           res.status(403).json({
              status:'failed',
              message: 'Access Denied'
           });

           req.err = 'UserController.js, Line: 662\ncan not update an admin or (upper board if req.user is upperboard) \n'+String(err) ;

           next();
           return ;
        }
     
        }
   }).catch(function(err){
      /* failed to find the user in the database */
      res.status(500).json({
         status:'failed',
         message: 'Internal server error'
      });

      req.err = 'UserController.js, Line: 697\nCan not find the User in the database.\n' + String(err);

      next();
   });
};
