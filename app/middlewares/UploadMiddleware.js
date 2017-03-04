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
            cb(new Error('wrong file extention')); 
		  }
	}
	}).single('file');


module.exports.validate = function(error,req, res, next) {
	    var log  = require('./LogMiddleware');

       if (error) {
      /* input validation failed */
      res.status(400).json({
         status: 'faileddd',
         error: error.message
      });

      req.err = 'UploadMiddleware.js, Line: 44\n uploading error.\n' + JSON.stringify(error.message);
      log.save(req, res);
     
      
   }  
};