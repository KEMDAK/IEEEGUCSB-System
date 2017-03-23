var args = {};

before(function(done) {
   this.timeout(40000);

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
         args.sq = sq;

         args.models = {
            User : require('../app/models/User').User,
            Meeting : require('../app/models/Meeting').Meeting,
            Task : require('../app/models/Task').Task,
            Committee : require('../app/models/Committee').Committee,
            Identity : require('../app/models/Identity').Identity,
            Comment : require('../app/models/Comment').Comment,
            Media : require('../app/models/Media').Media,
            Honor : require('../app/models/Honor').Honor
         };

         done();
      }
   });
});

args.chai = require('chai');
args.chai.use(require('chai-http'));

describe('User Controller', function() {
   require('./UserController/index')(args);
   require('./UserController/store')(args);
   require('./UserController/show')(args);
  // require('./UserController/update')(args);
 //  require('./UserController/updateAuth')(args);
   require('./UserController/delete')(args);
});

// describe('Meeting Controller', function() {
//    require('./MeetingController/store')(args);
//    require('./MeetingController/show')(args);
//    require('./MeetingController/update')(args);
//    require('./MeetingController/delete')(args);
//    require('./MeetingController/rate')(args);
// });

// describe('Task Controller', function() {
//    require('./TaskController/store')(args);
//    require('./TaskController/show')(args);
//    require('./TaskController/update')(args);
//    require('./TaskController/delete')(args);
// });

describe('Committee Controller', function() {
   require('./CommitteeController/index')(args);
   require('./CommitteeController/store')(args);
   require('./CommitteeController/show')(args);
   require('./CommitteeController/update')(args);
   require('./CommitteeController/delete')(args);
});
