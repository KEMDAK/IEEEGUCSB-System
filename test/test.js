var args = {};

before(function(done) {
   this.timeout(5000);
   process.env.ENV = 'test';
   require('../server')(function(MyApp, sq, err) {
      if (err) {
         console.log('Unable to start Tests.');
         done(err);
      }
      else {
         console.log('Starting Tests...');
         args.app = MyApp;
         args.fn = require('./functions')(sq);
         args.data = require('./data.js')();

         args.models = {
            User : require('../app/models/User').User,
            Meeting : require('../app/models/Meeting').Meeting,
            Task : require('../app/models/Task').Task,
            Committee : require('../app/models/Committee').Committee,
            Identity : require('../app/models/Identity').Identity
         };

         args.fn.clearAll(function(err) {
            if(err)
               done(err);
            else
               done();
         });
      }
   });
});

args.chai = require('chai');
args.chai.use(require('chai-http'));

describe('Meeting Controller', function() {
   require('./MeetingController/store')(args);
});