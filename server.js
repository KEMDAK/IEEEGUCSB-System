module.exports = function(callback) {

   /* loading the environment variables */
   try{
      require('dotenv').load();
   } catch(error){
      console.log(".env was not found in the root directory.");
   }

   var express          = require('express');
   var app              = express();
   var bodyParser       = require('body-parser');
   var expressValidator = require('express-validator');
   var methodOverride   = require('method-override');
   var db               = require('./config/database/Database');


   // connect to our database and initialize models
   db.initialize(function(sq, err) {
      if (err) {
         console.log('Unable to connect to MySQL duo to: ', err);
         callback(null, null, err);
         process.exit(1);
      } else {
         console.log('Connected successfully to MySQL.');

         //* serving static files */
         app.use(express.static('public/views/'));
         app.use(express.static('public/images/'));
         app.use('/api', express.static('documentation/IEEE_GUC_online_system/' + require('./package.json').version + '/'));
         /* setting up body parser */
         app.use(bodyParser.json());
         app.use(bodyParser.urlencoded({ extended: false }));
         app.use(function (error, req, res, next) {
            if (error instanceof SyntaxError) {
               res.status(400).json({
                  status: 'failed',
                  message: "Enter a valid JSON object."
               });
            } else {
               next();
            }
         });
         /*setting up express-validator package */
         var validators = require('./app/CustomValidators');
         app.use(expressValidator(validators));
         /* setting up the app to accept (DELETE, PUT...etc requests) */
         app.use(methodOverride());

         /* initializing routes */
         require('./app/routes/Routes.js')(app);

         /* listening to requests */
         var port    = (process.env.ENV === 'prod')? 80 : process.env.PORT;
         app.listen(port, function() {
            console.log('Listening on port ' + port + '...');
            callback(app, sq, null);
         });
      }
   });

};
