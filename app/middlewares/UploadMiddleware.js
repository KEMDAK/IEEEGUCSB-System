var multer     = require('multer');
var path       = require('path');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var id  =  req.user.id ;
		var dest = path.resolve( '../IEEEGUCSB-System/public/images/'+id);
		cb(null, dest);
	},
	filename: function (req, file, cb) {
		var ext = path.extname(file.originalname);
		cb(null, 'Image'+ext);
	},
	onError: function(err, next){
        console.log("error", err);
        next(err);
    }
});
module.exports.Image =  multer(
	{   storage   : storage ,
		limits    : {fileSize : 1000000	 ,
	                 files    :  1     } ,
		fileFilter: function  (req, file, cb) {

		  var allowedExt = ['.png','.jpg'];
          var ext = path.extname(file.originalname);
          if(allowedExt.indexOf(ext)>=0){
		   cb(null, true)
		  }
		else
          {
            cb(new Error('wrong extention')); 
		  }
	}
	}).single('picture');


module.exports.validate = function(error,req, res, next) {
	    var log  = require('./LogMiddleware');
	    var errors = [];
       if (error) {
      /* input validation failed */
      errors.push({param:'picture',value:error.message,type:'Validity'});
      res.status(400).json({
         status: 'failed',
         errors: errors
      });

      req.err = 'UploadMiddleware.js, Line: 44\n uploading error.\n' + JSON.stringify(errors);
      log.save(req, res);
      
      
   }  
};